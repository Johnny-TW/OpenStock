import type { StockDailyQuery } from "@/types/stock";

export type RankingType = "revenue" | "gross-margin" | "dividend-yield" | "pe-ratio";

export const stockKeys = {
  all: ["stock"] as const,
  valuation: () => [...stockKeys.all, "valuation"] as const,
  dailyAll: () => [...stockKeys.all, "daily-all"] as const,
  dailyPaged: (query: StockDailyQuery) => [...stockKeys.dailyAll(), "paged", query] as const,
  topMovers: () => [...stockKeys.dailyAll(), "top-movers"] as const,
  dailyByCodes: (codes: string[]) => [...stockKeys.dailyAll(), "by-codes", codes] as const,
  news: () => [...stockKeys.all, "news", "all"] as const,
  heatmap: (period: string) => [...stockKeys.all, "heatmap", period] as const,
  marketIndex: () => [...stockKeys.all, "market-index"] as const,
  intraday: () => [...stockKeys.all, "intraday"] as const,
  indexHistory: () => [...stockKeys.all, "index-history"] as const,
  topVolume: () => [...stockKeys.all, "top-volume"] as const,
  ranking: (type: RankingType) => [...stockKeys.all, "ranking", type] as const,
  detail: (symbol: string) => [...stockKeys.all, "detail", symbol] as const,
  history: (symbol: string, period: string) =>
    [...stockKeys.all, "history", symbol, period] as const,
};

export const watchlistKeys = {
  all: ["watchlist"] as const,
  list: () => [...watchlistKeys.all] as const,
};

export const analysisKeys = {
  all: ["analysis"] as const,
  market: () => [...analysisKeys.all, "market"] as const,
};
