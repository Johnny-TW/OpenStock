import store from "./store"

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
    dailyAll: {
      date: string
      title: string
      notes: string[]
      fields: string[]
      data: {
        code: string
        name: string
        tradeVolume: string
        tradeValue: string
        openingPrice: string
        highestPrice: string
        lowestPrice: string
        closingPrice: string
        change: string
        transaction: string
      }[]
      total: number
    } | null
    valuation: {
      date: string
      title: string
      notes: string[]
      fields: string[]
      data: {
        code: string
        name: string
        dividendYield: string
        dividendYear: string
        peRatio: string
        pbRatio: string
        financialYear: string
      }[]
      total: number
    } | null
  }
}

export type AppDispatch = typeof store.dispatch
