import Anthropic from '@anthropic-ai/sdk';
import { ChatAnthropic } from '@langchain/anthropic';
import { AIMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CallbackHandler } from 'langfuse-langchain';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';
import { EmbeddingService } from '../embedding/embedding.service';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
import {
  AnalysisFactorDto,
  AnalysisResultDto,
  AnalyzeMarketDto,
  ChatMessageDto,
  ScoresDto,
  StockSnapshotDto,
  TechnicalIndicatorsDto,
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
  recentDates: string[];
  momentum5d: number;
  momentum10d: number;
  momentum20d: number;
  candlePatterns: string[];
  supportLevel: number;
  resistanceLevel: number;
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
  private readonly TWSE_MARKET_INDEX_URL = 'https://openapi.twse.com.tw/v1/exchangeReport/MI_INDEX';

  constructor(
    private readonly httpService: HttpService,
    private readonly stockService: StockService,
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
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

  private extractJson(rawText: string): string {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return rawText.slice(start, end + 1);
    }
    return rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
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

    const [stocks, valuations, news, marketIndex, institutional, industryMap, monthlyRevenue] =
      await Promise.all([
        this.fetchStocks(),
        this.fetchValuations(),
        this.fetchNews(),
        this.fetchMarketIndex(),
        this.fetchInstitutional(),
        this.fetchIndustryMap(),
        this.fetchMonthlyRevenue(),
      ]);

    const mergedStocks = this.mergeStockData(stocks, valuations, industryMap, monthlyRevenue);

    let targetStocks: StockSnapshotDto[];
    if (dto.stockCodes && dto.stockCodes.length > 0) {
      targetStocks = mergedStocks.filter((s) => dto.stockCodes!.includes(s.code));
    } else {
      targetStocks = this.selectCandidates(mergedStocks, institutional);
    }

    const enrichedStocks = await this.enrichWithTechnicals(targetStocks);

    const marketChangePercent = this.parseMarketChangePercent(marketIndex);
    const stocksWithRelativeStrength = enrichedStocks.map((s) => {
      const close = parseFloat(s.closingPrice?.replace(/,/g, '') ?? '0');
      const change = parseFloat(s.change?.replace(/,/g, '') ?? '0');
      const prev = close - change;
      const stockPct = prev > 0 ? (change / prev) * 100 : 0;
      return {
        ...s,
        relativeStrength: Math.round((stockPct - marketChangePercent) * 100) / 100,
      };
    });

    const allNews = [
      ...news.twStock.map((n) => n),
      ...news.usStock.map((n) => n),
      ...news.international.map((n) => n),
      ...news.twse.map((n) => n),
    ];

    void this.storeNewsEmbeddings([
      ...news.twStock.map((title) => ({ title, source: 'twStock' })),
      ...news.usStock.map((title) => ({ title, source: 'usStock' })),
      ...news.international.map((title) => ({ title, source: 'international' })),
      ...news.twse.map((title) => ({ title, source: 'twse' })),
    ]).catch((e: unknown) => this.logger.warn('新聞向量儲存失敗', e));

    const result = await this.callAI(
      stocksWithRelativeStrength,
      news,
      marketIndex,
      institutional,
      allNews,
    );

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
      const map: Record<string, { peRatio: string; dividendYield: string }> = {};
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
    industryMap: Map<string, string>,
    monthlyRevenue: Map<string, { revenue: number; yoyGrowth: number }>,
  ): StockSnapshotDto[] {
    return stocks.map((s) => ({
      ...s,
      peRatio: valuations[s.code]?.peRatio,
      dividendYield: valuations[s.code]?.dividendYield,
      industry: industryMap.get(s.code) ?? '',
      revenueYoY: monthlyRevenue.get(s.code)?.yoyGrowth,
    }));
  }

  private selectCandidates(stocks: StockSnapshotDto[], institutional: string): StockSnapshotDto[] {
    const validStocks = stocks
      .filter((s) => this.isIndividualStock(s.code))
      .filter((s) => parseInt(s.tradeVolume?.replace(/,/g, '') ?? '0', 10) > 0);

    const byVolume = [...validStocks]
      .sort((a, b) => {
        const volA = parseInt(a.tradeVolume?.replace(/,/g, '') ?? '0', 10);
        const volB = parseInt(b.tradeVolume?.replace(/,/g, '') ?? '0', 10);
        return volB - volA;
      })
      .slice(0, 25);

    const byChange = [...validStocks]
      .map((s) => {
        const close = parseFloat(s.closingPrice?.replace(/,/g, '') ?? '0');
        const change = parseFloat(s.change?.replace(/,/g, '') ?? '0');
        const prev = close - change;
        const pct = prev > 0 ? Math.abs(change / prev) * 100 : 0;
        return { stock: s, absPct: pct };
      })
      .sort((a, b) => b.absPct - a.absPct)
      .slice(0, 15)
      .map((r) => r.stock);

    const institutionalCodes = new Set<string>();
    for (const line of institutional.split('\n')) {
      const match = line.match(/^(\d{4})\s/);
      if (match) institutionalCodes.add(match[1]);
    }
    const byInstitutional = validStocks.filter((s) => institutionalCodes.has(s.code)).slice(0, 20);

    const seen = new Set<string>();
    const result: StockSnapshotDto[] = [];
    for (const s of [...byVolume, ...byChange, ...byInstitutional]) {
      if (!seen.has(s.code)) {
        seen.add(s.code);
        result.push(s);
      }
    }

    return result.slice(0, 50);
  }

  private async fetchIndustryMap(): Promise<Map<string, string>> {
    try {
      return await this.stockService.getIndustryMapPublic();
    } catch {
      this.logger.warn('無法取得產業別資料');
      return new Map();
    }
  }

  private async fetchMonthlyRevenue(): Promise<
    Map<string, { revenue: number; yoyGrowth: number }>
  > {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<Record<string, string>[]>(
          'https://openapi.twse.com.tw/v1/opendata/t187ap05_L',
        ),
      );
      const map = new Map<string, { revenue: number; yoyGrowth: number }>();
      for (const row of data) {
        const code = row.公司代號?.trim();
        if (!code) continue;
        const revenue = parseFloat(row.當月營收?.replace(/,/g, '') ?? '0') || 0;
        const yoyGrowth = parseFloat(row['去年同月增減(%)']?.replace(/,/g, '') ?? '0') || 0;
        map.set(code, { revenue, yoyGrowth });
      }
      return map;
    } catch {
      this.logger.warn('無法取得月營收資料');
      return new Map();
    }
  }

  private parseMarketChangePercent(marketIndex: string): number {
    const lines = marketIndex.split('\n');
    for (const line of lines) {
      if (line.includes('發行量加權')) {
        const match = line.match(/漲跌\s*([-\d.]+)/);
        const closeMatch = line.match(/:([\d,.]+)/);
        if (match && closeMatch) {
          const change = parseFloat(match[1]);
          const close = parseFloat(closeMatch[1].replace(/,/g, ''));
          const prev = close - change;
          return prev > 0 ? (change / prev) * 100 : 0;
        }
      }
    }
    return 0;
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
              ? `${n.summary.slice(0, 100)}...`
              : (n.summary ?? '');
          return summary ? `${n.title}:${summary}` : n.title;
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

  private async storeNewsEmbeddings(
    news: { title: string; summary?: string; source: string }[],
  ): Promise<void> {
    const today = this.getTodayDate();
    const existing = await this.prisma.newsEmbedding.count({
      where: { fetchedAt: { gte: new Date(today) } },
    });
    if (existing > 0) return;

    const texts = news.map((n) => `${n.title} ${n.summary ?? ''}`);
    const embeddings = await this.embeddingService.embedBatch(texts);

    await Promise.all(
      news.map(
        (n, i) =>
          this.prisma.$executeRaw`
          INSERT INTO "NewsEmbedding" (title, summary, source, "fetchedAt", embedding)
          VALUES (${n.title}, ${n.summary ?? ''}, ${n.source}, NOW(),
                  ${JSON.stringify(embeddings[i])}::vector)
        `,
      ),
    );
    this.logger.log(`已儲存 ${news.length} 則新聞向量`);
  }

  private async findRelatedNews(
    stockCode: string,
    stockName: string,
    industry: string,
  ): Promise<string[]> {
    try {
      const query = `${stockCode} ${stockName} ${industry}`;
      const embedding = await this.embeddingService.embed(query);
      const results = await this.prisma.$queryRaw<{ title: string; summary: string }[]>`
        SELECT title, summary
        FROM "NewsEmbedding"
        ORDER BY embedding <=> ${JSON.stringify(embedding)}::vector
        LIMIT 5
      `;
      return results.map((r) => (r.summary ? `${r.title}:${r.summary}` : r.title));
    } catch {
      this.logger.warn(`向量搜尋失敗，改用關鍵字配對 (${stockCode})`);
      return [];
    }
  }

  private async fetchMarketIndex(): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<Record<string, string>[]>(this.TWSE_MARKET_INDEX_URL),
      );
      if (!Array.isArray(data)) return '';
      return data
        .slice(0, 5)
        .map((row) => {
          const name = row.指數 ?? '';
          const close = row.收盤指數 ?? '';
          const change = row.漲跌點數 ?? '';
          return `${name}:${close}(漲跌 ${change})`;
        })
        .join('\n');
    } catch {
      this.logger.warn('無法取得大盤指數');
      return '';
    }
  }

  private async fetchInstitutional(): Promise<string> {
    try {
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const url = `https://www.twse.com.tw/fund/T86?response=json&date=${dateStr}&selectType=ALL`;
      const { data } = await firstValueFrom(
        this.httpService.get<{ stat: string; data?: string[][] }>(url),
      );
      if (data.stat !== 'OK' || !data.data) return '';
      const top20 = data.data.slice(0, 20).map((row) => {
        const code = row[0]?.trim();
        const name = row[1]?.trim();
        const foreign = row[2]?.trim();
        const trust = row[3]?.trim();
        const dealer = row[4]?.trim();
        const total = row[5]?.trim();
        return `${code} ${name}: 外資${foreign} 投信${trust} 自營${dealer} 合計${total}`;
      });
      return top20.join('\n');
    } catch {
      this.logger.warn('無法取得三大法人買賣超資料');
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
        const { data } = await firstValueFrom(this.httpService.get<TwseStockDayResponse>(url));
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
        this.logger.warn(`無法取得 ${code} 的歷史資料(${year}/${month})`);
      }
    }

    rows.sort((a, b) => a.date.localeCompare(b.date));
    return rows;
  }

  private calculateIndicators(history: HistoryRow[]): TechnicalIndicators | undefined {
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
      const rsv = highN === lowN ? 50 : ((closes[i] - lowN) / (highN - lowN)) * 100;
      kValue = (2 / 3) * kValue + (1 / 3) * rsv;
      dValue = (2 / 3) * dValue + (1 / 3) * kValue;
    }

    // 布林通道 (20, 2)
    const bb20 = closes.slice(len - 20);
    const bbMean = bb20.reduce((a, b) => a + b, 0) / 20;
    const bbStdDev = Math.sqrt(bb20.reduce((sum, v) => sum + (v - bbMean) ** 2, 0) / 20);
    const bollingerUpper = bbMean + 2 * bbStdDev;
    const bollingerMiddle = bbMean;
    const bollingerLower = bbMean - 2 * bbStdDev;

    // 均線排列趨勢
    let trend = '盤整';
    if (ma60 > 0 && ma5 > ma10 && ma10 > ma20 && ma20 > ma60) trend = '多頭排列';
    else if (ma60 > 0 && ma5 < ma10 && ma10 < ma20 && ma20 < ma60) trend = '空頭排列';

    // 近 30 日收盤價(約一個月，用於走勢圖)
    const sliceStart = Math.max(0, len - 30);
    const recentCloses = closes.slice(sliceStart).map((c) => Math.round(c * 100) / 100);
    const recentDates = history.slice(sliceStart).map((h) => h.date);

    // 動能指標(漲跌幅%)
    const momentum5d = len >= 6 ? ((closes[len - 1] - closes[len - 6]) / closes[len - 6]) * 100 : 0;
    const momentum10d =
      len >= 11 ? ((closes[len - 1] - closes[len - 11]) / closes[len - 11]) * 100 : 0;
    const momentum20d =
      len >= 21 ? ((closes[len - 1] - closes[len - 21]) / closes[len - 21]) * 100 : 0;

    // K 線形態辨識
    const candlePatterns = this.detectCandlePatterns(history);

    // 支撐壓力位計算
    const { support: supportLevel, resistance: resistanceLevel } =
      this.calculateSupportResistance(history);

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
      recentDates,
      momentum5d: Math.round(momentum5d * 100) / 100,
      momentum10d: Math.round(momentum10d * 100) / 100,
      momentum20d: Math.round(momentum20d * 100) / 100,
      candlePatterns,
      supportLevel,
      resistanceLevel,
    };
  }

  private detectCandlePatterns(history: HistoryRow[]): string[] {
    const patterns: string[] = [];
    const len = history.length;
    if (len < 3) return patterns;

    const last = history[len - 1];
    const prev = history[len - 2];
    const prev2 = history[len - 3];

    const bodySize = (h: HistoryRow) => Math.abs(h.close - h.open);
    const upperShadow = (h: HistoryRow) => h.high - Math.max(h.open, h.close);
    const lowerShadow = (h: HistoryRow) => Math.min(h.open, h.close) - h.low;
    const range = (h: HistoryRow) => h.high - h.low;

    // 十字線 (Doji)
    if (range(last) > 0 && bodySize(last) / range(last) < 0.1) {
      patterns.push('十字線');
    }

    // 錘子線 (Hammer) - 下影線長、實體小、出現在低點
    if (lowerShadow(last) > bodySize(last) * 2 && upperShadow(last) < bodySize(last) * 0.5) {
      if (last.close < prev.close) patterns.push('錘子線(潛在反轉)');
    }

    // 吊人線 (Hanging Man) - 類似錘子但出現在高點
    if (lowerShadow(last) > bodySize(last) * 2 && upperShadow(last) < bodySize(last) * 0.5) {
      if (last.close > prev.close && prev.close > prev2.close) patterns.push('吊人線(潛在見頂)');
    }

    // 射擊之星 (Shooting Star) - 上影線長
    if (upperShadow(last) > bodySize(last) * 2 && lowerShadow(last) < bodySize(last) * 0.5) {
      if (last.close > prev.low) patterns.push('射擊之星(空方訊號)');
    }

    // 吞噬形態 (Engulfing)
    if (
      last.close > last.open &&
      prev.close < prev.open &&
      last.open <= prev.close &&
      last.close >= prev.open
    ) {
      patterns.push('多方吞噬(強勢反轉)');
    }
    if (
      last.close < last.open &&
      prev.close > prev.open &&
      last.open >= prev.close &&
      last.close <= prev.open
    ) {
      patterns.push('空方吞噬(弱勢反轉)');
    }

    // 連續紅K / 連續黑K
    const last5 = history.slice(-5);
    const redCount = last5.filter((h) => h.close > h.open).length;
    const blackCount = last5.filter((h) => h.close < h.open).length;
    if (redCount >= 4) patterns.push('連續紅K(強勢)');
    if (blackCount >= 4) patterns.push('連續黑K(弱勢)');

    // 跳空缺口
    if (last.low > prev.high) patterns.push('向上跳空缺口');
    if (last.high < prev.low) patterns.push('向下跳空缺口');

    // 量價背離
    if (last.close > prev.close && last.volume < prev.volume * 0.7) {
      patterns.push('價漲量縮(量價背離)');
    }
    if (last.close < prev.close && last.volume < prev.volume * 0.7) {
      patterns.push('價跌量縮(賣壓減輕)');
    }

    return patterns;
  }

  private calculateSupportResistance(history: HistoryRow[]): {
    support: number;
    resistance: number;
  } {
    const len = history.length;
    const recent = history.slice(Math.max(0, len - 60));

    const lows = recent.map((h) => h.low);
    const highs = recent.map((h) => h.high);
    const closes = recent.map((h) => h.close);
    const currentPrice = closes[closes.length - 1];

    // 找出低於目前價格的支撐位(取最近的低點區)
    const belowLows = lows.filter((l) => l < currentPrice).sort((a, b) => b - a);
    const support =
      belowLows.length > 0 ? belowLows[Math.min(2, belowLows.length - 1)] : lows[lows.length - 1];

    // 找出高於目前價格的壓力位(取最近的高點區)
    const aboveHighs = highs.filter((h) => h > currentPrice).sort((a, b) => a - b);
    const resistance =
      aboveHighs.length > 0
        ? aboveHighs[Math.min(2, aboveHighs.length - 1)]
        : highs[highs.length - 1];

    return {
      support: Math.round(support * 100) / 100,
      resistance: Math.round(resistance * 100) / 100,
    };
  }

  private async enrichWithTechnicals(stocks: StockSnapshotDto[]): Promise<EnrichedStock[]> {
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
    stocks: (EnrichedStock & { relativeStrength?: number })[],
    news: {
      twStock: string[];
      usStock: string[];
      international: string[];
      twse: string[];
    },
    marketIndex: string,
    institutional: string,
    allNewsFlat: string[],
  ): Promise<AnalysisResultDto> {
    const relatedNewsMap = new Map<string, string[]>();
    await Promise.all(
      stocks.map(async (s) => {
        const related = await this.findRelatedNews(s.code, s.name, s.industry ?? '');
        if (related.length > 0) relatedNewsMap.set(s.code, related);
      }),
    );

    const stockSummary = stocks
      .map((s) => {
        let line = `${s.code} ${s.name} [${s.industry ?? '未知'}]`;
        line += `: 收盤${s.closingPrice} 漲跌${s.change} 成交量${s.tradeVolume}`;
        line += ` 本益比${s.peRatio ?? 'N/A'} 殖利率${s.dividendYield ?? 'N/A'}%`;
        if (s.revenueYoY !== undefined) {
          line += ` 月營收年增率${s.revenueYoY > 0 ? '+' : ''}${s.revenueYoY}%`;
        }
        if (s.relativeStrength !== undefined) {
          line += ` 相對大盤強弱${s.relativeStrength > 0 ? '+' : ''}${s.relativeStrength}%`;
        }
        if (s.indicators) {
          const ind = s.indicators;
          line += `\n  均線: MA5=${ind.ma5} MA10=${ind.ma10} MA20=${ind.ma20} MA60=${ind.ma60} 趨勢=${ind.trend}`;
          line += `\n  RSI14=${ind.rsi14} KD: K=${ind.kValue} D=${ind.dValue}`;
          line += `\n  MACD=${ind.macdLine} Signal=${ind.signalLine} Histogram=${ind.macdHistogram}`;
          line += `\n  布林通道: 上=${ind.bollingerUpper} 中=${ind.bollingerMiddle} 下=${ind.bollingerLower}`;
          line += `\n  量比=${ind.volumeRatio}(今量${ind.latestVolume}/均量${ind.avgVolume20}) 20日高=${ind.high20} 20日低=${ind.low20}`;
          line += `\n  動能: 5日${ind.momentum5d}% 10日${ind.momentum10d}% 20日${ind.momentum20d}%`;
          line += `\n  支撐=${ind.supportLevel} 壓力=${ind.resistanceLevel}`;
          if (ind.candlePatterns.length > 0) {
            line += `\n  K線形態: ${ind.candlePatterns.join('、')}`;
          }
          line += `\n  近五日收盤: ${ind.recentCloses.slice(-5).join(' → ')}`;
        }

        const matched =
          relatedNewsMap.get(s.code) ??
          allNewsFlat.filter((n) => n.includes(s.code) || n.includes(s.name)).slice(0, 3);
        if (matched.length > 0) {
          line += `\n  相關新聞:\n    ${matched.join('\n    ')}`;
        }

        return line;
      })
      .join('\n\n');

    const twStockNews = news.twStock.length > 0 ? news.twStock.join('\n') : '(目前無台股新聞)';
    const usStockNews = news.usStock.length > 0 ? news.usStock.join('\n') : '(目前無美股新聞)';
    const internationalNews =
      news.international.length > 0 ? news.international.join('\n') : '(目前無國際財經新聞)';
    const twseNews = news.twse.length > 0 ? news.twse.join('\n') : '(目前無證交所公告)';

    const systemPrompt = `你是一位擁有 20 年經驗的台灣股市專業投資分析師與技術分析專家，擅長做多與放空雙向操作。

      重要原則:
      - 每項評分和判斷都必須引用提供給你的「具體數據」(數字、指標值、新聞標題)，嚴禁憑空捏造
      - 若該股票沒有相關新聞，新聞面分數不得超過 50 分，且不得編造題材
      - 「相對大盤強弱」為正表示強於大盤，為負表示弱於大盤，這是判斷個股強弱的關鍵指標
      - 「月營收年增率」反映基本面動能，年增率 > 20% 為成長股，< -10% 為衰退

      你精通以下分析方法:
      - 技術分析:均線系統(MA5/10/20/60)、RSI、KD隨機指標、MACD、布林通道、成交量分析、支撐壓力位、K線形態辨識
      - 基本面分析:本益比、殖利率、月營收年增率、營收成長趨勢
      - 籌碼面分析:三大法人買賣超、成交量變化、量價關係
      - 新聞面分析:只根據「相關新聞」區段中列出的新聞來評分，沒有新聞就不要編
      - 相對強弱分析:個股漲跌幅 vs 大盤漲跌幅的差值
      - 動能分析:短中長期動能(5/10/20日漲跌幅)、趨勢加速/減速判斷
      - K線形態:十字線、錘子線、吊人線、射擊之星、吞噬形態、跳空缺口、量價背離

      你的分析框架(三種操作方向):

      【做多條件】(以下符合 3 項以上):
      - 均線多頭排列或即將黃金交叉
      - RSI 40-70 區間(非超買)，KD 黃金交叉
      - MACD 柱狀體由負轉正或持續放大
      - 三大法人連續買超
      - K線出現多方吞噬、錘子線等反轉訊號
      - 5日動能 > 0 且 20日動能 > 0
      - 股價站上布林中軌且向上軌靠近
      - 量增價漲
      - 相對大盤強弱 > 0(強於大盤)
      - 月營收年增率 > 0%

      【放空條件】(以下符合 3 項以上):
      - 均線空頭排列或即將死亡交叉
      - RSI > 75 超買區或持續下降
      - KD 死亡交叉且 K < D
      - MACD 柱狀體由正轉負或持續擴大(負向)
      - 三大法人連續賣超
      - K線出現空方吞噬、射擊之星、吊人線
      - 5日動能 < 0 且 20日動能 < 0
      - 量增價跌或量價背離
      - 跌破布林中軌且向下軌靠近
      - 相對大盤強弱 < -1%(明顯弱於大盤)
      - 月營收年增率 < -10%

      【觀望條件】:
      - 多空指標矛盾(如技術面偏多但籌碼面偏空)
      - 處於盤整格局，方向不明
      - 即將遇到重大支撐/壓力位但尚未突破
      - RSI 在 45-55 中性區間
      - 成交量萎縮，無明確方向

      你的分析風格:
      - 嚴謹且務實，同時關注做多和放空機會
      - 明確給出進場價、停損價、目標價
      - 每個推薦必須標明操作方向與時間框架
      - 特別注意 AI/半導體/科技相關題材的影響
      - 結合三大法人籌碼面驗證技術面訊號
      - 每一項 bullishFactor / bearishFactor 的 description 裡必須引用至少一個具體數字`;

    const prompt = `
      請根據以下台股即時資料、技術指標、K線形態、三大法人籌碼與多來源新聞，產出完整的投資分析報告。
      重點:明確區分「可做多」、「可放空」、「建議觀望」三類股票。
      注意:每個個股下方已附上「相關新聞」，若該股無相關新聞，新聞面評分不得超過 50。

      「大盤指數」
      ${marketIndex || '(目前無大盤資料)'}

      「三大法人買賣超(今日前 20 大)」
      ${institutional || '(目前無法人資料)'}

      「今日個股資料與技術指標(含產業別、月營收年增率、相對大盤強弱、相關新聞)」
      ${stockSummary}

      「台股新聞」(Yahoo 奇摩股市)
      ${twStockNews}

      「美股新聞」(Google News)
      ${usStockNews}

      「國際財經新聞」(Google News)
      ${internationalNews}

      「證交所公告」(TWSE)
      ${twseNews}

      請以 JSON 格式回覆，結構如下:
      {
        "marketOverview": "整體市場概況分析，包含大盤趨勢、法人動向、量能狀況、近期題材熱點(300字內，繁體中文)",
        "topPicks": [
          {
            "code": "股票代號",
            "name": "股票名稱",
            "reason": "綜合推薦理由摘要(100字內)",
            "direction": "做多 / 放空 / 觀望(三選一)",
            "scores": {
              "fundamental": 0-100,
              "technical": 0-100,
              "chip": 0-100,
              "news": 0-100,
              "strategic": 0-100,
              "total": 0-100
            },
            "bullishFactors": [
              { "category": "題材 / 基本 / 技術 / 籌碼 / 新聞(五選一)", "description": "看多原因，必須引用具體數字(如 RSI=65.3、量比=2.1x、月營收年增率+35%)，禁止空泛描述(150字內)", "importance": "重要 / 一般" }
            ],
            "bearishFactors": [
              { "category": "題材 / 基本 / 技術 / 籌碼 / 新聞(五選一)", "description": "看空原因，必須引用具體數字，禁止空泛描述(150字內)", "importance": "重要 / 一般" }
            ],
            "entryPrice": "建議進場價位(做多為買進價，放空為放空價)",
            "stopLoss": "建議停損價位(做多為支撐下方2-3%，放空為壓力上方2-3%)",
            "targetPrice": "目標價位(做多為壓力位，放空為支撐位)",
            "signal": "強烈買進 / 買進 / 觀望 / 賣出 / 強烈賣出(五選一)",
            "timeframe": "短線(1-5日) / 波段(1-4週) / 長期(1月以上)(三選一)",
            "technicalSummary": "技術面關鍵訊號摘要，含K線形態與動能方向(100字內)"
          }
        ],
        "risks": "當前主要風險提示，含具體數據佐證(200字內，繁體中文)",
        "newsImpact": "國際新聞與AI/科技題材對台股的潛在影響分析(200字內，繁體中文)",
        "technicalOutlook": "整體技術面展望，包含支撐壓力位與可能走勢(250字內，繁體中文)"
      }

      分類規則(direction 判定):
      - 「做多」:技術面偏多 + 籌碼面偏多 + 動能向上 + 相對大盤強弱 > 0，signal 給「買進」或「強烈買進」
      - 「放空」:技術面偏空 + 籌碼面偏空 + 動能向下，signal 給「賣出」或「強烈賣出」
      - 「觀望」:多空訊號矛盾或方向不明確，signal 給「觀望」

      評分規則:
      - fundamental(基本面):本益比合理度、殖利率、月營收年增率(年增率>20%加分，<-10%扣分)
      - technical(技術面):均線排列、RSI、KD、MACD、布林通道、K線形態、相對大盤強弱
      - chip(籌碼面):三大法人買賣超方向、量比、量價配合
      - news(新聞面):只根據個股下方「相關新聞」評分，沒有相關新聞則不超過 50 分
      - strategic(戰略面):產業趨勢、競爭定位、長線發展潛力
      - total(綜合):技術面 25%、籌碼面 25%、基本面 20%、新聞面 15%、戰略面 15%

      topPicks 排序規則:
      - 先按 direction 分組:做多 → 放空 → 觀望
      - 組內按 total 分數由高到低排序
      - 做多類:列出 5-8 檔最佳做多標的
      - 放空類:列出 3-5 檔最佳放空標的(RSI超買、KD死叉、弱於大盤的股票)
      - 觀望類:列出 3-5 檔值得追蹤但尚未進場的標的
      - 合計 10-18 檔

      嚴格禁止:
      - 編造不存在的新聞標題或題材
      - description 中只寫「表現不錯」「前景看好」等空話，必須有數據
      - 對沒有相關新聞的股票給超過 50 的新聞面分數
      - 所有文字使用繁體中文
      - 只回傳 JSON，不要加任何前後說明`;

    const completion = await this.anthropic.messages
      .stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 32000,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: prompt }],
      })
      .finalMessage();

    const textBlock = completion.content.find((b) => b.type === 'text');
    const rawText = textBlock && 'text' in textBlock ? textBlock.text : '{}';
    const jsonStr = this.extractJson(rawText);

    let parsed: ParsedAiResult;
    try {
      parsed = JSON.parse(jsonStr) as ParsedAiResult;
    } catch {
      this.logger.error(`AI 回傳非合法 JSON:${rawText.slice(0, 300)}`);
      throw new Error('AI 分析結果解析失敗，請重試');
    }

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
              recentDates: ind.recentDates,
              momentum5d: ind.momentum5d,
              momentum10d: ind.momentum10d,
              momentum20d: ind.momentum20d,
              candlePatterns: ind.candlePatterns,
              supportLevel: ind.supportLevel,
              resistanceLevel: ind.resistanceLevel,
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
        const bullishFactors: AnalysisFactorDto[] = (p.bullishFactors ?? []).map((f) => ({
          category: f.category ?? '基本',
          description: f.description ?? '',
          importance: f.importance ?? '一般',
        }));
        const bearishFactors: AnalysisFactorDto[] = (p.bearishFactors ?? []).map((f) => ({
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

  async *analyzeMarketStream(
    dto: AnalyzeMarketDto,
  ): AsyncGenerator<{ text?: string; result?: AnalysisResultDto }> {
    yield { text: '正在收集市場資料...' };

    if (!dto.stockCodes || dto.stockCodes.length === 0) {
      const cached = await this.getCachedAnalysis();
      if (cached) {
        yield { text: '已有今日快取，直接回傳結果' };
        yield { result: cached };
        return;
      }
    }

    const [stocks, valuations, news, marketIndex, institutional, industryMap, monthlyRevenue] =
      await Promise.all([
        this.fetchStocks(),
        this.fetchValuations(),
        this.fetchNews(),
        this.fetchMarketIndex(),
        this.fetchInstitutional(),
        this.fetchIndustryMap(),
        this.fetchMonthlyRevenue(),
      ]);

    yield { text: '市場資料收集完成，正在篩選候選股票...' };

    const mergedStocks = this.mergeStockData(stocks, valuations, industryMap, monthlyRevenue);
    let targetStocks: StockSnapshotDto[];
    if (dto.stockCodes && dto.stockCodes.length > 0) {
      targetStocks = mergedStocks.filter((s) => dto.stockCodes!.includes(s.code));
    } else {
      targetStocks = this.selectCandidates(mergedStocks, institutional);
    }

    yield { text: `已篩選 ${targetStocks.length} 檔候選股票，正在計算技術指標...` };

    const enrichedStocks = await this.enrichWithTechnicals(targetStocks);

    yield { text: '技術指標計算完成，正在呼叫 AI 分析...' };

    const marketChangePercent = this.parseMarketChangePercent(marketIndex);
    const stocksWithRelativeStrength = enrichedStocks.map((s) => {
      const close = parseFloat(s.closingPrice?.replace(/,/g, '') ?? '0');
      const change = parseFloat(s.change?.replace(/,/g, '') ?? '0');
      const prev = close - change;
      const stockPct = prev > 0 ? (change / prev) * 100 : 0;
      return {
        ...s,
        relativeStrength: Math.round((stockPct - marketChangePercent) * 100) / 100,
      };
    });

    const allNews = [...news.twStock, ...news.usStock, ...news.international, ...news.twse];

    void this.storeNewsEmbeddings([
      ...news.twStock.map((title) => ({ title, source: 'twStock' })),
      ...news.usStock.map((title) => ({ title, source: 'usStock' })),
      ...news.international.map((title) => ({ title, source: 'international' })),
      ...news.twse.map((title) => ({ title, source: 'twse' })),
    ]).catch((e: unknown) => this.logger.warn('新聞向量儲存失敗', e));

    const result = await this.callAI(
      stocksWithRelativeStrength,
      news,
      marketIndex,
      institutional,
      allNews,
    );

    if (!dto.stockCodes || dto.stockCodes.length === 0) {
      const today = this.getTodayDate();
      await this.prisma.analysisCache
        .upsert({
          where: { date: today },
          update: { result: JSON.parse(JSON.stringify(result)) as any },
          create: { date: today, result: JSON.parse(JSON.stringify(result)) as any },
        })
        .catch((e: unknown) => this.logger.warn('快取儲存失敗', e));
    }

    yield { text: 'AI 分析完成！' };
    yield { result };
  }

  private async runTool(
    toolName: string,
    input: Record<string, string>,
    stockDataCache: Map<string, StockSnapshotDto>,
    technicalsCache: Map<string, TechnicalIndicators>,
  ): Promise<unknown> {
    this.logger.log(`[ToolUse] 執行工具:${toolName}`);
    switch (toolName) {
      case 'get_market_overview': {
        const [stocks, valuations, industryMap, monthlyRevenue, marketIndex] = await Promise.all([
          this.fetchStocks(),
          this.fetchValuations(),
          this.fetchIndustryMap(),
          this.fetchMonthlyRevenue(),
          this.fetchMarketIndex(),
        ]);
        const merged = this.mergeStockData(stocks, valuations, industryMap, monthlyRevenue);
        for (const s of merged) stockDataCache.set(s.code, s);
        return { marketIndex, totalStocks: merged.length, stocks: merged };
      }
      case 'get_institutional_investors':
        return this.fetchInstitutional();
      case 'get_news': {
        const news = await this.fetchNews();
        // 工具流程取得新聞後，同步觸發向量儲存(fire-and-forget）
        // 讓後續 search_related_news 工具能查到今日新聞的 embedding
        void this.storeNewsEmbeddings([
          ...news.twStock.map((title) => ({ title, source: 'twStock' })),
          ...news.usStock.map((title) => ({ title, source: 'usStock' })),
          ...news.international.map((title) => ({ title, source: 'international' })),
          ...news.twse.map((title) => ({ title, source: 'twse' })),
        ]).catch((e: unknown) => this.logger.warn('新聞向量儲存失敗', e));
        return news;
      }
      case 'get_stock_technicals': {
        const history = await this.fetchStockHistory(input.stock_code);
        const indicators = this.calculateIndicators(history);
        if (indicators) technicalsCache.set(input.stock_code, indicators);
        return { stock_code: input.stock_code, indicators };
      }
      case 'search_related_news':
        return this.findRelatedNews(input.stock_code, input.stock_name, input.industry ?? '');
      default:
        return { error: `未知工具:${toolName}` };
    }
  }

  private buildResult(
    parsed: ParsedAiResult,
    technicalsCache: Map<string, TechnicalIndicators>,
  ): AnalysisResultDto {
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
        const ind = technicalsCache.get(p.code ?? '');
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
              recentDates: ind.recentDates,
              momentum5d: ind.momentum5d,
              momentum10d: ind.momentum10d,
              momentum20d: ind.momentum20d,
              candlePatterns: ind.candlePatterns,
              supportLevel: ind.supportLevel,
              resistanceLevel: ind.resistanceLevel,
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
          bullishFactors: (p.bullishFactors ?? []).map((f) => ({
            category: f.category ?? '基本',
            description: f.description ?? '',
            importance: f.importance ?? '一般',
          })),
          bearishFactors: (p.bearishFactors ?? []).map((f) => ({
            category: f.category ?? '基本',
            description: f.description ?? '',
            importance: f.importance ?? '一般',
          })),
          indicators,
        };
      }),
      risks: parsed.risks ?? '',
      newsImpact: parsed.newsImpact ?? '',
      technicalOutlook: parsed.technicalOutlook ?? '',
      generatedAt: new Date().toISOString(),
    };
  }

  async *analyzeMarketStreamWithTools(userId: string): AsyncGenerator<{
    text?: string;
    result?: AnalysisResultDto;
  }> {
    yield { text: '工具模式啟動，AI 開始自主查詢市場資料...' };

    const technicalsCache = new Map<string, TechnicalIndicators>();
    const stockDataCache = new Map<string, StockSnapshotDto>();

    const llm = new ChatAnthropic({
      model: 'claude-sonnet-4-6',
      maxTokens: 32000,
      streaming: true,
    });

    const lgTools = [
      tool(
        async () =>
          JSON.stringify(
            await this.runTool('get_market_overview', {}, stockDataCache, technicalsCache),
          ),
        {
          name: 'get_market_overview',
          description:
            '取得大盤指數 + 所有上市個股今日成交(收盤價、漲跌、成交量)、估值(本益比/殖利率)、產業別、月營收年增率',
          schema: z.object({}),
        },
      ),
      tool(
        async () =>
          JSON.stringify(
            await this.runTool('get_institutional_investors', {}, stockDataCache, technicalsCache),
          ),
        {
          name: 'get_institutional_investors',
          description: '取得今日三大法人(外資、投信、自營商)買賣超前 20 大資料',
          schema: z.object({}),
        },
      ),
      tool(
        async () =>
          JSON.stringify(await this.runTool('get_news', {}, stockDataCache, technicalsCache)),
        {
          name: 'get_news',
          description: '取得多來源財經新聞(台股、美股、國際財經、證交所公告)，每類最多 15 則',
          schema: z.object({}),
        },
      ),
      tool(
        async ({ stock_code }: { stock_code: string }) =>
          JSON.stringify(
            await this.runTool(
              'get_stock_technicals',
              { stock_code },
              stockDataCache,
              technicalsCache,
            ),
          ),
        {
          name: 'get_stock_technicals',
          description:
            '取得特定股票近 3 個月 K 線歷史，計算 MA5/10/20/60、RSI14、KD、MACD、布林通道、量比、動能、K 線形態、支撐壓力位',
          schema: z.object({
            stock_code: z.string().describe('4 位數股票代碼，例如 2330'),
          }),
        },
      ),
      tool(
        async ({
          stock_code,
          stock_name,
          industry,
        }: {
          stock_code: string;
          stock_name: string;
          industry?: string;
        }) =>
          JSON.stringify(
            await this.runTool(
              'search_related_news',
              { stock_code, stock_name, industry: industry ?? '' },
              stockDataCache,
              technicalsCache,
            ),
          ),
        {
          name: 'search_related_news',
          description: '語意向量搜尋與特定股票最相關的新聞(top 5)，比關鍵字配對更精準',
          schema: z.object({
            stock_code: z.string().describe('股票代碼'),
            stock_name: z.string().describe('股票名稱'),
            industry: z.string().optional().describe('產業別(可選)'),
          }),
        },
      ),
    ];

    const systemPrompt = `你是一位擁有 20 年經驗的台灣股市專業投資分析師與技術分析專家，擅長做多與放空雙向操作。

你有以下工具可查詢即時市場資料:
- get_market_overview:大盤指數 + 所有個股成交/估值/產業/月營收(第一步優先呼叫)
- get_institutional_investors:三大法人買賣超前 20 大
- get_news:多來源財經新聞(台股、美股、國際、證交所)
- get_stock_technicals:個股完整技術指標(均線/RSI/KD/MACD/布林/K線形態等)
- search_related_news:語意向量搜尋個股相關新聞

重要原則:
- 每項評分必須引用具體數據，嚴禁憑空捏造
- 若個股無相關新聞，新聞面不得超過 50 分
- 相對大盤強弱(個股漲跌幅 - 大盤漲跌幅)為正表示強於大盤`;

    const userMessage = `請使用工具查詢今日台股市場資料，選出 10-18 檔值得關注的股票，輸出完整 JSON 分析報告。

建議步驟:
1. 同時呼叫 get_market_overview + get_institutional_investors + get_news
2. 根據成交量、漲跌幅、法人買超篩選 15-25 檔候選股
3. 對每檔候選股同時呼叫 get_stock_technicals + search_related_news
4. 整合所有資料，輸出最終 JSON

輸出格式(嚴格 JSON，不加任何前後說明文字):
{
  "marketOverview": "整體市場概況分析(300字內，繁體中文)",
  "topPicks": [
    {
      "code": "股票代號",
      "name": "股票名稱",
      "reason": "推薦理由(100字內)",
      "direction": "做多 / 放空 / 觀望(三選一)",
      "scores": { "fundamental": 0-100, "technical": 0-100, "chip": 0-100, "news": 0-100, "strategic": 0-100, "total": 0-100 },
      "bullishFactors": [{ "category": "題材/基本/技術/籌碼/新聞", "description": "必須引用具體數字(150字內)", "importance": "重要/一般" }],
      "bearishFactors": [{ "category": "題材/基本/技術/籌碼/新聞", "description": "必須引用具體數字(150字內)", "importance": "重要/一般" }],
      "entryPrice": "進場價",
      "stopLoss": "停損價",
      "targetPrice": "目標價",
      "signal": "強烈買進/買進/觀望/賣出/強烈賣出",
      "timeframe": "短線(1-5日)/波段(1-4週)/長期(1月以上)",
      "technicalSummary": "技術面摘要(100字內)"
    }
  ],
  "risks": "主要風險提示(200字內，繁體中文)",
  "newsImpact": "新聞對台股的影響(200字內，繁體中文)",
  "technicalOutlook": "技術面展望(250字內，繁體中文)"
}

做多 5-8 檔、放空 3-5 檔、觀望 3-5 檔，按 direction 分組後以 total 分數排序。`;

    const agent = createReactAgent({
      llm,
      tools: lgTools,
      prompt: systemPrompt,
    });

    const callbacks = process.env.LANGFUSE_SECRET_KEY
      ? [
          new CallbackHandler({
            userId,
            sessionId: `market-analysis-${this.getTodayDate()}`,
          }),
        ]
      : [];

    let lastAiContent = '';

    for await (const chunk of await agent.stream(
      { messages: [{ role: 'user', content: userMessage }] },
      { streamMode: 'updates', recursionLimit: 50, callbacks },
    )) {
      if ('agent' in chunk) {
        const msgs = (chunk as { agent: { messages: AIMessage[] } }).agent.messages;
        const lastMsg = msgs[msgs.length - 1];
        const toolCalls = lastMsg.tool_calls ?? [];
        if (toolCalls.length > 0) {
          yield { text: `AI 正在查詢市場資料(${toolCalls.length} 項)...` };
        } else {
          const content = lastMsg.content;
          lastAiContent =
            typeof content === 'string'
              ? content
              : content
                  .filter(
                    (b): b is { type: 'text'; text: string } =>
                      typeof b === 'object' && b !== null && 'type' in b && b.type === 'text',
                  )
                  .map((b) => b.text)
                  .join('');
        }
      }
    }

    yield { text: 'AI 分析完成，正在解析結果...' };

    const jsonStr = this.extractJson(lastAiContent);
    let parsed: ParsedAiResult;
    try {
      parsed = JSON.parse(jsonStr) as ParsedAiResult;
    } catch {
      this.logger.error(`AI 回傳非合法 JSON:${lastAiContent.slice(0, 300)}`);
      throw new Error('AI 分析結果解析失敗，請重試');
    }

    const result = this.buildResult(parsed, technicalsCache);

    const today = this.getTodayDate();
    await this.prisma.analysisCache
      .upsert({
        where: { date: today },
        update: { result: JSON.parse(JSON.stringify(result)) as any },
        create: { date: today, result: JSON.parse(JSON.stringify(result)) as any },
      })
      .catch((e: unknown) => this.logger.warn('快取儲存失敗', e));

    yield { result };
  }

  async *chatStream(dto: ChatMessageDto): AsyncGenerator<string> {
    const { stockCode, message, history } = dto;

    let stockContext = '';
    try {
      const [stocks, valuations, industryMap, monthlyRevenue] = await Promise.all([
        this.fetchStocks(),
        this.fetchValuations(),
        this.fetchIndustryMap(),
        this.fetchMonthlyRevenue(),
      ]);

      const stock = stocks.find((s) => s.code === stockCode);
      if (stock) {
        const valuation = valuations[stockCode];
        const industry = industryMap.get(stockCode) ?? '';
        const revenue = monthlyRevenue.get(stockCode);

        stockContext += `${stock.code} ${stock.name}`;
        if (industry) stockContext += `【${industry}】`;
        stockContext += `:收盤 ${stock.closingPrice} 漲跌 ${stock.change} 成交量 ${stock.tradeVolume}`;
        if (valuation) {
          stockContext += ` 本益比 ${valuation.peRatio} 殖利率 ${valuation.dividendYield}%`;
        }
        if (revenue) {
          stockContext += ` 月營收年增率 ${revenue.yoyGrowth > 0 ? '+' : ''}${revenue.yoyGrowth}%`;
        }
      }

      const historyData = await this.fetchStockHistory(stockCode);
      if (historyData.length >= 20) {
        const indicators = this.calculateIndicators(historyData);
        if (indicators) {
          stockContext += `\n技術指標:MA5=${indicators.ma5} MA10=${indicators.ma10} MA20=${indicators.ma20} MA60=${indicators.ma60}`;
          stockContext += ` RSI=${indicators.rsi14} K=${indicators.kValue} D=${indicators.dValue}`;
          stockContext += ` MACD=${indicators.macdLine} 布林上=${indicators.bollingerUpper} 中=${indicators.bollingerMiddle} 下=${indicators.bollingerLower}`;
          stockContext += ` 量比=${indicators.volumeRatio} 趨勢=${indicators.trend}`;
          stockContext += ` 支撐=${indicators.supportLevel} 壓力=${indicators.resistanceLevel}`;
          if (indicators.candlePatterns.length > 0) {
            stockContext += ` K線形態:${indicators.candlePatterns.join('、')}`;
          }
        }
      }

      if (stock) {
        const industry = industryMap.get(stockCode) ?? '';
        const relatedNews = await this.findRelatedNews(stockCode, stock.name, industry);
        if (relatedNews.length > 0) {
          stockContext += `\n相關新聞:\n${relatedNews.map((n, i) => `${i + 1}. ${n}`).join('\n')}`;
        }
      }
    } catch {
      this.logger.warn(`無法取得 ${stockCode} 的即時資料`);
    }

    const systemPrompt = `你是一位專業的台灣股市分析師助手。使用者正在查看股票 ${stockCode} 的頁面。

你的回覆規則:
- 使用繁體中文
- 簡潔有重點，每次回覆控制在 300 字以內
- 引用具體數據時必須使用提供的資料，不可憑空捏造
- 如果沒有足夠資料回答，誠實告知
- 提供操作建議時，一定要附帶風險提示

以下是該股票的即時資料:
${stockContext || '(目前無法取得即時資料)'}`;

    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    if (history && history.length > 0) {
      for (const h of history.slice(-10)) {
        if (h.role === 'user' || h.role === 'assistant') {
          messages.push({ role: h.role, content: h.content });
        }
      }
    }
    messages.push({ role: 'user', content: message });

    const stream = this.anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }
}
