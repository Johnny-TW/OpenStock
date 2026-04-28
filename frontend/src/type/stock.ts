export interface WatchlistItem {
  id: number;
  userId: string;
  stockNo: string;
  stockName: string;
  groupName: string;
  createdAt: string;
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
  industry: string;
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

// TWSE OpenAPI Types
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

// Ranking Types
export interface RevenueRankingDto {
  code: string;
  name: string;
  industry: string;
  revenue: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
}

export interface RevenueRankingResponse {
  data: RevenueRankingDto[];
  total: number;
  year: string;
  quarter: string;
}

export interface GrossMarginRankingDto {
  code: string;
  name: string;
  industry: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  grossMarginRate: number;
}

export interface GrossMarginRankingResponse {
  data: GrossMarginRankingDto[];
  total: number;
  year: string;
  quarter: string;
}

export interface DividendYieldRankingDto {
  code: string;
  name: string;
  industry: string;
  dividendYield: number;
  peRatio: number;
  pbRatio: number;
}

export interface DividendYieldRankingResponse {
  data: DividendYieldRankingDto[];
  total: number;
}

export interface PeRatioRankingDto {
  code: string;
  name: string;
  industry: string;
  peRatio: number;
  dividendYield: number;
  pbRatio: number;
}

export interface PeRatioRankingResponse {
  data: PeRatioRankingDto[];
  total: number;
}

// News Types
export interface NewsDto {
  title: string;
  url: string;
  date: string;
  summary?: string;
  source?: string;
  image?: string;
}

export interface NewsResponse {
  data: NewsDto[];
  total: number;
}

export interface AllNewsResponse {
  twStock: NewsResponse;
  usStock: NewsResponse;
  international: NewsResponse;
  twse: NewsResponse;
}

// Heatmap Types
export interface HeatmapStockDto {
  code: string;
  name: string;
  changePercent: number;
  closingPrice: number;
  change: string;
  tradeVolume: number;
}

export interface HeatmapIndustryDto {
  industry: string;
  avgChangePercent: number;
  stocks: HeatmapStockDto[];
}

export interface HeatmapResponse {
  data: HeatmapIndustryDto[];
  total: number;
  date: string;
}

export interface StockDetailDto {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  forwardPE: number;
  eps: number;
  dividendYield: number;
  pbRatio: number;
  week52High: number;
  week52Low: number;
  beta: number;
  previousClose: number;
  avgVolume: number;
  fiftyDayAvg: number;
  twoHundredDayAvg: number;
  returnOnEquity: number;
  returnOnAssets: number;
  grossMargins: number;
  operatingMargins: number;
  profitMargins: number;
  revenueGrowth: number;
  earningsGrowth: number;
  debtToEquity: number;
  currentRatio: number;
  bookValue: number;
  targetMeanPrice: number;
  targetHighPrice: number;
  targetLowPrice: number;
  numberOfAnalysts: number;
  recommendationKey: string;
  payoutRatio: number;
  exDividendDate: string;
  dividendRate: number;
  sharesOutstanding: number;
  sector: string;
  industry: string;
}

export interface StockDetailResponse {
  data: StockDetailDto;
}

export interface StockHistoryPointDto {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export interface StockHistoryResponse {
  symbol: string;
  period: string;
  data: StockHistoryPointDto[];
  total: number;
}
