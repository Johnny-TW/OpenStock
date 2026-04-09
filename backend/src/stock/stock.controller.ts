import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StockService } from './stock.service';
import {
  StockDailyAllResponse,
  StockValuationResponse,
  MarketIndexResponse,
  TopVolumeResponse,
  IntradayResponse,
  IndexHistoryResponse,
  RevenueRankingResponse,
  GrossMarginRankingResponse,
  DividendYieldRankingResponse,
  PeRatioRankingResponse,
  HeatmapResponse,
  NewsResponse,
  AllNewsResponse,
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

  @ApiTags('排行榜')
  @ApiOperation({
    summary: '營收排行',
    description:
      '取得全部上市公司最新一季營業收入排行，含營業利益、稅後淨利、EPS。\n\n' +
      '資料來源：TWSE OpenAPI `opendata/t187ap14_L`',
  })
  @ApiResponse({ status: 200, description: '成功取得營收排行資料' })
  @Get('ranking/revenue')
  async getRevenueRanking(): Promise<RevenueRankingResponse> {
    return this.stockService.getRevenueRanking();
  }

  @ApiTags('排行榜')
  @ApiOperation({
    summary: '毛利率排行',
    description:
      '取得全部上市公司最新一季毛利率排行，含營業收入、營業成本、營業毛利。\n\n' +
      '資料來源：TWSE OpenAPI `opendata/t187ap06_X_ci`',
  })
  @ApiResponse({ status: 200, description: '成功取得毛利率排行資料' })
  @Get('ranking/gross-margin')
  async getGrossMarginRanking(): Promise<GrossMarginRankingResponse> {
    return this.stockService.getGrossMarginRanking();
  }

  @ApiTags('排行榜')
  @ApiOperation({
    summary: '殖利率排行',
    description:
      '取得全部上市公司當日殖利率排行，含本益比、股價淨值比。\n\n' +
      '資料來源：TWSE OpenAPI `exchangeReport/BWIBBU_ALL`',
  })
  @ApiResponse({ status: 200, description: '成功取得殖利率排行資料' })
  @Get('ranking/dividend-yield')
  async getDividendYieldRanking(): Promise<DividendYieldRankingResponse> {
    return this.stockService.getDividendYieldRanking();
  }

  @ApiTags('排行榜')
  @ApiOperation({
    summary: '本益比排行',
    description:
      '取得全部上市公司當日本益比排行（由低到高），含殖利率、股價淨值比。\n\n' +
      '資料來源：TWSE OpenAPI `exchangeReport/BWIBBU_ALL`',
  })
  @ApiResponse({ status: 200, description: '成功取得本益比排行資料' })
  @Get('ranking/pe-ratio')
  async getPeRatioRanking(): Promise<PeRatioRankingResponse> {
    return this.stockService.getPeRatioRanking();
  }

  @ApiTags('新聞')
  @ApiOperation({
    summary: '證交所新聞列表',
    description:
      '取得臺灣證券交易所最新公告與新聞。\n\n' +
      '資料來源：TWSE OpenAPI `news/newsList`',
  })
  @ApiResponse({ status: 200, description: '成功取得新聞列表' })
  @Get('news')
  async getNews(): Promise<NewsResponse> {
    return this.stockService.getNews();
  }

  @ApiTags('新聞')
  @ApiOperation({
    summary: '全部新聞（台股 + 美股 + 國際 + 證交所）',
    description:
      '整合 Yahoo 奇摩台股新聞、Google News 美股與國際財經新聞、TWSE 證交所公告。\n\n' +
      '資料來源：Yahoo RSS + Google News RSS + TWSE OpenAPI',
  })
  @ApiResponse({ status: 200, description: '成功取得全部新聞' })
  @Get('news/all')
  async getAllNews(): Promise<AllNewsResponse> {
    return this.stockService.getAllNews();
  }

  @ApiTags('熱力圖')
  @ApiOperation({
    summary: '產業漲跌熱力圖',
    description:
      '取得全部上市股票依產業分組的漲跌幅資料，用於繪製 Treemap 熱力圖。\n\n' +
      '支援期間:1d(當日)、1w(一週)、1m(一月)、3m(三月)、1y(一年)\n\n' +
      '資料來源：TWSE `exchangeReport/STOCK_DAY_ALL` + `opendata/t187ap14_L`',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['1d', '1w', '1m', '3m', '1y'],
    description: '漲跌幅計算期間，預設 1d',
  })
  @ApiResponse({ status: 200, description: '成功取得熱力圖資料' })
  @Get('heatmap')
  async getHeatmap(@Query('period') period?: string): Promise<HeatmapResponse> {
    const validPeriods = ['1d', '1w', '1m', '3m', '1y'];
    const safePeriod = validPeriods.includes(period ?? '') ? period! : '1d';
    return this.stockService.getHeatmap(safePeriod);
  }

  @ApiTags('熱力圖')
  @ApiOperation({
    summary: '手動觸發儲存每日收盤資料',
    description: '手動觸發排程，將當日 TWSE 收盤資料存入資料庫。',
  })
  @ApiResponse({ status: 200, description: '成功儲存收盤資料' })
  @Post('heatmap/save-daily')
  async saveDailyPrices(): Promise<{ count: number }> {
    const count = await this.stockService.saveDailyStockPrices();
    return { count };
  }
}
