import { Controller, Get } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockDailyAllResponse, StockValuationResponse } from './dto/stock.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * GET /stock/daily-all
   * 取得當日全部股票日成交資訊
   */
  @Get('daily-all')
  async getDailyAll(): Promise<StockDailyAllResponse> {
    return this.stockService.getDailyAll();
  }

  /**
   * GET /stock/valuation
   * 取得個股本益比、殖利率、股價淨值比
   */
  @Get('valuation')
  async getValuation(): Promise<StockValuationResponse> {
    return this.stockService.getValuation();
  }
}
