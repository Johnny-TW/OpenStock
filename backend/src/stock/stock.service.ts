import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import type { AxiosRequestConfig } from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import {
  TwseResponse,
  StockDailyDto,
  StockDailyAllResponse,
  StockValuationDto,
  StockValuationResponse,
  MarketIndexDto,
  MarketIndexResponse,
  TopVolumeDto,
  TopVolumeResponse,
  IntradayTickDto,
  IntradayResponse,
  IndexHistoryDto,
  IndexHistoryResponse,
  RevenueRankingDto,
  RevenueRankingResponse,
  GrossMarginRankingDto,
  GrossMarginRankingResponse,
  DividendYieldRankingDto,
  DividendYieldRankingResponse,
  PeRatioRankingDto,
  PeRatioRankingResponse,
  HeatmapStockDto,
  HeatmapIndustryDto,
  HeatmapResponse,
  NewsDto,
  NewsResponse,
  AllNewsResponse,
} from './dto/stock.dto';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  private readonly TWSE_DAILY_ALL_URL =
    'https://www.twse.com.tw/exchangeReport/STOCK_DAY_ALL?response=json';

  private readonly TWSE_VALUATION_URL =
    'https://www.twse.com.tw/exchangeReport/BWIBBU_ALL?response=json';

  private readonly OPENAPI_BASE = 'https://openapi.twse.com.tw/v1';

  private industryMapCache: Map<string, string> | null = null;
  private industryMapCacheTime = 0;
  private readonly INDUSTRY_CACHE_TTL = 30 * 60 * 1000;
  private readonly RSS_CONFIG: AxiosRequestConfig = { responseType: 'text' };

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async getDailyAll(): Promise<StockDailyAllResponse> {
    this.logger.log('Fetching TWSE daily stock data...');

    const [{ data }, industryMap] = await Promise.all([
      firstValueFrom(
        this.httpService.get<TwseResponse>(this.TWSE_DAILY_ALL_URL),
      ),
      this.getIndustryMap(),
    ]);

    if (data.stat !== 'OK') {
      this.logger.warn(`TWSE API returned stat: ${data.stat}`);
      return {
        date: '',
        title: '',
        notes: [],
        fields: [],
        data: [],
        total: 0,
      };
    }

    const stocks: StockDailyDto[] = data.data.map((row) => ({
      code: row[0],
      name: row[1],
      tradeVolume: row[2],
      tradeValue: row[3],
      openingPrice: row[4],
      highestPrice: row[5],
      lowestPrice: row[6],
      closingPrice: row[7],
      change: row[8],
      transaction: row[9],
      industry: industryMap.get(row[0]?.trim()) ?? '',
    }));

    return {
      date: data.date,
      title: data.title,
      notes: data.notes,
      fields: data.fields,
      data: stocks,
      total: stocks.length,
    };
  }

  async getValuation(): Promise<StockValuationResponse> {
    this.logger.log('Fetching TWSE valuation data...');

    const { data } = await firstValueFrom(
      this.httpService.get<TwseResponse>(this.TWSE_VALUATION_URL),
    );

    if (data.stat !== 'OK') {
      this.logger.warn(`TWSE Valuation API returned stat: ${data.stat}`);
      return {
        date: '',
        title: '',
        notes: [],
        fields: [],
        data: [],
        total: 0,
      };
    }

    const stocks: StockValuationDto[] = data.data.map((row) => ({
      code: row[0],
      name: row[1],
      dividendYield: row[2],
      dividendYear: row[3],
      peRatio: row[4],
      pbRatio: row[5],
      financialYear: row[6],
    }));

    return {
      date: data.date,
      title: data.title,
      notes: data.notes,
      fields: data.fields,
      data: stocks,
      total: stocks.length,
    };
  }

  /** 大盤/類股指數 (OpenAPI) */
  async getMarketIndex(): Promise<MarketIndexResponse> {
    this.logger.log('Fetching TWSE market index...');
    const { data } = await firstValueFrom(
      this.httpService.get<Record<string, string>[]>(
        `${this.OPENAPI_BASE}/exchangeReport/MI_INDEX`,
      ),
    );

    const items: MarketIndexDto[] = data.map((row) => ({
      date: row['日期'] ?? '',
      name: row['指數'] ?? '',
      closingIndex: row['收盤指數'] ?? '',
      direction: row['漲跌'] ?? '',
      changePoints: row['漲跌點數'] ?? '',
      changePercent: row['漲跌百分比'] ?? '',
    }));

    return { data: items, total: items.length };
  }

  /** 成交量前 20 (OpenAPI) */
  async getTopVolume(): Promise<TopVolumeResponse> {
    this.logger.log('Fetching TWSE top volume...');
    const { data } = await firstValueFrom(
      this.httpService.get<Record<string, string>[]>(
        `${this.OPENAPI_BASE}/exchangeReport/MI_INDEX20`,
      ),
    );

    const items: TopVolumeDto[] = data.map((row) => ({
      date: row['Date'] ?? '',
      rank: row['Rank'] ?? '',
      code: row['Code'] ?? '',
      name: row['Name'] ?? '',
      tradeVolume: row['TradeVolume'] ?? '',
      transaction: row['Transaction'] ?? '',
      openingPrice: row['OpeningPrice'] ?? '',
      highestPrice: row['HighestPrice'] ?? '',
      lowestPrice: row['LowestPrice'] ?? '',
      closingPrice: row['ClosingPrice'] ?? '',
      direction: row['Dir'] ?? '',
      change: row['Change'] ?? '',
    }));

    return { data: items, total: items.length };
  }

  /** 盤中五秒累計 (OpenAPI) */
  async getIntraday(): Promise<IntradayResponse> {
    this.logger.log('Fetching TWSE intraday 5-min data...');
    const { data } = await firstValueFrom(
      this.httpService.get<Record<string, string>[]>(
        `${this.OPENAPI_BASE}/exchangeReport/MI_5MINS`,
      ),
    );

    const items: IntradayTickDto[] = data.map((row) => ({
      time: row['Time'] ?? '',
      accTradeVolume: row['AccTradeVolume'] ?? '',
      accTradeValue: row['AccTradeValue'] ?? '',
      accTransaction: row['AccTransaction'] ?? '',
    }));

    return { data: items, total: items.length };
  }

  /** 指數歷史 OHLC (OpenAPI) */
  async getIndexHistory(): Promise<IndexHistoryResponse> {
    this.logger.log('Fetching TWSE index history...');
    const { data } = await firstValueFrom(
      this.httpService.get<Record<string, string>[]>(
        `${this.OPENAPI_BASE}/indicesReport/MI_5MINS_HIST`,
      ),
    );

    const items: IndexHistoryDto[] = data.map((row) => ({
      date: row['Date'] ?? row['日期'] ?? '',
      openingIndex: row['OpeningIndex'] ?? row['開盤指數'] ?? '',
      highestIndex: row['HighestIndex'] ?? row['最高指數'] ?? '',
      lowestIndex: row['LowestIndex'] ?? row['最低指數'] ?? '',
      closingIndex: row['ClosingIndex'] ?? row['收盤指數'] ?? '',
    }));

    return { data: items, total: items.length };
  }

  private parseNumber(value: string): number {
    if (!value || value === '--' || value.trim() === '') return 0;
    return parseFloat(value.replace(/,/g, '')) || 0;
  }

  private async getIndustryMap(): Promise<Map<string, string>> {
    const now = Date.now();
    if (
      this.industryMapCache &&
      now - this.industryMapCacheTime < this.INDUSTRY_CACHE_TTL
    ) {
      return this.industryMapCache;
    }
    this.logger.log('Fetching industry map from t187ap14_L...');
    const { data } = await firstValueFrom(
      this.httpService.get<Record<string, string>[]>(
        `${this.OPENAPI_BASE}/opendata/t187ap14_L`,
      ),
    );
    const map = new Map<string, string>();
    for (const row of data) {
      const code = row['公司代號']?.trim();
      const industry = row['產業別']?.trim();
      if (code && industry) map.set(code, industry);
    }
    this.industryMapCache = map;
    this.industryMapCacheTime = now;
    return map;
  }

  /** 營收排行 (t187ap14_L 簡明損益表) */
  async getRevenueRanking(): Promise<RevenueRankingResponse> {
    this.logger.log('Fetching revenue ranking...');
    const { data } = await firstValueFrom(
      this.httpService.get<Record<string, string>[]>(
        `${this.OPENAPI_BASE}/opendata/t187ap14_L`,
      ),
    );

    const year = data[0]?.['年度'] ?? '';
    const quarter = data[0]?.['季別'] ?? '';

    const items: RevenueRankingDto[] = data
      .map((row) => ({
        code: row['公司代號']?.trim() ?? '',
        name: row['公司名稱']?.trim() ?? '',
        industry: row['產業別']?.trim() ?? '',
        revenue: this.parseNumber(row['營業收入']),
        operatingIncome: this.parseNumber(row['營業利益']),
        netIncome: this.parseNumber(row['稅後淨利']),
        eps: this.parseNumber(row['基本每股盈餘(元)']),
      }))
      .filter((item) => item.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);

    return { data: items, total: items.length, year, quarter };
  }

  /** 毛利率排行 (t187ap06_X_ci 綜合損益表-一般業) */
  async getGrossMarginRanking(): Promise<GrossMarginRankingResponse> {
    this.logger.log('Fetching gross margin ranking...');
    const [{ data }, industryMap] = await Promise.all([
      firstValueFrom(
        this.httpService.get<Record<string, string>[]>(
          `${this.OPENAPI_BASE}/opendata/t187ap06_X_ci`,
        ),
      ),
      this.getIndustryMap(),
    ]);

    const year = data[0]?.['年度'] ?? '';
    const quarter = data[0]?.['季別'] ?? '';

    const items: GrossMarginRankingDto[] = data
      .map((row) => {
        const revenue = this.parseNumber(row['營業收入']);
        const cost = this.parseNumber(row['營業成本']);
        const grossProfit = this.parseNumber(
          row['營業毛利（毛損）淨額'] || row['營業毛利（毛損）'],
        );
        const grossMarginRate =
          revenue > 0 ? Math.round((grossProfit / revenue) * 10000) / 100 : 0;
        const code = row['公司代號']?.trim() ?? '';
        return {
          code,
          name: row['公司名稱']?.trim() ?? '',
          industry: industryMap.get(code) ?? '',
          revenue,
          cost,
          grossProfit,
          grossMarginRate,
        };
      })
      .filter((item) => item.revenue > 0)
      .sort((a, b) => b.grossMarginRate - a.grossMarginRate);

    return { data: items, total: items.length, year, quarter };
  }

  /** 殖利率排行 (BWIBBU_ALL OpenAPI) */
  async getDividendYieldRanking(): Promise<DividendYieldRankingResponse> {
    this.logger.log('Fetching dividend yield ranking...');
    const [{ data }, industryMap] = await Promise.all([
      firstValueFrom(
        this.httpService.get<Record<string, string>[]>(
          `${this.OPENAPI_BASE}/exchangeReport/BWIBBU_ALL`,
        ),
      ),
      this.getIndustryMap(),
    ]);

    const items: DividendYieldRankingDto[] = data
      .map((row) => {
        const code = row['Code']?.trim() ?? '';
        return {
          code,
          name: row['Name']?.trim() ?? '',
          industry: industryMap.get(code) ?? '',
          dividendYield: this.parseNumber(row['DividendYield']),
          peRatio: this.parseNumber(row['PEratio']),
          pbRatio: this.parseNumber(row['PBratio']),
        };
      })
      .filter((item) => item.dividendYield > 0)
      .sort((a, b) => b.dividendYield - a.dividendYield);

    return { data: items, total: items.length };
  }

  /** 本益比排行 (BWIBBU_ALL OpenAPI) */
  async getPeRatioRanking(): Promise<PeRatioRankingResponse> {
    this.logger.log('Fetching PE ratio ranking...');
    const [{ data }, industryMap] = await Promise.all([
      firstValueFrom(
        this.httpService.get<Record<string, string>[]>(
          `${this.OPENAPI_BASE}/exchangeReport/BWIBBU_ALL`,
        ),
      ),
      this.getIndustryMap(),
    ]);

    const items: PeRatioRankingDto[] = data
      .map((row) => {
        const code = row['Code']?.trim() ?? '';
        return {
          code,
          name: row['Name']?.trim() ?? '',
          industry: industryMap.get(code) ?? '',
          peRatio: this.parseNumber(row['PEratio']),
          dividendYield: this.parseNumber(row['DividendYield']),
          pbRatio: this.parseNumber(row['PBratio']),
        };
      })
      .filter((item) => item.peRatio > 0)
      .sort((a, b) => a.peRatio - b.peRatio);

    return { data: items, total: items.length };
  }

  /** 新聞列表 (OpenAPI) */
  async getNews(): Promise<NewsResponse> {
    this.logger.log('Fetching TWSE news...');
    const { data } = await firstValueFrom(
      this.httpService.get<Record<string, string>[]>(
        `${this.OPENAPI_BASE}/news/newsList`,
      ),
    );

    const items: NewsDto[] = data.map((row) => {
      const raw = row['Date'] ?? '';
      const rocYear = raw.substring(0, 3);
      const month = raw.substring(3, 5);
      const day = raw.substring(5, 7);
      const adYear = parseInt(rocYear, 10) + 1911;
      const date = `${adYear}-${month}-${day}`;

      return {
        title: row['Title'] ?? '',
        url: row['Url'] ?? '',
        date,
      };
    });

    items.sort((a, b) => b.date.localeCompare(a.date));

    return { data: items, total: items.length };
  }

  /** 解析 RSS XML 為 NewsDto 陣列 */
  private parseRssXml(xml: string, source: string): NewsDto[] {
    const items: NewsDto[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = this.extractTag(block, 'title');
      const link = this.extractTag(block, 'link');
      const pubDate = this.extractTag(block, 'pubDate');
      const description = this.extractTag(block, 'description');

      if (!title || !link) continue;

      let date = '';
      if (pubDate) {
        try {
          date = new Date(pubDate).toISOString().split('T')[0];
        } catch {
          date = '';
        }
      }

      const cleanTitle = title
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s*-\s*[\w.-]+\.(com|tw|net|org)(\.\w+)*\s*$/i, '')
        .trim();

      items.push({
        title: cleanTitle,
        url: link.trim(),
        date,
        summary: description
          ? description
              .replace(/<!\[CDATA\[|\]\]>/g, '')
              .replace(/<[^>]*>/g, '')
              .trim()
              .substring(0, 200)
          : undefined,
        source,
      });
    }

    return items;
  }

  private extractTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`);
    const m = regex.exec(xml);
    return m ? m[1] : '';
  }

  /** Yahoo 奇摩台股新聞 */
  async getYahooTwStockNews(): Promise<NewsResponse> {
    this.logger.log('Fetching Yahoo TW stock news...');
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<string>(
          'https://tw.stock.yahoo.com/rss',
          this.RSS_CONFIG,
        ),
      );
      const items = this.parseRssXml(data, 'Yahoo奇摩股市').filter((item) =>
        item.url.includes('tw.stock.yahoo.com'),
      );
      return { data: items, total: items.length };
    } catch (e) {
      this.logger.error('Failed to fetch Yahoo TW stock news', e);
      return { data: [], total: 0 };
    }
  }

  /** Google News 搜尋新聞 */
  private async getGoogleNews(
    query: string,
    source: string,
  ): Promise<NewsResponse> {
    this.logger.log(`Fetching Google News: ${query}`);
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;
      const { data } = await firstValueFrom(
        this.httpService.get<string>(url, this.RSS_CONFIG),
      );
      const items = this.parseRssXml(data, source);
      return { data: items.slice(0, 30), total: Math.min(items.length, 30) };
    } catch (e) {
      this.logger.error(`Failed to fetch Google News: ${query}`, e);
      return { data: [], total: 0 };
    }
  }

  /** 美股新聞 */
  async getUsStockNews(): Promise<NewsResponse> {
    return this.getGoogleNews(
      '美股 OR 華爾街 OR 那斯達克 OR 道瓊',
      'Google 新聞',
    );
  }

  /** 國際財經新聞 */
  async getInternationalNews(): Promise<NewsResponse> {
    return this.getGoogleNews(
      '國際財經 OR 油價 OR 原物料 OR 全球經濟',
      'Google 新聞',
    );
  }

  /** 全部新聞（整合） */
  async getAllNews(): Promise<AllNewsResponse> {
    const [twStock, usStock, international, twse] = await Promise.all([
      this.getYahooTwStockNews(),
      this.getUsStockNews(),
      this.getInternationalNews(),
      this.getNews(),
    ]);
    return { twStock, usStock, international, twse };
  }

  /** 每日收盤排程：週一至週五 14:30 (UTC+8 = 06:30 UTC) */
  @Cron('0 30 6 * * 1-5')
  async saveDailyStockPrices(): Promise<number> {
    this.logger.log('排程：開始儲存每日收盤資料...');

    const [{ data }, industryMap] = await Promise.all([
      firstValueFrom(
        this.httpService.get<TwseResponse>(this.TWSE_DAILY_ALL_URL),
      ),
      this.getIndustryMap(),
    ]);

    if (data.stat !== 'OK' || !data.data?.length) {
      this.logger.warn('排程：TWSE 資料異常，跳過本次儲存');
      return 0;
    }

    const dateStr = data.date;
    const records: {
      date: string;
      code: string;
      name: string;
      closingPrice: number;
      change: number;
      tradeVolume: number;
      industry: string;
    }[] = [];

    for (const row of data.data) {
      const code = row[0]?.trim();
      const industry = industryMap.get(code);
      if (!industry) continue;

      const closingPrice = this.parseNumber(row[7]);
      const change = this.parseNumber(row[8]);
      const tradeVolume = Math.round(this.parseNumber(row[2]) / 1000);

      if (closingPrice <= 0) continue;

      records.push({
        date: dateStr,
        code,
        name: row[1]?.trim() ?? '',
        closingPrice,
        change,
        tradeVolume,
        industry,
      });
    }

    const result = await this.prisma.dailyStockPrice.createMany({
      data: records,
      skipDuplicates: true,
    });

    this.logger.log(
      `排程：已儲存 ${result.count} 筆收盤資料（日期 ${dateStr}）`,
    );
    return result.count;
  }

  private getPeriodTradingDays(period: string): number {
    switch (period) {
      case '1w':
        return 5;
      case '1m':
        return 22;
      case '3m':
        return 66;
      case '1y':
        return 252;
      default:
        return 0;
    }
  }

  /** 產業熱力圖 */
  async getHeatmap(period = '1d'): Promise<HeatmapResponse> {
    this.logger.log(`Fetching heatmap data (period: ${period})...`);

    const [{ data }, industryMap] = await Promise.all([
      firstValueFrom(
        this.httpService.get<TwseResponse>(this.TWSE_DAILY_ALL_URL),
      ),
      this.getIndustryMap(),
    ]);

    if (data.stat !== 'OK') {
      return { data: [], total: 0, date: '' };
    }

    const tradingDays = this.getPeriodTradingDays(period);
    let pastPriceMap: Map<string, number> | null = null;

    if (tradingDays > 0) {
      const dates = await this.prisma.dailyStockPrice.findMany({
        select: { date: true },
        distinct: ['date'],
        orderBy: { date: 'desc' },
        take: tradingDays + 5,
      });

      if (dates.length >= tradingDays) {
        const targetDate = dates[tradingDays - 1].date;
        const pastPrices = await this.prisma.dailyStockPrice.findMany({
          where: { date: targetDate },
          select: { code: true, closingPrice: true },
        });
        pastPriceMap = new Map(pastPrices.map((p) => [p.code, p.closingPrice]));
      }
    }

    const industryGroups = new Map<string, HeatmapStockDto[]>();

    for (const row of data.data) {
      const code = row[0]?.trim();
      const industry = industryMap.get(code);
      if (!industry) continue;

      const closingPrice = this.parseNumber(row[7]);
      const tradeVolume = Math.round(this.parseNumber(row[2]) / 1000);

      if (closingPrice <= 0 || tradeVolume <= 0) continue;

      let changePercent: number;
      let change: string;

      if (pastPriceMap) {
        const pastPrice = pastPriceMap.get(code);
        if (pastPrice && pastPrice > 0) {
          const diff = closingPrice - pastPrice;
          changePercent = Math.round((diff / pastPrice) * 10000) / 100;
          change = diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
        } else {
          changePercent = 0;
          change = '0';
        }
      } else {
        const changeRaw = row[8]?.trim() ?? '0';
        const changeVal = this.parseNumber(changeRaw);
        const prevClose = closingPrice - changeVal;
        changePercent =
          prevClose > 0 ? Math.round((changeVal / prevClose) * 10000) / 100 : 0;
        change = changeRaw;
      }

      const stock: HeatmapStockDto = {
        code,
        name: row[1]?.trim() ?? '',
        changePercent,
        closingPrice,
        change,
        tradeVolume,
      };

      if (!industryGroups.has(industry)) {
        industryGroups.set(industry, []);
      }
      industryGroups.get(industry)!.push(stock);
    }

    const industries: HeatmapIndustryDto[] = [];
    for (const [industry, stocks] of industryGroups) {
      stocks.sort(
        (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent),
      );
      const sum = stocks.reduce((acc, s) => acc + s.changePercent, 0);
      const avgChangePercent = Math.round((sum / stocks.length) * 100) / 100;
      industries.push({ industry, avgChangePercent, stocks });
    }

    industries.sort((a, b) => {
      const totalA = a.stocks.reduce((acc, s) => acc + s.tradeVolume, 0);
      const totalB = b.stocks.reduce((acc, s) => acc + s.tradeVolume, 0);
      return totalB - totalA;
    });

    return { data: industries, total: industries.length, date: data.date };
  }
}
