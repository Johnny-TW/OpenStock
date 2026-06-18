"use client";

import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { MarketIndexChart } from "@/components/commons/market-index-chart/market-index-chart";
import { PageHeader } from "@/components/commons/page-header/page-header";
import { TopNews } from "@/components/commons/top-news/top-news";
import { StockDataTable } from "@/components/data-table/stock/data-table";
import { useStockDailyByCodes, useStockDailyPaged, useTopMovers } from "@/hooks/use-stock-query";
import { useWatchlist } from "@/hooks/use-watchlist-query";
import type { StockDailySortField } from "@/type/stock";

export default function StockClient() {
  const { data: session } = useSession();
  const userId = (session?.user as { email?: string })?.email ?? "";

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [sortBy, setSortBy] = useState<StockDailySortField | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // 搜尋輸入做 debounce，避免每打一個字就打一次 API
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: paged,
    isLoading,
    isFetching,
  } = useStockDailyPaged({
    page,
    pageSize,
    search,
    industry,
    sortBy: sortBy ?? undefined,
    sortDir,
  });

  const { data: topMovers } = useTopMovers();

  const { data: watchlist = [] } = useWatchlist(!!session?.user);
  const watchedCodes = useMemo(() => watchlist.map((w) => w.stockNo), [watchlist]);
  const { data: watchlistStocks = [] } = useStockDailyByCodes(watchedCodes);

  const chartData = useMemo(
    () => [...(topMovers?.gainers ?? []), ...(topMovers?.losers ?? [])],
    [topMovers],
  );

  function handleIndustryChange(value: string) {
    setIndustry(value);
    setPage(1);
  }

  function handleSortChange(key: StockDailySortField) {
    if (sortBy === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
  }

  if (isLoading || !paged) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入資料中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title={"EE39 - StockSmart System"}
        subtitle={
          <>
            {paged.title} - 共 {paged.total} 檔
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TopNews />
        <div className="lg:col-span-2">
          <MarketIndexChart data={chartData} />
        </div>
      </div>
      <StockDataTable
        data={paged.data}
        total={paged.total}
        page={paged.page}
        pageSize={paged.pageSize}
        totalPages={paged.totalPages}
        industries={paged.industries}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        industry={industry}
        onIndustryChange={handleIndustryChange}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        isFetching={isFetching}
        watchlist={watchlist}
        watchlistStocks={watchlistStocks}
        userId={userId}
      />
    </div>
  );
}
