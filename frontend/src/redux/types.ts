import store from "./store"
import type {
  StockDailyAllResponse,
  StockValuationResponse,
  MarketIndexResponse,
  TopVolumeResponse,
  IntradayResponse,
  IndexHistoryResponse,
} from "@/type/stock"

// require.context 動態載入的 reducer 無法自動推斷型別，需手動宣告
export interface RootState {
  api: {
    loading: number
    loadingStack: { path: string; loading: boolean }[]
    error: { message: string; action?: () => void } | null
    success: { message: string; action?: () => void } | null
    deleted: unknown
  }
  stock: {
    dailyAll: StockDailyAllResponse | null
    valuation: StockValuationResponse | null
    marketIndex: MarketIndexResponse | null
    topVolume: TopVolumeResponse | null
    intraday: IntradayResponse | null
    indexHistory: IndexHistoryResponse | null
  }
}

export type AppDispatch = typeof store.dispatch
