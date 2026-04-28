import type {
  AllNewsResponse,
  DividendYieldRankingResponse,
  GrossMarginRankingResponse,
  HeatmapResponse,
  IndexHistoryResponse,
  IntradayResponse,
  MarketIndexResponse,
  PeRatioRankingResponse,
  RevenueRankingResponse,
  StockDailyAllResponse,
  StockDetailResponse,
  StockHistoryResponse,
  StockValuationResponse,
  TopVolumeResponse,
  WatchlistItem,
} from "@/type/stock";
import store from "./store";

export interface RootState {
  api: {
    loading: number;
    loadingStack: { path: string; loading: boolean }[];
    error: { message: string; action?: () => void } | null;
    success: { message: string; action?: () => void } | null;
    deleted: { message?: string; action?: () => void } | null;
  };
  auth: {
    session: { accessToken?: string; user?: Record<string, unknown> } | null;
    token: string | null;
    user: Record<string, unknown> | null;
  };
  stock: {
    dailyAll: StockDailyAllResponse | null;
    valuation: StockValuationResponse | null;
    marketIndex: MarketIndexResponse | null;
    topVolume: TopVolumeResponse | null;
    intraday: IntradayResponse | null;
    indexHistory: IndexHistoryResponse | null;
    stockDetail: StockDetailResponse | null;
    stockDetailLoaded: boolean;
    stockHistory: StockHistoryResponse | null;
  };
  ranking: {
    revenue: RevenueRankingResponse | null;
    grossMargin: GrossMarginRankingResponse | null;
    dividendYield: DividendYieldRankingResponse | null;
    peRatio: PeRatioRankingResponse | null;
  };
  heatmap: {
    data: HeatmapResponse | null;
  };
  watchlist: {
    list: WatchlistItem[];
  };
  news: {
    data: unknown;
    allNews: AllNewsResponse | null;
  };
  analysis: {
    result: unknown;
  };
}

export type AppDispatch = typeof store.dispatch;
