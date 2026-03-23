import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StockService } from './stock.service';
import {
  StockDailyAllResponse,
  StockValuationResponse,
  MarketIndexResponse,
  TopVolumeResponse,
  IntradayResponse,
  IndexHistoryResponse,
} from './dto/stock.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @ApiTags('證券交易')
  @ApiOperation({
    summary: '上市個股日成交資訊',
    description:
      '取得當日全部上市股票的成交量、成交金額、開盤價、最高價、最低價、收盤價、漲跌及成交筆數。\n\n' +
      '資料來源：TWSE `exchangeReport/STOCK_DAY_ALL`',
  })
  @ApiResponse({ status: 200, description: '成功取得上市個股日成交資訊' })
  @Get('daily-all')
  async getDailyAll(): Promise<StockDailyAllResponse> {
    return this.stockService.getDailyAll();
  }

  @ApiTags('證券交易')
  @ApiOperation({
    summary: '上市個股日本益比、殖利率及股價淨值比',
    description:
      '取得全部上市股票的殖利率、本益比、股價淨值比等基本面估值指標。\n\n' +
      '資料來源：TWSE `exchangeReport/BWIBBU_ALL`',
  })
  @ApiResponse({ status: 200, description: '成功取得估值資料' })
  @Get('valuation')
  async getValuation(): Promise<StockValuationResponse> {
    return this.stockService.getValuation();
  }

  @ApiTags('指數')
  @ApiOperation({
    summary: '每日收盤行情—大盤統計資訊',
    description:
      '取得大盤及各類股指數的每日收盤資訊，包含收盤指數、漲跌點數及漲跌百分比。\n\n' +
      '資料來源：TWSE OpenAPI `exchangeReport/MI_INDEX`',
  })
  @ApiResponse({ status: 200, description: '成功取得大盤統計資訊' })
  @Get('market-index')
  async getMarketIndex(): Promise<MarketIndexResponse> {
    return this.stockService.getMarketIndex();
  }

  @ApiTags('證券交易')
  @ApiOperation({
    summary: '成交量前 20 名',
    description:
      '取得當日成交量排行前 20 名的上市股票，包含開高低收、漲跌幅。\n\n' +
      '資料來源：TWSE OpenAPI `exchangeReport/MI_INDEX20`',
  })
  @ApiResponse({ status: 200, description: '成功取得成交量前 20 名資料' })
  @Get('top-volume')
  async getTopVolume(): Promise<TopVolumeResponse> {
    return this.stockService.getTopVolume();
  }

  @ApiTags('指數')
  @ApiOperation({
    summary: '盤中五秒累計成交資訊',
    description:
      '取得大盤每五秒鐘累計成交量、成交值及成交筆數。\n\n' +
      '資料來源：TWSE OpenAPI `exchangeReport/MI_5MINS`',
  })
  @ApiResponse({ status: 200, description: '成功取得盤中即時成交資訊' })
  @Get('intraday')
  async getIntraday(): Promise<IntradayResponse> {
    return this.stockService.getIntraday();
  }

  @ApiTags('指數')
  @ApiOperation({
    summary: '發行量加權股價指數歷史資料',
    description:
      '取得加權指數每日開高低收歷史資料。\n\n' +
      '資料來源：TWSE OpenAPI `indicesReport/MI_5MINS_HIST`',
  })
  @ApiResponse({ status: 200, description: '成功取得指數歷史資料' })
  @Get('index-history')
  async getIndexHistory(): Promise<IndexHistoryResponse> {
    return this.stockService.getIndexHistory();
  }
}
