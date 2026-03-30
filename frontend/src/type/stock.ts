export interface WatchlistItem {
  id: number
  userId: string
  stockNo: string
  stockName: string
  groupName: string
  createdAt: string
}

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

// ===== TWSE OpenAPI Types =====

/** 大盤/類股指數 */
export interface MarketIndexDto {
  date: string;
  name: string;
  closingIndex: string;
  direction: string;
  changePoints: string;
  changePercent: string;
}

export interface MarketIndexResponse {
  data: MarketIndexDto[];
  total: number;
}

/** 成交量前 20 */
export interface TopVolumeDto {
  date: string;
  rank: string;
  code: string;
  name: string;
  tradeVolume: string;
  transaction: string;
  openingPrice: string;
  highestPrice: string;
  lowestPrice: string;
  closingPrice: string;
  direction: string;
  change: string;
}

export interface TopVolumeResponse {
  data: TopVolumeDto[];
  total: number;
}

/** 盤中五秒累計 */
export interface IntradayTickDto {
  time: string;
  accTradeVolume: string;
  accTradeValue: string;
  accTransaction: string;
}

export interface IntradayResponse {
  data: IntradayTickDto[];
  total: number;
}

/** 指數歷史 OHLC */
export interface IndexHistoryDto {
  date: string;
  openingIndex: string;
  highestIndex: string;
  lowestIndex: string;
  closingIndex: string;
}

export interface IndexHistoryResponse {
  data: IndexHistoryDto[];
  total: number;
}
