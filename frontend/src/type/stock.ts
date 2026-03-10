/** 股票日成交資訊 DTO (與後端對應) */
export interface StockDailyDto {
  code: string;
  name: string;
  tradeVolume: string;
  tradeValue: string;
  openingPrice: string;
  highestPrice: string;
  lowestPrice: string;
  closingPrice: string;
  change: string;
  transaction: string;
}

export interface StockDailyAllResponse {
  date: string;
  title: string;
  notes: string[];
  fields: string[];
  data: StockDailyDto[];
  total: number;
}

/** 個股本益比、殖利率、股價淨值比 DTO */
export interface StockValuationDto {
  code: string;
  name: string;
  dividendYield: string;
  dividendYear: string;
  peRatio: string;
  pbRatio: string;
  financialYear: string;
}

export interface StockValuationResponse {
  date: string;
  title: string;
  notes: string[];
  fields: string[];
  data: StockValuationDto[];
  total: number;
}
