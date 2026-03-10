/** TWSE API 原始回傳格式 */
export interface TwseResponse {
  stat: string;
  date: string;
  title: string;
  fields: string[];
  data: string[][];
  notes: string[];
}

/** 前端使用的股票日成交資訊 DTO */
export interface StockDailyDto {
  /** 證券代號 */
  code: string;
  /** 證券名稱 */
  name: string;
  /** 成交股數 */
  tradeVolume: string;
  /** 成交金額 */
  tradeValue: string;
  /** 開盤價 */
  openingPrice: string;
  /** 最高價 */
  highestPrice: string;
  /** 最低價 */
  lowestPrice: string;
  /** 收盤價 */
  closingPrice: string;
  /** 漲跌價差 */
  change: string;
  /** 成交筆數 */
  transaction: string;
}

/** 股票日成交資訊 API 回傳格式 */
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
  /** 證券代號 */
  code: string;
  /** 證券名稱 */
  name: string;
  /** 殖利率(%) */
  dividendYield: string;
  /** 股利年度 */
  dividendYear: string;
  /** 本益比 */
  peRatio: string;
  /** 股價淨值比 */
  pbRatio: string;
  /** 財報年/季 */
  financialYear: string;
}

/** 個股評價資訊 API 回傳格式 */
export interface StockValuationResponse {
  date: string;
  title: string;
  notes: string[];
  fields: string[];
  data: StockValuationDto[];
  total: number;
}
