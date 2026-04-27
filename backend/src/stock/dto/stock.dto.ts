import { ApiProperty } from '@nestjs/swagger';

export interface TwseResponse {
  stat: string;
  date: string;
  title: string;
  fields: string[];
  data: string[][];
  notes: string[];
}

export class StockDailyDto {
  @ApiProperty({ example: '0050', description: '證券代號' })
  code: string;

  @ApiProperty({ example: '元大台灣50', description: '證券名稱' })
  name: string;

  @ApiProperty({ example: '5,254,070', description: '成交股數' })
  tradeVolume: string;

  @ApiProperty({ example: '1,015,023,880', description: '成交金額' })
  tradeValue: string;

  @ApiProperty({ example: '193.30', description: '開盤價' })
  openingPrice: string;

  @ApiProperty({ example: '194.00', description: '最高價' })
  highestPrice: string;

  @ApiProperty({ example: '192.60', description: '最低價' })
  lowestPrice: string;

  @ApiProperty({ example: '193.55', description: '收盤價' })
  closingPrice: string;

  @ApiProperty({ example: '+0.35', description: '漲跌價差' })
  change: string;

  @ApiProperty({ example: '3,120', description: '成交筆數' })
  transaction: string;

  @ApiProperty({ example: '半導體業', description: '產業別' })
  industry: string;
}

export class StockDailyAllResponse {
  @ApiProperty({ example: '20260311', description: '資料日期' })
  date: string;

  @ApiProperty({ example: '115年03月 每日收盤行情', description: '報表標題' })
  title: string;

  @ApiProperty({ description: '附註說明' })
  notes: string[];

  @ApiProperty({ description: '欄位名稱' })
  fields: string[];

  @ApiProperty({ type: [StockDailyDto], description: '個股成交資訊陣列' })
  data: StockDailyDto[];

  @ApiProperty({ example: 980, description: '資料總筆數' })
  total: number;
}

// 上市個股日本益比、殖利率及股價淨值比
export class StockValuationDto {
  @ApiProperty({ example: '0050', description: '證券代號' })
  code: string;

  @ApiProperty({ example: '元大台灣50', description: '證券名稱' })
  name: string;

  @ApiProperty({ example: '3.12', description: '殖利率 (%)' })
  dividendYield: string;

  @ApiProperty({ example: '114', description: '股利年度' })
  dividendYear: string;

  @ApiProperty({ example: '18.52', description: '本益比' })
  peRatio: string;

  @ApiProperty({ example: '2.35', description: '股價淨值比' })
  pbRatio: string;

  @ApiProperty({ example: '114', description: '財報年/季' })
  financialYear: string;
}

export class StockValuationResponse {
  @ApiProperty({ example: '20260311' })
  date: string;

  @ApiProperty({ example: '115年03月 本益比、殖利率及股價淨值比' })
  title: string;

  @ApiProperty() notes: string[];
  @ApiProperty() fields: string[];

  @ApiProperty({ type: [StockValuationDto] })
  data: StockValuationDto[];

  @ApiProperty({ example: 980 })
  total: number;
}

//  大盤統計資訊（指數）
export class MarketIndexDto {
  @ApiProperty({ example: '20260311', description: '日期' })
  date: string;

  @ApiProperty({ example: '發行量加權股價指數', description: '指數名稱' })
  name: string;

  @ApiProperty({ example: '22,450.68', description: '收盤指數' })
  closingIndex: string;

  @ApiProperty({ example: '+', description: '漲跌方向 (+/-)' })
  direction: string;

  @ApiProperty({ example: '125.32', description: '漲跌點數' })
  changePoints: string;

  @ApiProperty({ example: '0.56', description: '漲跌百分比 (%)' })
  changePercent: string;
}

export class MarketIndexResponse {
  @ApiProperty({ type: [MarketIndexDto] })
  data: MarketIndexDto[];

  @ApiProperty({ example: 30 })
  total: number;
}

//  成交量前 20 名
export class TopVolumeDto {
  @ApiProperty({ example: '20260311', description: '日期' })
  date: string;

  @ApiProperty({ example: '1', description: '排名' })
  rank: string;

  @ApiProperty({ example: '2330', description: '證券代號' })
  code: string;

  @ApiProperty({ example: '台積電', description: '證券名稱' })
  name: string;

  @ApiProperty({ example: '52,540,700', description: '成交股數' })
  tradeVolume: string;

  @ApiProperty({ example: '31,200', description: '成交筆數' })
  transaction: string;

  @ApiProperty({ example: '935.00', description: '開盤價' })
  openingPrice: string;

  @ApiProperty({ example: '940.00', description: '最高價' })
  highestPrice: string;

  @ApiProperty({ example: '930.00', description: '最低價' })
  lowestPrice: string;

  @ApiProperty({ example: '938.00', description: '收盤價' })
  closingPrice: string;

  @ApiProperty({ example: '+', description: '漲跌方向' })
  direction: string;

  @ApiProperty({ example: '5.00', description: '漲跌價差' })
  change: string;
}

export class TopVolumeResponse {
  @ApiProperty({ type: [TopVolumeDto] })
  data: TopVolumeDto[];

  @ApiProperty({ example: 20 })
  total: number;
}

// 盤中五秒累計成交資訊
export class IntradayTickDto {
  @ApiProperty({ example: '09:00:05', description: '時間' })
  time: string;

  @ApiProperty({ example: '1,234,567', description: '累計成交股數' })
  accTradeVolume: string;

  @ApiProperty({ example: '98,765,432,100', description: '累計成交金額' })
  accTradeValue: string;

  @ApiProperty({ example: '5,678', description: '累計成交筆數' })
  accTransaction: string;
}

export class IntradayResponse {
  @ApiProperty({ type: [IntradayTickDto] })
  data: IntradayTickDto[];

  @ApiProperty({ example: 100 })
  total: number;
}

// 發行量加權股價指數歷史資料
export class IndexHistoryDto {
  @ApiProperty({ example: '20260310', description: '日期' })
  date: string;

  @ApiProperty({ example: '22,300.50', description: '開盤指數' })
  openingIndex: string;

  @ApiProperty({ example: '22,480.12', description: '最高指數' })
  highestIndex: string;

  @ApiProperty({ example: '22,280.30', description: '最低指數' })
  lowestIndex: string;

  @ApiProperty({ example: '22,450.68', description: '收盤指數' })
  closingIndex: string;
}

export class IndexHistoryResponse {
  @ApiProperty({ type: [IndexHistoryDto] })
  data: IndexHistoryDto[];

  @ApiProperty({ example: 250 })
  total: number;
}

// 排行榜
export class RevenueRankingDto {
  @ApiProperty({ example: '2330', description: '證券代號' })
  code: string;

  @ApiProperty({ example: '台積電', description: '公司名稱' })
  name: string;

  @ApiProperty({ example: '半導體業', description: '產業別' })
  industry: string;

  @ApiProperty({ example: 2894600000, description: '營業收入（千元）' })
  revenue: number;

  @ApiProperty({ example: 1300000000, description: '營業利益（千元）' })
  operatingIncome: number;

  @ApiProperty({ example: 1100000000, description: '稅後淨利（千元）' })
  netIncome: number;

  @ApiProperty({ example: 42.08, description: '基本每股盈餘（元）' })
  eps: number;
}

export class RevenueRankingResponse {
  @ApiProperty({ type: [RevenueRankingDto] })
  data: RevenueRankingDto[];

  @ApiProperty({ example: 500 })
  total: number;

  @ApiProperty({ example: '114' })
  year: string;

  @ApiProperty({ example: '4' })
  quarter: string;
}

export class GrossMarginRankingDto {
  @ApiProperty({ example: '2330', description: '證券代號' })
  code: string;

  @ApiProperty({ example: '台積電', description: '公司名稱' })
  name: string;

  @ApiProperty({ example: '半導體業', description: '產業別' })
  industry: string;

  @ApiProperty({ example: 2894600000, description: '營業收入（千元）' })
  revenue: number;

  @ApiProperty({ example: 1594600000, description: '營業成本（千元）' })
  cost: number;

  @ApiProperty({ example: 1300000000, description: '營業毛利（千元）' })
  grossProfit: number;

  @ApiProperty({ example: 44.89, description: '毛利率 (%)' })
  grossMarginRate: number;
}

export class GrossMarginRankingResponse {
  @ApiProperty({ type: [GrossMarginRankingDto] })
  data: GrossMarginRankingDto[];

  @ApiProperty({ example: 500 })
  total: number;

  @ApiProperty({ example: '114' })
  year: string;

  @ApiProperty({ example: '4' })
  quarter: string;
}

// 上市個股殖利率排行榜
export class DividendYieldRankingDto {
  @ApiProperty({ example: '2330', description: '證券代號' })
  code: string;

  @ApiProperty({ example: '台積電', description: '公司名稱' })
  name: string;

  @ApiProperty({ example: '半導體業', description: '產業別' })
  industry: string;

  @ApiProperty({ example: 3.55, description: '殖利率 (%)' })
  dividendYield: number;

  @ApiProperty({ example: 18.52, description: '本益比' })
  peRatio: number;

  @ApiProperty({ example: 2.35, description: '股價淨值比' })
  pbRatio: number;
}

export class DividendYieldRankingResponse {
  @ApiProperty({ type: [DividendYieldRankingDto] })
  data: DividendYieldRankingDto[];

  @ApiProperty({ example: 500 })
  total: number;
}

// 上市個股本益比排行榜
export class PeRatioRankingDto {
  @ApiProperty({ example: '2330', description: '證券代號' })
  code: string;

  @ApiProperty({ example: '台積電', description: '公司名稱' })
  name: string;

  @ApiProperty({ example: '半導體業', description: '產業別' })
  industry: string;

  @ApiProperty({ example: 18.52, description: '本益比' })
  peRatio: number;

  @ApiProperty({ example: 3.55, description: '殖利率 (%)' })
  dividendYield: number;

  @ApiProperty({ example: 2.35, description: '股價淨值比' })
  pbRatio: number;
}

export class PeRatioRankingResponse {
  @ApiProperty({ type: [PeRatioRankingDto] })
  data: PeRatioRankingDto[];

  @ApiProperty({ example: 500 })
  total: number;
}

// 新聞
export class NewsDto {
  @ApiProperty({ example: '證交所公告ETF上市', description: '新聞標題' })
  title: string;

  @ApiProperty({
    example: 'https://www.twse.com.tw/...',
    description: '新聞連結',
  })
  url: string;

  @ApiProperty({ example: '2026-03-31', description: '發佈日期' })
  date: string;

  @ApiProperty({
    example: '新聞摘要內容...',
    description: '新聞摘要',
    required: false,
  })
  summary?: string;

  @ApiProperty({
    example: 'Yahoo奇摩股市',
    description: '新聞來源',
    required: false,
  })
  source?: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: '新聞縮圖',
    required: false,
  })
  image?: string;
}

export class NewsResponse {
  @ApiProperty({ type: [NewsDto] })
  data: NewsDto[];

  @ApiProperty({ example: 50 })
  total: number;
}

export class AllNewsResponse {
  @ApiProperty({ type: NewsResponse, description: '台股新聞' })
  twStock: NewsResponse;

  @ApiProperty({ type: NewsResponse, description: '美股新聞' })
  usStock: NewsResponse;

  @ApiProperty({ type: NewsResponse, description: '國際財經新聞' })
  international: NewsResponse;

  @ApiProperty({ type: NewsResponse, description: '證交所公告' })
  twse: NewsResponse;
}

// 產業熱力圖
export class HeatmapStockDto {
  @ApiProperty({ example: '2330', description: '證券代號' })
  code: string;

  @ApiProperty({ example: '台積電', description: '證券名稱' })
  name: string;

  @ApiProperty({ example: -2.35, description: '漲跌幅 (%)' })
  changePercent: number;

  @ApiProperty({ example: 950, description: '收盤價' })
  closingPrice: number;

  @ApiProperty({ example: '-10', description: '漲跌價差' })
  change: string;

  @ApiProperty({ example: 50000, description: '成交量（張）' })
  tradeVolume: number;
}

export class HeatmapIndustryDto {
  @ApiProperty({ example: '半導體業', description: '產業別' })
  industry: string;

  @ApiProperty({ example: -1.5, description: '產業平均漲跌幅 (%)' })
  avgChangePercent: number;

  @ApiProperty({ type: [HeatmapStockDto] })
  stocks: HeatmapStockDto[];
}

export class HeatmapResponse {
  @ApiProperty({ type: [HeatmapIndustryDto] })
  data: HeatmapIndustryDto[];

  @ApiProperty({ example: 30 })
  total: number;

  @ApiProperty({ example: '114/03/31' })
  date: string;
}

export class StockDetailDto {
  @ApiProperty({ example: '2330', description: '股票代號' })
  symbol: string;

  @ApiProperty({ example: '台積電', description: '股票名稱' })
  name: string;

  @ApiProperty({ example: 904.84, description: '目前股價' })
  price: number;

  @ApiProperty({ example: -0.16, description: '漲跌金額' })
  change: number;

  @ApiProperty({ example: -0.02, description: '漲跌幅 (%)' })
  changePercent: number;

  @ApiProperty({ example: 896.33, description: '開盤價' })
  open: number;

  @ApiProperty({ example: 927.92, description: '最高價' })
  high: number;

  @ApiProperty({ example: 884.44, description: '最低價' })
  low: number;

  @ApiProperty({ example: 41000000, description: '成交量' })
  volume: number;

  @ApiProperty({ example: 2240000000000, description: '市值' })
  marketCap: number;

  @ApiProperty({ example: 68.3, description: '本益比 P/E' })
  peRatio: number;

  @ApiProperty({ example: 38.2, description: '預估本益比' })
  forwardPE: number;

  @ApiProperty({ example: 11.93, description: 'EPS' })
  eps: number;

  @ApiProperty({ example: 0.03, description: '殖息率 (%)' })
  dividendYield: number;

  @ApiProperty({ example: 35.6, description: '市淨率 P/B' })
  pbRatio: number;

  @ApiProperty({ example: 1248.9, description: '52 週最高' })
  week52High: number;

  @ApiProperty({ example: 588.25, description: '52 週最低' })
  week52Low: number;

  @ApiProperty({ example: 1.72, description: 'Beta' })
  beta: number;

  @ApiProperty({ example: 900.0, description: '昨收價' })
  previousClose: number;

  @ApiProperty({ example: 35000000, description: '近三月日均量' })
  avgVolume: number;

  @ApiProperty({ example: 880.5, description: '50日均線' })
  fiftyDayAvg: number;

  @ApiProperty({ example: 790.2, description: '200日均線' })
  twoHundredDayAvg: number;

  @ApiProperty({ example: 0.32, description: 'ROE (%)' })
  returnOnEquity: number;

  @ApiProperty({ example: 0.15, description: 'ROA (%)' })
  returnOnAssets: number;

  @ApiProperty({ example: 0.55, description: '毛利率 (%)' })
  grossMargins: number;

  @ApiProperty({ example: 0.44, description: '營業利益率 (%)' })
  operatingMargins: number;

  @ApiProperty({ example: 0.38, description: '淨利率 (%)' })
  profitMargins: number;

  @ApiProperty({ example: 0.12, description: '營收成長率 (%)' })
  revenueGrowth: number;

  @ApiProperty({ example: 0.25, description: '季盈餘成長率 (%)' })
  earningsGrowth: number;

  @ApiProperty({ example: 0.35, description: '負債股東權益比' })
  debtToEquity: number;

  @ApiProperty({ example: 2.1, description: '流動比率' })
  currentRatio: number;

  @ApiProperty({ example: 25.93, description: '每股淨值' })
  bookValue: number;

  @ApiProperty({ example: 1200, description: '分析師目標均價' })
  targetMeanPrice: number;

  @ApiProperty({ example: 1500, description: '分析師最高目標價' })
  targetHighPrice: number;

  @ApiProperty({ example: 900, description: '分析師最低目標價' })
  targetLowPrice: number;

  @ApiProperty({ example: 25, description: '分析師人數' })
  numberOfAnalysts: number;

  @ApiProperty({ example: 'buy', description: '分析師建議' })
  recommendationKey: string;

  @ApiProperty({ example: 0.35, description: '配息率 (%)' })
  payoutRatio: number;

  @ApiProperty({ example: '2026-07-15', description: '除息日' })
  exDividendDate: string;

  @ApiProperty({ example: 13.5, description: '年化股利金額' })
  dividendRate: number;

  @ApiProperty({ example: 25930000000, description: '流通在外股數' })
  sharesOutstanding: number;

  @ApiProperty({ example: '半導體業', description: '產業類別' })
  sector: string;

  @ApiProperty({ example: 'Semiconductors', description: '細項產業' })
  industry: string;
}

export class StockDetailResponse {
  @ApiProperty({ type: StockDetailDto })
  data: StockDetailDto;
}

export class StockHistoryPointDto {
  @ApiProperty({ example: '2026-04-25', description: '日期' })
  date: string;

  @ApiProperty({ example: 904.84, description: '收盤價' })
  close: number;

  @ApiProperty({ example: 896.33, description: '開盤價' })
  open: number;

  @ApiProperty({ example: 927.92, description: '最高價' })
  high: number;

  @ApiProperty({ example: 884.44, description: '最低價' })
  low: number;

  @ApiProperty({ example: 41000000, description: '成交量' })
  volume: number;
}

export class StockHistoryResponse {
  @ApiProperty({ example: '2330', description: '股票代號' })
  symbol: string;

  @ApiProperty({ example: '1d', description: '查詢期間' })
  period: string;

  @ApiProperty({ type: [StockHistoryPointDto], description: '歷史價格資料' })
  data: StockHistoryPointDto[];

  @ApiProperty({ example: 250, description: '資料筆數' })
  total: number;
}
