import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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
} from './dto/stock.dto';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  private readonly TWSE_DAILY_ALL_URL =
    'https://www.twse.com.tw/exchangeReport/STOCK_DAY_ALL?response=json';

  private readonly TWSE_VALUATION_URL =
    'https://www.twse.com.tw/exchangeReport/BWIBBU_ALL?response=json';

  private readonly OPENAPI_BASE = 'https://openapi.twse.com.tw/v1';

  constructor(private readonly httpService: HttpService) {}

  async getDailyAll(): Promise<StockDailyAllResponse> {
    this.logger.log('Fetching TWSE daily stock data...');

    const { data } = await firstValueFrom(
      this.httpService.get<TwseResponse>(this.TWSE_DAILY_ALL_URL),
    );

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
}
