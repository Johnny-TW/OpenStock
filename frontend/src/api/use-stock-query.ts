import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { stockKeys } from "@/api/query-keys";
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
  StockDailyDto,
  StockDailyPagedResponse,
  StockDailyQuery,
  StockDetailResponse,
  StockHistoryResponse,
  StockValuationResponse,
  TopMoversResponse,
  TopVolumeResponse,
} from "@/types/stock";

export function useStockValuation() {
  return useQuery({
    queryKey: stockKeys.valuation(),
    queryFn: () => fetchAPI<StockValuationResponse>("stock/valuation"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStockDailyAll() {
  return useQuery({
    queryKey: stockKeys.dailyAll(),
    queryFn: () => fetchAPI<StockDailyAllResponse>("stock/daily-all"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStockDailyPaged(query: StockDailyQuery) {
  const { page, pageSize, search, industry, sortBy, sortDir } = query;
  return useQuery({
    queryKey: stockKeys.dailyPaged(query),
    queryFn: () =>
      fetchAPI<StockDailyPagedResponse>("stock/daily-all/paged", {
        page,
        pageSize,
        search: search || undefined,
        industry: industry && industry !== "all" ? industry : undefined,
        sortBy: sortBy || undefined,
        sortDir: sortBy ? sortDir : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopMovers() {
  return useQuery({
    queryKey: stockKeys.topMovers(),
    queryFn: () => fetchAPI<TopMoversResponse>("stock/daily-all/top-movers"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStockDailyByCodes(codes: string[]) {
  return useQuery({
    queryKey: stockKeys.dailyByCodes(codes),
    queryFn: () =>
      fetchAPI<StockDailyDto[]>("stock/daily-all/by-codes", { codes: codes.join(",") }),
    enabled: codes.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllNews() {
  return useQuery({
    queryKey: stockKeys.news(),
    queryFn: () => fetchAPI<AllNewsResponse>("stock/news/all"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHeatmap(period: string) {
  return useQuery({
    queryKey: stockKeys.heatmap(period),
    queryFn: () => fetchAPI<HeatmapResponse>("stock/heatmap", { period }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketIndex() {
  return useQuery({
    queryKey: stockKeys.marketIndex(),
    queryFn: () => fetchAPI<MarketIndexResponse>("stock/market-index"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useIntraday() {
  return useQuery({
    queryKey: stockKeys.intraday(),
    queryFn: () => fetchAPI<IntradayResponse>("stock/intraday"),
    staleTime: 60 * 1000,
  });
}

export function useIndexHistory() {
  return useQuery({
    queryKey: stockKeys.indexHistory(),
    queryFn: () => fetchAPI<IndexHistoryResponse>("stock/index-history"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopVolume() {
  return useQuery({
    queryKey: stockKeys.topVolume(),
    queryFn: () => fetchAPI<TopVolumeResponse>("stock/top-volume"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRankingRevenue() {
  return useQuery({
    queryKey: stockKeys.ranking("revenue"),
    queryFn: () => fetchAPI<RevenueRankingResponse>("stock/ranking/revenue"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRankingGrossMargin() {
  return useQuery({
    queryKey: stockKeys.ranking("gross-margin"),
    queryFn: () => fetchAPI<GrossMarginRankingResponse>("stock/ranking/gross-margin"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRankingDividendYield() {
  return useQuery({
    queryKey: stockKeys.ranking("dividend-yield"),
    queryFn: () => fetchAPI<DividendYieldRankingResponse>("stock/ranking/dividend-yield"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRankingPeRatio() {
  return useQuery({
    queryKey: stockKeys.ranking("pe-ratio"),
    queryFn: () => fetchAPI<PeRatioRankingResponse>("stock/ranking/pe-ratio"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStockDetail(symbol: string) {
  return useQuery({
    queryKey: stockKeys.detail(symbol),
    queryFn: () => fetchAPI<StockDetailResponse>("stock/detail", { symbol }),
    enabled: !!symbol,
  });
}

export function useStockHistory(symbol: string, period: string) {
  return useQuery({
    queryKey: stockKeys.history(symbol, period),
    queryFn: () => fetchAPI<StockHistoryResponse>("stock/history", { symbol, period }),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
  });
}
