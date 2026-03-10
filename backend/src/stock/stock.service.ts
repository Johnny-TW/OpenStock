import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  TwseResponse,
  StockDailyDto,
  StockDailyAllResponse,
  StockValuationDto,
  StockValuationResponse,
} from './dto/stock.dto';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  private readonly TWSE_DAILY_ALL_URL =
    'https://www.twse.com.tw/exchangeReport/STOCK_DAY_ALL?response=json';

  private readonly TWSE_VALUATION_URL =
    'https://www.twse.com.tw/exchangeReport/BWIBBU_ALL?response=json';

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
}
