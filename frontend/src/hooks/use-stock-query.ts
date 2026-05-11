import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api-client";
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
} from "@/type/stock";

export function useStockValuation() {
  return useQuery({
    queryKey: ["stock", "valuation"],
    queryFn: () => fetchAPI<StockValuationResponse>("stock/valuation"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStockDailyAll() {
  return useQuery({
    queryKey: ["stock", "daily-all"],
    queryFn: () => fetchAPI<StockDailyAllResponse>("stock/daily-all"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllNews() {
  return useQuery({
    queryKey: ["stock", "news", "all"],
    queryFn: () => fetchAPI<AllNewsResponse>("stock/news/all"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHeatmap(period: string) {
  return useQuery({
    queryKey: ["stock", "heatmap", period],
    queryFn: () => fetchAPI<HeatmapResponse>("stock/heatmap", { period }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketIndex() {
  return useQuery({
    queryKey: ["stock", "market-index"],
    queryFn: () => fetchAPI<MarketIndexResponse>("stock/market-index"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useIntraday() {
  return useQuery({
    queryKey: ["stock", "intraday"],
    queryFn: () => fetchAPI<IntradayResponse>("stock/intraday"),
    staleTime: 60 * 1000,
  });
}

export function useIndexHistory() {
  return useQuery({
    queryKey: ["stock", "index-history"],
    queryFn: () => fetchAPI<IndexHistoryResponse>("stock/index-history"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopVolume() {
  return useQuery({
    queryKey: ["stock", "top-volume"],
    queryFn: () => fetchAPI<TopVolumeResponse>("stock/top-volume"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRankingRevenue() {
  return useQuery({
    queryKey: ["stock", "ranking", "revenue"],
    queryFn: () => fetchAPI<RevenueRankingResponse>("stock/ranking/revenue"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRankingGrossMargin() {
  return useQuery({
    queryKey: ["stock", "ranking", "gross-margin"],
    queryFn: () => fetchAPI<GrossMarginRankingResponse>("stock/ranking/gross-margin"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRankingDividendYield() {
  return useQuery({
    queryKey: ["stock", "ranking", "dividend-yield"],
    queryFn: () => fetchAPI<DividendYieldRankingResponse>("stock/ranking/dividend-yield"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRankingPeRatio() {
  return useQuery({
    queryKey: ["stock", "ranking", "pe-ratio"],
    queryFn: () => fetchAPI<PeRatioRankingResponse>("stock/ranking/pe-ratio"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStockDetail(symbol: string) {
  return useQuery({
    queryKey: ["stock", "detail", symbol],
    queryFn: () => fetchAPI<StockDetailResponse>("stock/detail", { symbol }),
    enabled: !!symbol,
  });
}

export function useStockHistory(symbol: string, period: string) {
  return useQuery({
    queryKey: ["stock", "history", symbol, period],
    queryFn: () => fetchAPI<StockHistoryResponse>("stock/history", { symbol, period }),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
  });
}
