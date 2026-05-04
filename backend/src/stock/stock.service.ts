import * as https from 'node:https';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { AxiosRequestConfig } from 'axios';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

import { PrismaService } from '../prisma/prisma.service';
import {
  AllNewsResponse,
  DividendYieldRankingDto,
  DividendYieldRankingResponse,
  GrossMarginRankingDto,
  GrossMarginRankingResponse,
  HeatmapIndustryDto,
  HeatmapResponse,
  HeatmapStockDto,
  IndexHistoryDto,
  IndexHistoryResponse,
  IntradayResponse,
  IntradayTickDto,
  MarketIndexDto,
  MarketIndexResponse,
  NewsDto,
  NewsResponse,
  PeRatioRankingDto,
  PeRatioRankingResponse,
  RevenueRankingDto,
  RevenueRankingResponse,
  StockDailyAllResponse,
  StockDailyDto,
  StockDetailDto,
  StockDetailResponse,
  StockHistoryPointDto,
  StockHistoryResponse,
  StockValuationDto,
  StockValuationResponse,
  TopVolumeDto,
  TopVolumeResponse,
  TwseResponse,
} from './dto/stock.dto';

@Injectable()
export class StockService implements OnModuleInit {
  private readonly logger = new Logger(StockService.name);

  private readonly TWSE_DAILY_ALL_URL =
    'https://www.twse.com.tw/exchangeReport/STOCK_DAY_ALL?response=json';

  private readonly TWSE_VALUATION_URL =
    'https://www.twse.com.tw/exchangeReport/BWIBBU_ALL?response=json';

  private readonly OPENAPI_BASE = 'https://openapi.twse.com.tw/v1';

  private industryMapCache: Map<string, string> | null = null;
  private industryMapCacheTime = 0;
  private stockNameCache: Map<string, string> | null = null;
  private stockNameCacheTime = 0;
  private readonly INDUSTRY_CACHE_TTL = 30 * 60 * 1000;
  private readonly RSS_CONFIG: AxiosRequestConfig = { responseType: 'text' };
  private readonly GOOGLE_RSS_CONFIG: AxiosRequestConfig = {
    responseType: 'text',
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  };

  private static readonly CACHE_TTL = {
    DAILY: 5 * 60 * 1000,
    VALUATION: 10 * 60 * 1000,
    MARKET: 60 * 1000,
    NEWS: 10 * 60 * 1000,
    RANKING: 30 * 60 * 1000,
    HEATMAP: 5 * 60 * 1000,
    DETAIL: 3 * 60 * 1000,
    HISTORY: 5 * 60 * 1000,
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async onModuleInit() {
    const taipei = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      hour12: false,
    }).formatToParts(new Date());

    const get = (type: string) => taipei.find((p) => p.type === type)?.value ?? '';
    const weekday = get('weekday');
    if (weekday === 'Sat' || weekday === 'Sun') return;

    const hour = Number(get('hour'));
    if (hour < 15) {
      this.logger.log('啟動補存：尚未收盤，跳過');
      return;
    }

    const dateStr = `${get('year')}${get('month')}${get('day')}`;

    const existing = await this.prisma.dailyStockPrice.findFirst({
      where: { date: dateStr },
    });

    if (existing) {
      this.logger.log(`啟動補存：${dateStr} 資料已存在，跳過`);
      return;
    }

    this.logger.log(`啟動補存：${dateStr} 資料缺失，開始補存...`);
    const count = await this.saveDailyStockPrices();
    this.logger.log(`啟動補存：已補存 ${count} 筆`);
  }

  private async cachedFetch<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);
    if (cached) {
      this.logger.debug(`Cache HIT: ${key}`);
      return cached;
    }
    this.logger.debug(`Cache MISS: ${key}`);
    const result = await fetcher();
    await this.cacheManager.set(key, result, ttl);
    return result;
  }

  async getDailyAll(): Promise<StockDailyAllResponse> {
    return this.cachedFetch('stock:daily-all', StockService.CACHE_TTL.DAILY, async () => {
      this.logger.log('Fetching TWSE daily stock data...');

      const [{ data }, industryMap] = await Promise.all([
        firstValueFrom(this.httpService.get<TwseResponse>(this.TWSE_DAILY_ALL_URL)),
        this.getIndustryMap(),
      ]);

      if (data.stat !== 'OK' || !Array.isArray(data.data)) {
        this.logger.warn(`TWSE API returned stat: ${data.stat}, data: ${typeof data.data}`);
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
    });
  }

  async getValuation(): Promise<StockValuationResponse> {
    return this.cachedFetch('stock:valuation', StockService.CACHE_TTL.VALUATION, async () => {
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
    });
  }

  /** 大盤/類股指數 (OpenAPI) */
  async getMarketIndex(): Promise<MarketIndexResponse> {
    return this.cachedFetch('stock:market-index', StockService.CACHE_TTL.MARKET, async () => {
      this.logger.log('Fetching TWSE market index...');
      const { data } = await firstValueFrom(
        this.httpService.get<Record<string, string>[]>(
          `${this.OPENAPI_BASE}/exchangeReport/MI_INDEX`,
        ),
      );

      const items: MarketIndexDto[] = data.map((row) => ({
        date: row.日期 ?? '',
        name: row.指數 ?? '',
        closingIndex: row.收盤指數 ?? '',
        direction: row.漲跌 ?? '',
        changePoints: row.漲跌點數 ?? '',
        changePercent: row.漲跌百分比 ?? '',
      }));

      return { data: items, total: items.length };
    });
  }

  /** 成交量前 20 (OpenAPI) */
  async getTopVolume(): Promise<TopVolumeResponse> {
    return this.cachedFetch('stock:top-volume', StockService.CACHE_TTL.MARKET, async () => {
      this.logger.log('Fetching TWSE top volume...');
      const { data } = await firstValueFrom(
        this.httpService.get<Record<string, string>[]>(
          `${this.OPENAPI_BASE}/exchangeReport/MI_INDEX20`,
        ),
      );

      const items: TopVolumeDto[] = data.map((row) => ({
        date: row.Date ?? '',
        rank: row.Rank ?? '',
        code: row.Code ?? '',
        name: row.Name ?? '',
        tradeVolume: row.TradeVolume ?? '',
        transaction: row.Transaction ?? '',
        openingPrice: row.OpeningPrice ?? '',
        highestPrice: row.HighestPrice ?? '',
        lowestPrice: row.LowestPrice ?? '',
        closingPrice: row.ClosingPrice ?? '',
        direction: row.Dir ?? '',
        change: row.Change ?? '',
      }));

      return { data: items, total: items.length };
    });
  }

  /** 盤中五秒累計 (OpenAPI) */
  async getIntraday(): Promise<IntradayResponse> {
    return this.cachedFetch('stock:intraday', StockService.CACHE_TTL.MARKET, async () => {
      this.logger.log('Fetching TWSE intraday 5-min data...');
      const { data } = await firstValueFrom(
        this.httpService.get<Record<string, string>[]>(
          `${this.OPENAPI_BASE}/exchangeReport/MI_5MINS`,
        ),
      );

      const items: IntradayTickDto[] = data.map((row) => ({
        time: row.Time ?? '',
        accTradeVolume: row.AccTradeVolume ?? '',
        accTradeValue: row.AccTradeValue ?? '',
        accTransaction: row.AccTransaction ?? '',
      }));

      return { data: items, total: items.length };
    });
  }

  /** 指數歷史 OHLC (OpenAPI) */
  async getIndexHistory(): Promise<IndexHistoryResponse> {
    return this.cachedFetch('stock:index-history', StockService.CACHE_TTL.DAILY, async () => {
      this.logger.log('Fetching TWSE index history...');
      const { data } = await firstValueFrom(
        this.httpService.get<Record<string, string>[]>(
          `${this.OPENAPI_BASE}/indicesReport/MI_5MINS_HIST`,
        ),
      );

      const items: IndexHistoryDto[] = data.map((row) => ({
        date: row.Date ?? row.日期 ?? '',
        openingIndex: row.OpeningIndex ?? row.開盤指數 ?? '',
        highestIndex: row.HighestIndex ?? row.最高指數 ?? '',
        lowestIndex: row.LowestIndex ?? row.最低指數 ?? '',
        closingIndex: row.ClosingIndex ?? row.收盤指數 ?? '',
      }));

      return { data: items, total: items.length };
    });
  }

  private parseNumber(value: string): number {
    if (!value || value === '--' || value.trim() === '') return 0;
    return parseFloat(value.replace(/,/g, '')) || 0;
  }

  private async getIndustryMap(): Promise<Map<string, string>> {
    const now = Date.now();
    if (this.industryMapCache && now - this.industryMapCacheTime < this.INDUSTRY_CACHE_TTL) {
      return this.industryMapCache;
    }
    this.logger.log('Fetching industry map from t187ap14_L...');
    const { data } = await firstValueFrom(
      this.httpService.get<Record<string, string>[]>(`${this.OPENAPI_BASE}/opendata/t187ap14_L`),
    );
    const map = new Map<string, string>();
    for (const row of data) {
      const code = row.公司代號?.trim();
      const industry = row.產業別?.trim();
      if (code && industry) map.set(code, industry);
    }
    this.industryMapCache = map;
    this.industryMapCacheTime = now;
    return map;
  }

  private async getTwseStockName(code: string): Promise<string> {
    const now = Date.now();
    if (!this.stockNameCache || now - this.stockNameCacheTime >= this.INDUSTRY_CACHE_TTL) {
      const { data } = await firstValueFrom(
        this.httpService.get<TwseResponse>(this.TWSE_DAILY_ALL_URL),
      );
      const map = new Map<string, string>();
      if (data.stat === 'OK' && data.data) {
        for (const row of data.data) {
          if (row[0] && row[1]) map.set(row[0].trim(), row[1].trim());
        }
      }
      this.stockNameCache = map;
      this.stockNameCacheTime = now;
    }
    return this.stockNameCache.get(code) ?? '';
  }

  /** 營收排行 (t187ap14_L 簡明損益表) */
  async getRevenueRanking(): Promise<RevenueRankingResponse> {
    return this.cachedFetch('stock:ranking:revenue', StockService.CACHE_TTL.RANKING, async () => {
      this.logger.log('Fetching revenue ranking...');
      const { data } = await firstValueFrom(
        this.httpService.get<Record<string, string>[]>(`${this.OPENAPI_BASE}/opendata/t187ap14_L`),
      );

      const year = data[0]?.年度 ?? '';
      const quarter = data[0]?.季別 ?? '';

      const items: RevenueRankingDto[] = data
        .map((row) => ({
          code: row.公司代號?.trim() ?? '',
          name: row.公司名稱?.trim() ?? '',
          industry: row.產業別?.trim() ?? '',
          revenue: this.parseNumber(row.營業收入),
          operatingIncome: this.parseNumber(row.營業利益),
          netIncome: this.parseNumber(row.稅後淨利),
          eps: this.parseNumber(row['基本每股盈餘(元)']),
        }))
        .filter((item) => item.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue);

      return { data: items, total: items.length, year, quarter };
    });
  }

  /** 毛利率排行 (t187ap06_X_ci 綜合損益表-一般業) */
  async getGrossMarginRanking(): Promise<GrossMarginRankingResponse> {
    return this.cachedFetch(
      'stock:ranking:gross-margin',
      StockService.CACHE_TTL.RANKING,
      async () => {
        this.logger.log('Fetching gross margin ranking...');
        const [{ data }, industryMap] = await Promise.all([
          firstValueFrom(
            this.httpService.get<Record<string, string>[]>(
              `${this.OPENAPI_BASE}/opendata/t187ap06_X_ci`,
            ),
          ),
          this.getIndustryMap(),
        ]);

        const year = data[0]?.年度 ?? '';
        const quarter = data[0]?.季別 ?? '';

        const items: GrossMarginRankingDto[] = data
          .map((row) => {
            const revenue = this.parseNumber(row.營業收入);
            const cost = this.parseNumber(row.營業成本);
            const grossProfit = this.parseNumber(
              row['營業毛利（毛損）淨額'] || row['營業毛利（毛損）'],
            );
            const grossMarginRate =
              revenue > 0 ? Math.round((grossProfit / revenue) * 10000) / 100 : 0;
            const code = row.公司代號?.trim() ?? '';
            return {
              code,
              name: row.公司名稱?.trim() ?? '',
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
      },
    );
  }

  /** 殖利率排行 (BWIBBU_ALL OpenAPI) */
  async getDividendYieldRanking(): Promise<DividendYieldRankingResponse> {
    return this.cachedFetch('stock:ranking:dividend', StockService.CACHE_TTL.RANKING, async () => {
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
          const code = row.Code?.trim() ?? '';
          return {
            code,
            name: row.Name?.trim() ?? '',
            industry: industryMap.get(code) ?? '',
            dividendYield: this.parseNumber(row.DividendYield),
            peRatio: this.parseNumber(row.PEratio),
            pbRatio: this.parseNumber(row.PBratio),
          };
        })
        .filter((item) => item.dividendYield > 0)
        .sort((a, b) => b.dividendYield - a.dividendYield);

      return { data: items, total: items.length };
    });
  }

  /** 本益比排行 (BWIBBU_ALL OpenAPI) */
  async getPeRatioRanking(): Promise<PeRatioRankingResponse> {
    return this.cachedFetch('stock:ranking:pe', StockService.CACHE_TTL.RANKING, async () => {
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
          const code = row.Code?.trim() ?? '';
          return {
            code,
            name: row.Name?.trim() ?? '',
            industry: industryMap.get(code) ?? '',
            peRatio: this.parseNumber(row.PEratio),
            dividendYield: this.parseNumber(row.DividendYield),
            pbRatio: this.parseNumber(row.PBratio),
          };
        })
        .filter((item) => item.peRatio > 0)
        .sort((a, b) => a.peRatio - b.peRatio);

      return { data: items, total: items.length };
    });
  }

  /** 新聞列表 (OpenAPI) */
  async getNews(): Promise<NewsResponse> {
    return this.cachedFetch('stock:news:twse', StockService.CACHE_TTL.NEWS, async () => {
      this.logger.log('Fetching TWSE news...');
      const { data } = await firstValueFrom(
        this.httpService.get<Record<string, string>[]>(`${this.OPENAPI_BASE}/news/newsList`),
      );

      const items: NewsDto[] = data.map((row) => {
        const raw = row.Date ?? '';
        const rocYear = raw.substring(0, 3);
        const month = raw.substring(3, 5);
        const day = raw.substring(5, 7);
        const adYear = parseInt(rocYear, 10) + 1911;
        const date = `${adYear}-${month}-${day}`;

        return {
          title: row.Title ?? '',
          url: row.Url ?? '',
          date,
        };
      });

      items.sort((a, b) => b.date.localeCompare(a.date));

      return { data: items, total: items.length };
    });
  }

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

      const rawDesc = description ? description.replace(/<!\[CDATA\[|\]\]>/g, '') : '';

      const imgMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
      const image = imgMatch?.[1] || undefined;

      const enclosure = block.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
      const mediaContent = block.match(/<media:content[^>]+url=["']([^"']+)["']/i);

      items.push({
        title: cleanTitle,
        url: link.trim(),
        date,
        summary: rawDesc
          ? rawDesc
              .replace(/<[^>]*>/g, '')
              .trim()
              .substring(0, 200)
          : undefined,
        source,
        image: image || enclosure?.[1] || mediaContent?.[1] || undefined,
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
        this.httpService.get<string>('https://tw.stock.yahoo.com/rss', this.RSS_CONFIG),
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
  private async getGoogleNews(query: string, source: string): Promise<NewsResponse> {
    this.logger.log(`Fetching Google News: ${query}`);
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;
      const { data } = await firstValueFrom(
        this.httpService.get<string>(url, this.GOOGLE_RSS_CONFIG),
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
    return this.getGoogleNews('美股 OR 華爾街 OR 那斯達克 OR 道瓊', 'Google 新聞');
  }

  /** 國際財經新聞 */
  async getInternationalNews(): Promise<NewsResponse> {
    return this.getGoogleNews('國際財經 OR 油價 OR 原物料 OR 全球經濟', 'Google 新聞');
  }

  /** 全部新聞（整合） */
  async getAllNews(): Promise<AllNewsResponse> {
    return this.cachedFetch('stock:news:all', StockService.CACHE_TTL.NEWS, async () => {
      const [twStock, usStock, international, twse] = await Promise.all([
        this.getYahooTwStockNews(),
        this.getUsStockNews(),
        this.getInternationalNews(),
        this.getNews(),
      ]);
      return { twStock, usStock, international, twse };
    });
  }

  /** 每日收盤排程：台北時間週一至週五 15:00 */
  @Cron('0 0 15 * * 1-5', { timeZone: 'Asia/Taipei' })
  async saveDailyStockPrices(): Promise<number> {
    this.logger.log('排程：開始儲存每日收盤資料...');

    const [{ data }, industryMap] = await Promise.all([
      firstValueFrom(this.httpService.get<TwseResponse>(this.TWSE_DAILY_ALL_URL)),
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

    this.logger.log(`排程：已儲存 ${result.count} 筆收盤資料（日期 ${dateStr}）`);
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
    return this.cachedFetch(`stock:heatmap:${period}`, StockService.CACHE_TTL.HEATMAP, async () => {
      this.logger.log(`Fetching heatmap data (period: ${period})...`);

      const [{ data }, industryMap] = await Promise.all([
        firstValueFrom(this.httpService.get<TwseResponse>(this.TWSE_DAILY_ALL_URL)),
        this.getIndustryMap(),
      ]);

      if (data.stat !== 'OK' || !Array.isArray(data.data)) {
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
          changePercent = prevClose > 0 ? Math.round((changeVal / prevClose) * 10000) / 100 : 0;
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
        stocks.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
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
    });
  }

  async getStockDetail(symbol: string): Promise<StockDetailResponse> {
    return this.cachedFetch(`stock:detail:${symbol}`, StockService.CACHE_TTL.DETAIL, async () => {
      const isTwStock = /^\d{4,6}$/.test(symbol);
      const yahooSymbol = isTwStock ? `${symbol}.TW` : symbol;

      try {
        const [quote, summary, twseName] = await Promise.all([
          yahooFinance.quote(yahooSymbol) as Promise<Record<string, number | string | undefined>>,
          yahooFinance.quoteSummary(yahooSymbol, {
            modules: ['financialData', 'defaultKeyStatistics', 'summaryDetail', 'assetProfile'],
          }) as Promise<{
            financialData?: Record<string, number | string | undefined>;
            defaultKeyStatistics?: Record<string, number | string | undefined>;
            summaryDetail?: Record<string, number | string | undefined>;
            assetProfile?: Record<string, number | string | undefined>;
          }>,
          isTwStock ? this.getTwseStockName(symbol) : Promise.resolve(''),
        ]);

        const financial = summary.financialData ?? {};
        const keyStats = summary.defaultKeyStatistics ?? {};
        const summaryDetail = summary.summaryDetail ?? {};
        const profile = summary.assetProfile ?? {};

        const price = (quote.regularMarketPrice as number) ?? 0;
        const trailingPE = (summaryDetail.trailingPE as number) ?? 0;

        const exDivRaw = summaryDetail.exDividendDate;
        const exDividendDate =
          exDivRaw && typeof exDivRaw === 'object' && 'toISOString' in (exDivRaw as object)
            ? (exDivRaw as Date).toISOString().split('T')[0]
            : typeof exDivRaw === 'string'
              ? exDivRaw
              : '';

        const detail: StockDetailDto = {
          symbol,
          name: twseName || (quote.shortName as string) || (quote.longName as string) || symbol,
          longName: (quote.longName as string) || (quote.shortName as string) || '',
          price,
          change: (quote.regularMarketChange as number) ?? 0,
          changePercent: (quote.regularMarketChangePercent as number) ?? 0,
          open: (quote.regularMarketOpen as number) ?? 0,
          high: (quote.regularMarketDayHigh as number) ?? 0,
          low: (quote.regularMarketDayLow as number) ?? 0,
          volume: (quote.regularMarketVolume as number) ?? 0,
          marketCap: (quote.marketCap as number) ?? 0,
          peRatio: trailingPE,
          forwardPE: (summaryDetail.forwardPE as number) ?? (keyStats.forwardPE as number) ?? 0,
          eps: (financial.earningsGrowth as number)
            ? price / (trailingPE || 1)
            : ((keyStats.trailingEps as number) ?? 0),
          dividendYield: ((summaryDetail.dividendYield as number) ?? 0) * 100,
          pbRatio: (keyStats.priceToBook as number) ?? 0,
          week52High: (summaryDetail.fiftyTwoWeekHigh as number) ?? 0,
          week52Low: (summaryDetail.fiftyTwoWeekLow as number) ?? 0,
          beta: (keyStats.beta as number) ?? (summaryDetail.beta as number) ?? 0,
          previousClose: (quote.regularMarketPreviousClose as number) ?? 0,
          avgVolume: (quote.averageDailyVolume3Month as number) ?? 0,
          fiftyDayAvg: (quote.fiftyDayAverage as number) ?? 0,
          twoHundredDayAvg: (quote.twoHundredDayAverage as number) ?? 0,
          returnOnEquity: (financial.returnOnEquity as number) ?? 0,
          returnOnAssets: (financial.returnOnAssets as number) ?? 0,
          grossMargins: (financial.grossMargins as number) ?? 0,
          operatingMargins: (financial.operatingMargins as number) ?? 0,
          profitMargins: (financial.profitMargins as number) ?? 0,
          revenueGrowth: (financial.revenueGrowth as number) ?? 0,
          earningsGrowth: (financial.earningsGrowth as number) ?? 0,
          debtToEquity: (financial.debtToEquity as number) ?? 0,
          currentRatio: (financial.currentRatio as number) ?? 0,
          bookValue: (keyStats.bookValue as number) ?? 0,
          targetMeanPrice: (financial.targetMeanPrice as number) ?? 0,
          targetHighPrice: (financial.targetHighPrice as number) ?? 0,
          targetLowPrice: (financial.targetLowPrice as number) ?? 0,
          numberOfAnalysts: (financial.numberOfAnalystOpinions as number) ?? 0,
          recommendationKey: (financial.recommendationKey as string) ?? '',
          payoutRatio: (summaryDetail.payoutRatio as number) ?? 0,
          exDividendDate,
          dividendRate: (summaryDetail.dividendRate as number) ?? 0,
          sharesOutstanding:
            (keyStats.sharesOutstanding as number) ?? (keyStats.floatShares as number) ?? 0,
          sector: (profile.sector as string) ?? '',
          industry: (profile.industry as string) ?? '',
        };

        return { data: detail };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`取得 ${symbol} 詳細資料失敗: ${message}`);
        throw new NotFoundException(`查無此股票資料：${symbol}`);
      }
    });
  }

  async getStockHistory(symbol: string, period: string): Promise<StockHistoryResponse> {
    return this.cachedFetch(
      `stock:history:${symbol}:${period}`,
      StockService.CACHE_TTL.HISTORY,
      async () => {
        const isTwStock = /^\d{4,6}$/.test(symbol);
        const yahooSymbol = isTwStock ? `${symbol}.TW` : symbol;

        const periodMap: Record<string, { period1: string; interval: string }> = {
          '1d': {
            period1: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            interval: '5m',
          },
          '5d': {
            period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            interval: '15m',
          },
          '1m': {
            period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            interval: '1d',
          },
          '3m': {
            period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            interval: '1d',
          },
          '6m': {
            period1: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            interval: '1d',
          },
          '1y': {
            period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            interval: '1wk',
          },
          '5y': {
            period1: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            interval: '1wk',
          },
          all: {
            period1: '2000-01-01',
            interval: '1mo',
          },
        };

        const config = periodMap[period] ?? periodMap['1m'];

        try {
          interface YahooQuote {
            date: Date | string | number;
            close: number | null;
            open: number | null;
            high: number | null;
            low: number | null;
            volume: number | null;
          }
          const result = (await yahooFinance.chart(yahooSymbol, {
            period1: config.period1,
            interval: config.interval as '1d',
          })) as { quotes?: YahooQuote[] };

          const quotes: YahooQuote[] = result.quotes ?? [];

          const data: StockHistoryPointDto[] = quotes
            .filter((q) => q.close != null)
            .map((q) => ({
              date: new Date(q.date).toISOString(),
              close: Math.round((q.close ?? 0) * 100) / 100,
              open: Math.round((q.open ?? 0) * 100) / 100,
              high: Math.round((q.high ?? 0) * 100) / 100,
              low: Math.round((q.low ?? 0) * 100) / 100,
              volume: q.volume ?? 0,
            }));

          return { symbol, period, data, total: data.length };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.error(`取得 ${symbol} 歷史資料失敗: ${message}`);
          throw error;
        }
      },
    );
  }
}
