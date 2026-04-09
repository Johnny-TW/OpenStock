import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Anthropic from '@anthropic-ai/sdk';
import { StockService } from '../stock/stock.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AnalyzeMarketDto,
  AnalysisResultDto,
  StockSnapshotDto,
  TechnicalIndicatorsDto,
  ScoresDto,
  AnalysisFactorDto,
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

interface TwseStockDayResponse {
  stat: string;
  data: string[][];
  fields: string[];
}

interface HistoryRow {
  date: string;
  volume: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TechnicalIndicators {
  ma5: number;
  ma10: number;
  ma20: number;
  ma60: number;
  rsi14: number;
  kValue: number;
  dValue: number;
  avgVolume20: number;
  latestVolume: number;
  volumeRatio: number;
  high20: number;
  low20: number;
  macdLine: number;
  signalLine: number;
  macdHistogram: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  trend: string;
  recentCloses: number[];
}

interface EnrichedStock extends StockSnapshotDto {
  indicators?: TechnicalIndicators;
}

interface ParsedAiResult {
  marketOverview?: string;
  topPicks?: Array<{
    code: string;
    name: string;
    reason: string;
    entryPrice: string;
    stopLoss: string;
    targetPrice: string;
    direction: string;
    signal: string;
    timeframe: string;
    technicalSummary: string;
    scores: {
      fundamental: number;
      technical: number;
      chip: number;
      news: number;
      strategic: number;
      total: number;
    };
    bullishFactors: Array<{
      category: string;
      description: string;
      importance: string;
    }>;
    bearishFactors: Array<{
      category: string;
      description: string;
      importance: string;
    }>;
  }>;
  risks?: string;
  newsImpact?: string;
  technicalOutlook?: string;
}

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly anthropic: Anthropic;

  // TWSE API 的免費端點，偶爾可能會不穩定或有資料延遲，實際使用時可考慮替換為其他資料來源或自行爬取
  private readonly TWSE_DAILY_ALL_URL =
    'https://www.twse.com.tw/exchangeReport/STOCK_DAY_ALL?response=json';
  private readonly TWSE_VALUATION_URL =
    'https://www.twse.com.tw/exchangeReport/BWIBBU_ALL?response=json';
  private readonly TWSE_MARKET_INDEX_URL =
    'https://openapi.twse.com.tw/v1/exchangeReport/MI_INDEX';

  // 預設的 prompt 範本，實際使用時可根據需求進行調整
  constructor(
    private readonly httpService: HttpService,
    private readonly stockService: StockService,
    private readonly prisma: PrismaService,
  ) {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getTodayDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  private isIndividualStock(code: string): boolean {
    return /^\d{4}$/.test(code);
  }

  async getCachedAnalysis(): Promise<AnalysisResultDto | null> {
    const today = this.getTodayDate();

    const cached = await this.prisma.analysisCache.findUnique({
      where: { date: today },
    });
    if (!cached) return null;
    return cached.result as unknown as AnalysisResultDto;
  }

  async analyzeMarket(dto: AnalyzeMarketDto): Promise<AnalysisResultDto> {
    if (!dto.stockCodes || dto.stockCodes.length === 0) {
      const cached = await this.getCachedAnalysis();
      if (cached) {
        this.logger.log('返回今日快取分析結果');
        return cached;
      }
    }

    const [stocks, valuations, news, marketIndex] = await Promise.all([
      this.fetchStocks(),
      this.fetchValuations(),
      this.fetchNews(),
      this.fetchMarketIndex(),
    ]);

    const mergedStocks = this.mergeStockData(stocks, valuations);

    let targetStocks: StockSnapshotDto[];
    if (dto.stockCodes && dto.stockCodes.length > 0) {
      targetStocks = mergedStocks.filter((s) =>
        dto.stockCodes!.includes(s.code),
      );
    } else {
      targetStocks = mergedStocks
        .filter((s) => this.isIndividualStock(s.code))
        .filter((s) => {
          const vol = parseInt(s.tradeVolume?.replace(/,/g, '') ?? '0', 10);
          return vol > 0;
        })
        .sort((a, b) => {
          const volA = parseInt(a.tradeVolume?.replace(/,/g, '') ?? '0', 10);
          const volB = parseInt(b.tradeVolume?.replace(/,/g, '') ?? '0', 10);
          return volB - volA;
        })
        .slice(0, 30);
    }

    const enrichedStocks = await this.enrichWithTechnicals(targetStocks);

    const result = await this.callAI(enrichedStocks, news, marketIndex);

    if (!dto.stockCodes || dto.stockCodes.length === 0) {
      const today = this.getTodayDate();

      await this.prisma.analysisCache
        .upsert({
          where: { date: today },
          update: {
            result: JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue,
          },
          create: {
            date: today,
            result: JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue,
          },
        })
        .catch((e: unknown) => this.logger.warn('快取儲存失敗', e));
    }

    return result;
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

  private async fetchNews(): Promise<{
    twStock: string[];
    usStock: string[];
    international: string[];
    twse: string[];
  }> {
    try {
      const allNews = await this.stockService.getAllNews();
      const format = (items: { title: string; summary?: string }[]) =>
        items.slice(0, 15).map((n) => {
          const summary =
            n.summary && n.summary.length > 100
              ? n.summary.slice(0, 100) + '...'
              : (n.summary ?? '');
          return summary ? `${n.title}：${summary}` : n.title;
        });
      return {
        twStock: format(allNews.twStock?.data ?? []),
        usStock: format(allNews.usStock?.data ?? []),
        international: format(allNews.international?.data ?? []),
        twse: format(allNews.twse?.data ?? []),
      };
    } catch {
      this.logger.warn('無法取得多源新聞資料');
      return { twStock: [], usStock: [], international: [], twse: [] };
    }
  }

  private async fetchMarketIndex(): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<Record<string, string>[]>(
          this.TWSE_MARKET_INDEX_URL,
        ),
      );
      if (!Array.isArray(data)) return '';
      return data
        .slice(0, 5)
        .map((row) => {
          const name = row['指數'] ?? '';
          const close = row['收盤指數'] ?? '';
          const change = row['漲跌點數'] ?? '';
          return `${name}：${close}（漲跌 ${change}）`;
        })
        .join('\n');
    } catch {
      this.logger.warn('無法取得大盤指數');
      return '';
    }
  }

  private async fetchStockHistory(code: string): Promise<HistoryRow[]> {
    const rows: HistoryRow[] = [];
    const now = new Date();

    const months: { year: number; month: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    for (const { year, month } of months) {
      try {
        const dateStr = `${year}${String(month).padStart(2, '0')}01`;
        const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${dateStr}&stockNo=${code}`;
        const { data } = await firstValueFrom(
          this.httpService.get<TwseStockDayResponse>(url),
        );
        if (data.stat !== 'OK' || !data.data) continue;
        for (const row of data.data) {
          const volume = parseInt(row[1]?.replace(/,/g, '') ?? '0', 10);
          const open = parseFloat(row[3]?.replace(/,/g, '') ?? '0');
          const high = parseFloat(row[4]?.replace(/,/g, '') ?? '0');
          const low = parseFloat(row[5]?.replace(/,/g, '') ?? '0');
          const close = parseFloat(row[6]?.replace(/,/g, '') ?? '0');
          if (close > 0) {
            rows.push({ date: row[0], volume, open, high, low, close });
          }
        }
      } catch {
        this.logger.warn(`無法取得 ${code} 的歷史資料（${year}/${month}）`);
      }
    }

    rows.sort((a, b) => a.date.localeCompare(b.date));
    return rows;
  }

  private calculateIndicators(
    history: HistoryRow[],
  ): TechnicalIndicators | undefined {
    if (history.length < 20) return undefined;

    const closes = history.map((h) => h.close);
    const volumes = history.map((h) => h.volume);
    const len = closes.length;

    const ma = (period: number) => {
      if (len < period) return 0;
      const slice = closes.slice(len - period);
      return slice.reduce((a, b) => a + b, 0) / period;
    };

    const ma5 = ma(5);
    const ma10 = ma(10);
    const ma20 = ma(20);
    const ma60 = len >= 60 ? ma(60) : 0;

    // RSI 14
    let gains = 0;
    let losses = 0;
    const rsiPeriod = 14;
    const rsiStart = Math.max(0, len - rsiPeriod - 1);
    for (let i = rsiStart + 1; i < len; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const avgGain = gains / rsiPeriod;
    const avgLoss = losses / rsiPeriod;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi14 = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

    // 成交量
    const vol20 = volumes.slice(len - 20);
    const avgVolume20 = vol20.reduce((a, b) => a + b, 0) / 20;
    const latestVolume = volumes[len - 1];
    const volumeRatio = avgVolume20 > 0 ? latestVolume / avgVolume20 : 0;

    // 近 20 日高低點
    const recent20 = history.slice(len - 20);
    const high20 = Math.max(...recent20.map((h) => h.high));
    const low20 = Math.min(...recent20.map((h) => h.low));

    // MACD (12, 26, 9)
    const ema = (data: number[], period: number): number[] => {
      const k = 2 / (period + 1);
      const result: number[] = [data[0]];
      for (let i = 1; i < data.length; i++) {
        result.push(data[i] * k + result[i - 1] * (1 - k));
      }
      return result;
    };

    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const macdLineArr = ema12.map((v, i) => v - ema26[i]);
    const signalArr = ema(macdLineArr, 9);

    const macdLine = macdLineArr[len - 1];
    const signalLine = signalArr[len - 1];
    const macdHistogram = macdLine - signalLine;

    // KD 隨機指標 (9, 3, 3)
    const kdPeriod = 9;
    let kValue = 50;
    let dValue = 50;
    for (let i = Math.max(kdPeriod - 1, 0); i < len; i++) {
      const sliceH = history.slice(Math.max(0, i - kdPeriod + 1), i + 1);
      const highN = Math.max(...sliceH.map((h) => h.high));
      const lowN = Math.min(...sliceH.map((h) => h.low));
      const rsv =
        highN === lowN ? 50 : ((closes[i] - lowN) / (highN - lowN)) * 100;
      kValue = (2 / 3) * kValue + (1 / 3) * rsv;
      dValue = (2 / 3) * dValue + (1 / 3) * kValue;
    }

    // 布林通道 (20, 2)
    const bb20 = closes.slice(len - 20);
    const bbMean = bb20.reduce((a, b) => a + b, 0) / 20;
    const bbStdDev = Math.sqrt(
      bb20.reduce((sum, v) => sum + (v - bbMean) ** 2, 0) / 20,
    );
    const bollingerUpper = bbMean + 2 * bbStdDev;
    const bollingerMiddle = bbMean;
    const bollingerLower = bbMean - 2 * bbStdDev;

    // 均線排列趨勢
    let trend = '盤整';
    if (ma60 > 0 && ma5 > ma10 && ma10 > ma20 && ma20 > ma60)
      trend = '多頭排列';
    else if (ma60 > 0 && ma5 < ma10 && ma10 < ma20 && ma20 < ma60)
      trend = '空頭排列';

    // 近 60 日收盤價（用於走勢圖）
    const recentCloses = closes
      .slice(Math.max(0, len - 60))
      .map((c) => Math.round(c * 100) / 100);

    return {
      ma5: Math.round(ma5 * 100) / 100,
      ma10: Math.round(ma10 * 100) / 100,
      ma20: Math.round(ma20 * 100) / 100,
      ma60: Math.round(ma60 * 100) / 100,
      rsi14: Math.round(rsi14 * 100) / 100,
      avgVolume20: Math.round(avgVolume20),
      latestVolume,
      volumeRatio: Math.round(volumeRatio * 100) / 100,
      high20: Math.round(high20 * 100) / 100,
      low20: Math.round(low20 * 100) / 100,
      macdLine: Math.round(macdLine * 100) / 100,
      signalLine: Math.round(signalLine * 100) / 100,
      macdHistogram: Math.round(macdHistogram * 100) / 100,
      kValue: Math.round(kValue * 100) / 100,
      dValue: Math.round(dValue * 100) / 100,
      bollingerUpper: Math.round(bollingerUpper * 100) / 100,
      bollingerMiddle: Math.round(bollingerMiddle * 100) / 100,
      bollingerLower: Math.round(bollingerLower * 100) / 100,
      trend,
      recentCloses,
    };
  }

  private async enrichWithTechnicals(
    stocks: StockSnapshotDto[],
  ): Promise<EnrichedStock[]> {
    const batchSize = 5;
    const enriched: EnrichedStock[] = [];

    for (let i = 0; i < stocks.length; i += batchSize) {
      if (i > 0) await this.delay(300);
      const batch = stocks.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (stock) => {
          try {
            const history = await this.fetchStockHistory(stock.code);
            const indicators = this.calculateIndicators(history);
            return { ...stock, indicators };
          } catch {
            this.logger.warn(`無法計算 ${stock.code} 技術指標`);
            return { ...stock };
          }
        }),
      );
      enriched.push(...results);
    }

    return enriched;
  }

  private async callAI(
    stocks: EnrichedStock[],
    news: {
      twStock: string[];
      usStock: string[];
      international: string[];
      twse: string[];
    },
    marketIndex: string,
  ): Promise<AnalysisResultDto> {
    const stockSummary = stocks
      .map((s) => {
        let line = `${s.code} ${s.name}: 收盤${s.closingPrice} 漲跌${s.change} 成交量${s.tradeVolume} 本益比${s.peRatio ?? 'N/A'} 殖利率${s.dividendYield ?? 'N/A'}%`;
        if (s.indicators) {
          const ind = s.indicators;
          line += `\n  均線: MA5=${ind.ma5} MA10=${ind.ma10} MA20=${ind.ma20} MA60=${ind.ma60} 趨勢=${ind.trend}`;
          line += `\n  RSI14=${ind.rsi14} KD: K=${ind.kValue} D=${ind.dValue}`;
          line += `\n  MACD=${ind.macdLine} Signal=${ind.signalLine} Histogram=${ind.macdHistogram}`;
          line += `\n  布林通道: 上=${ind.bollingerUpper} 中=${ind.bollingerMiddle} 下=${ind.bollingerLower}`;
          line += `\n  量比=${ind.volumeRatio}(今量${ind.latestVolume}/均量${ind.avgVolume20}) 20日高=${ind.high20} 20日低=${ind.low20}`;
          line += `\n  近五日收盤: ${ind.recentCloses.slice(-5).join(' → ')}`;
        }
        return line;
      })
      .join('\n\n');

    const twStockNews =
      news.twStock.length > 0 ? news.twStock.join('\n') : '（目前無台股新聞）';
    const usStockNews =
      news.usStock.length > 0 ? news.usStock.join('\n') : '（目前無美股新聞）';
    const internationalNews =
      news.international.length > 0
        ? news.international.join('\n')
        : '（目前無國際財經新聞）';
    const twseNews =
      news.twse.length > 0 ? news.twse.join('\n') : '（目前無證交所公告）';

    const systemPrompt = `你是一位擁有 20 年經驗的台灣股市專業投資分析師與技術分析專家。
你精通以下分析方法：
- 技術分析：均線系統（MA5/10/20/60）、RSI、KD隨機指標、MACD、布林通道、成交量分析、支撐壓力位
- 基本面分析：本益比、殖利率、營收成長
- 籌碼面分析：成交量變化、量價關係、法人買賣超
- 新聞面分析：台股新聞、美股動態、國際財經趨勢、證交所公告、地緣政治風險、政策影響
- 戰略面分析：產業定位、競爭優勢、長期發展

你的分析框架：
1. 先判斷大盤趨勢方向（多頭/空頭/盤整），確認系統性風險
2. 從基本面、技術面、籌碼面、新聞面、戰略面五個維度給每檔股票打分（0-100）
3. 用 RSI + KD 確認超買超賣狀態，避免追高殺低
4. 用 MACD 交叉確認趨勢轉折點
5. 用布林通道判斷波動率與突破訊號
6. 結合近五日走勢判斷短期動能方向
7. 以 20 日高低點設定支撐壓力，計算進退場價位
8. 綜合分析後給出看多與看空因素，標記重要程度

你的分析風格：
- 嚴謹且保守，不輕易推薦
- 明確給出進退場價位與停損點
- 每個評分必須有具體理由支撐
- 看多看空因素要具體引用數據
- 停損價通常設在支撐位下方 2-3%，目標價設在壓力位`;

    const prompt = `請根據以下台股即時資料、技術指標與多來源新聞，產出完整的投資分析報告。

「大盤指數」
${marketIndex || '（目前無大盤資料）'}

「今日個股資料與技術指標」
${stockSummary}

「台股新聞」（Yahoo 奇摩股市）
${twStockNews}

「美股新聞」（Google News）
${usStockNews}

「國際財經新聞」（Google News）
${internationalNews}

「證交所公告」（TWSE）
${twseNews}

請以 JSON 格式回覆，結構如下：
{
  "marketOverview": "整體市場概況分析，包含大盤趨勢判斷、均線排列、量能狀況（300字內，繁體中文）",
  "topPicks": [
    {
      "code": "股票代號",
      "name": "股票名稱",
      "reason": "綜合推薦理由摘要（100字內）",
      "direction": "偏多 / 中性 / 偏空（三選一）",
      "scores": {
        "fundamental": 0-100,
        "technical": 0-100,
        "chip": 0-100,
        "news": 0-100,
        "strategic": 0-100,
        "total": 0-100
      },
      "bullishFactors": [
        { "category": "題材 / 基本 / 技術 / 籌碼 / 新聞（五選一）", "description": "看多原因的具體描述，須引用數據（150字內）", "importance": "重要 / 一般" }
      ],
      "bearishFactors": [
        { "category": "題材 / 基本 / 技術 / 籌碼 / 新聞（五選一）", "description": "看空原因的具體描述，須引用數據（150字內）", "importance": "重要 / 一般" }
      ],
      "entryPrice": "建議進場價位（具體數字）",
      "stopLoss": "建議停損價位（支撐位下方 2-3%）",
      "targetPrice": "目標價位（壓力位或布林上軌）",
      "signal": "強烈買進 / 買進 / 觀望 / 賣出 / 強烈賣出（五選一）",
      "timeframe": "短線(1-5日) / 波段(1-4週) / 長期(1月以上)（三選一）",
      "technicalSummary": "技術面關鍵訊號摘要（80字內）"
    }
  ],
  "risks": "當前主要風險提示，含具體數據佐證（200字內，繁體中文）",
  "newsImpact": "國際新聞對台股的潛在影響分析（200字內，繁體中文）",
  "technicalOutlook": "整體技術面展望（250字內，繁體中文）"
}

評分規則：
- fundamental（基本面）：根據本益比、殖利率、營收成長趨勢評分
- technical（技術面）：根據均線排列、RSI、KD、MACD、布林通道等判斷
- chip（籌碼面）：根據成交量變化、量比、量價配合度判斷
- news（新聞面）：根據相關產業新聞、政策利多利空判斷
- strategic（戰略面）：根據產業趨勢、公司競爭定位、長線發展潛力
- total（綜合）：五維度加權，技術面與籌碼面各佔 25%，基本面 20%，新聞面 15%，戰略面 15%
- 80 分以上為強力推薦，60-79 為一般推薦，60 以下為觀望
- direction：total >= 70 為偏多，50-69 為中性，< 50 為偏空

看多/看空因素規則：
- bullishFactors 列出 2-3 個看多因素，每個須具體引用數據
- bearishFactors 列出 1-2 個看空因素（風險提示）
- category 為分類標籤：題材 / 基本 / 技術 / 籌碼 / 新聞（五選一）
- importance 標記為 "重要" 或 "一般"

其他規則：
- topPicks 依 total 分數由高到低排序，列出 10-15 檔
- 進場價、停損價、目標價必須是具體數字
- signal 訊號必須與技術指標一致（如 RSI>70 且 K>80 不應給買進訊號）
- 所有文字使用繁體中文
- 只回傳 JSON，不要加任何前後說明`;

    const completion = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = completion.content.find((b) => b.type === 'text');
    const rawText = textBlock && 'text' in textBlock ? textBlock.text : '{}';
    const jsonStr = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
    const parsed = JSON.parse(jsonStr) as ParsedAiResult;

    const stockMap = new Map(stocks.map((s) => [s.code, s]));

    const defaultScores: ScoresDto = {
      fundamental: 0,
      technical: 0,
      chip: 0,
      news: 0,
      strategic: 0,
      total: 0,
    };

    return {
      marketOverview: parsed.marketOverview ?? '',
      topPicks: (parsed.topPicks ?? []).map((p) => {
        const match = stockMap.get(p.code ?? '');
        const ind = match?.indicators;
        const indicators: TechnicalIndicatorsDto | undefined = ind
          ? {
              ma5: ind.ma5,
              ma10: ind.ma10,
              ma20: ind.ma20,
              ma60: ind.ma60,
              rsi14: ind.rsi14,
              kValue: ind.kValue,
              dValue: ind.dValue,
              macdLine: ind.macdLine,
              signalLine: ind.signalLine,
              macdHistogram: ind.macdHistogram,
              bollingerUpper: ind.bollingerUpper,
              bollingerMiddle: ind.bollingerMiddle,
              bollingerLower: ind.bollingerLower,
              volumeRatio: ind.volumeRatio,
              high20: ind.high20,
              low20: ind.low20,
              trend: ind.trend,
              recentCloses: ind.recentCloses,
            }
          : undefined;
        const scores: ScoresDto = p.scores
          ? {
              fundamental: p.scores.fundamental ?? 0,
              technical: p.scores.technical ?? 0,
              chip: p.scores.chip ?? 0,
              news: p.scores.news ?? 0,
              strategic: p.scores.strategic ?? 0,
              total: p.scores.total ?? 0,
            }
          : defaultScores;
        const bullishFactors: AnalysisFactorDto[] = (
          p.bullishFactors ?? []
        ).map((f) => ({
          category: f.category ?? '基本',
          description: f.description ?? '',
          importance: f.importance ?? '一般',
        }));
        const bearishFactors: AnalysisFactorDto[] = (
          p.bearishFactors ?? []
        ).map((f) => ({
          category: f.category ?? '基本',
          description: f.description ?? '',
          importance: f.importance ?? '一般',
        }));
        return {
          code: p.code ?? '',
          name: p.name ?? '',
          reason: p.reason ?? '',
          entryPrice: p.entryPrice ?? '',
          stopLoss: p.stopLoss ?? '',
          targetPrice: p.targetPrice ?? '',
          direction: p.direction ?? '中性',
          signal: p.signal ?? '觀望',
          timeframe: p.timeframe ?? '',
          technicalSummary: p.technicalSummary ?? '',
          scores,
          bullishFactors,
          bearishFactors,
          indicators,
        };
      }),
      risks: parsed.risks ?? '',
      newsImpact: parsed.newsImpact ?? '',
      technicalOutlook: parsed.technicalOutlook ?? '',
      generatedAt: new Date().toISOString(),
    };
  }
}
