import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Anthropic from '@anthropic-ai/sdk';
import {
  AnalyzeMarketDto,
  AnalysisResultDto,
  StockSnapshotDto,
} from './dto/analysis.dto';

interface TwseDailyResponse {
  stat: string;
  date: string;
  data: string[][];
}

interface TwseValuationResponse {
  stat: string;
  data: string[][];
}

interface TwseNewsItem {
  Title?: string;
  Content?: string;
}

interface ParsedAiResult {
  marketOverview?: string;
  topPicks?: Array<{ code: string; name: string; reason: string }>;
  risks?: string;
  newsImpact?: string;
}

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly anthropic: Anthropic;

  private readonly TWSE_DAILY_ALL_URL =
    'https://www.twse.com.tw/exchangeReport/STOCK_DAY_ALL?response=json';
  private readonly TWSE_VALUATION_URL =
    'https://www.twse.com.tw/exchangeReport/BWIBBU_ALL?response=json';
  private readonly TWSE_NEWS_URL =
    'https://openapi.twse.com.tw/v1/news/newsList';

  constructor(private readonly httpService: HttpService) {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async analyzeMarket(dto: AnalyzeMarketDto): Promise<AnalysisResultDto> {
    const [stocks, valuations, news] = await Promise.all([
      this.fetchStocks(),
      this.fetchValuations(),
      this.fetchNews(),
    ]);

    const mergedStocks = this.mergeStockData(stocks, valuations);

    const targetStocks =
      dto.stockCodes && dto.stockCodes.length > 0
        ? mergedStocks.filter((s) => dto.stockCodes!.includes(s.code))
        : mergedStocks.slice(0, 30);

    return this.callAI(targetStocks, news);
  }

  private async fetchStocks(): Promise<StockSnapshotDto[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<TwseDailyResponse>(this.TWSE_DAILY_ALL_URL),
      );
      if (data.stat !== 'OK') return [];
      return data.data.map((row) => ({
        code: row[0],
        name: row[1],
        tradeVolume: row[2],
        closingPrice: row[7],
        change: row[8],
      }));
    } catch {
      this.logger.warn('無法取得台股日成交資料');
      return [];
    }
  }

  private async fetchValuations(): Promise<
    Record<string, { peRatio: string; dividendYield: string }>
  > {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<TwseValuationResponse>(this.TWSE_VALUATION_URL),
      );
      if (data.stat !== 'OK') return {};
      const map: Record<string, { peRatio: string; dividendYield: string }> =
        {};
      for (const row of data.data) {
        map[row[0]] = { peRatio: row[4], dividendYield: row[2] };
      }
      return map;
    } catch {
      this.logger.warn('無法取得估值資料');
      return {};
    }
  }

  private mergeStockData(
    stocks: StockSnapshotDto[],
    valuations: Record<string, { peRatio: string; dividendYield: string }>,
  ): StockSnapshotDto[] {
    return stocks.map((s) => ({
      ...s,
      peRatio: valuations[s.code]?.peRatio,
      dividendYield: valuations[s.code]?.dividendYield,
    }));
  }

  private async fetchNews(): Promise<string[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<TwseNewsItem[]>(this.TWSE_NEWS_URL),
      );
      if (!Array.isArray(data)) return [];
      return data
        .slice(0, 15)
        .map((item) => item.Title ?? '')
        .filter(Boolean);
    } catch {
      this.logger.warn('無法取得 TWSE 新聞資料');
      return [];
    }
  }

  private async callAI(
    stocks: StockSnapshotDto[],
    news: string[],
  ): Promise<AnalysisResultDto> {
    const stockSummary = stocks
      .map(
        (s) =>
          `${s.code} ${s.name}: 收盤${s.closingPrice} 漲跌${s.change} 本益比${s.peRatio ?? 'N/A'} 殺利率${s.dividendYield ?? 'N/A'}%`,
      )
      .join('\n');

    const newsSummary =
      news.length > 0 ? news.join('\n') : '（目前無國際新聞資料）';

    const prompt = `你是一位台灣股市的專業投資分析師，請根據以下資料提供分析報告。

「今日股市資料」
${stockSummary}

「近期國際新聞」
${newsSummary}

請以 JSON 格式回覆，結構如下：
{
  "marketOverview": "整體市場概況分析（200字內，繁體中文）",
  "topPicks": [
    {"code": "股票代號", "name": "股票名稱", "reason": "推薦理由（50字內）"}
  ],
  "risks": "當前主要風險提示（150字內，繁體中文）",
  "newsImpact": "國際新聞對台股的潛在影響分析（150字內，繁體中文）"
}

重要事項：
- topPicks 列出 3-5 檔値得關注的股票
- 所有文字使用繁體中文
- 只回傳 JSON，不要加任何前後說明`;

    const completion = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = completion.content.find((b) => b.type === 'text');
    const rawText = textBlock && 'text' in textBlock ? textBlock.text : '{}';
    const jsonStr = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
    const parsed = JSON.parse(jsonStr) as ParsedAiResult;

    return {
      marketOverview: parsed.marketOverview ?? '',
      topPicks: parsed.topPicks ?? [],
      risks: parsed.risks ?? '',
      newsImpact: parsed.newsImpact ?? '',
      generatedAt: new Date().toISOString(),
    };
  }
}
