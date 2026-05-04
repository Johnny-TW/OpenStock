"use client";

import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { MarketIndexChart } from "@/components/commons/market-index-chart/market-index-chart";
import { PageHeader } from "@/components/commons/page-header/page-header";
import { TopNews } from "@/components/commons/top-news/top-news";
import { StockDataTable } from "@/components/data-table/stock/data-table";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";

export default function StockClient() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const dailyAll = useAppSelector((state) => state.stock?.dailyAll);
  const allNews = useAppSelector((state) => state.news?.allNews);
  const watchlist = useAppSelector((state) => state.watchlist?.list ?? []);
  const userId = (session?.user as any)?.email ?? "";
  const fetchedRef = useRef(false);
  const watchlistFetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      if (!dailyAll) dispatch({ type: "GET_STOCK_DAILY_ALL" });
      if (!allNews) dispatch({ type: "GET_ALL_NEWS" });
    }
  }, [dispatch, dailyAll, allNews]);

  useEffect(() => {
    if (userId && watchlist.length === 0 && !watchlistFetchedRef.current) {
      watchlistFetchedRef.current = true;
      dispatch({ type: "GET_WATCHLIST" });
    }
  }, [dispatch, userId, watchlist.length]);

  if (!dailyAll) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入資料中...</span>
      </div>
    );
  }

  const stockList = dailyAll?.data ?? [];
  const stockTitle = dailyAll?.title ?? "";

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title={"EE39 - StockSmart System"}
        subtitle={
          <>
            {stockTitle} - 共 {stockList.length} 檔
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TopNews />
        <div className="lg:col-span-2">
          <MarketIndexChart data={stockList} />
        </div>
      </div>
      <StockDataTable data={stockList} title={stockTitle} watchlist={watchlist} userId={userId} />
    </div>
  );
}
