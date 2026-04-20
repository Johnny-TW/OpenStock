"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { StockDataTable } from "@/components/data-table/stock/data-table";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { PageHeader } from "@/components/commons/page-header/page-header";
import { TopNews } from "@/components/commons/top-news/top-news";
import { MarketIndexChart } from "@/components/commons/market-index-chart/market-index-chart";

export default function StockClient() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const dailyAll = useAppSelector((state) => state.stock?.dailyAll);
  const watchlist = useAppSelector((state) => state.watchlist?.list ?? []);
  const userId = (session?.user as any)?.email ?? "";

  useEffect(() => {
    dispatch({ type: "GET_STOCK_DAILY_ALL" });
    dispatch({ type: "GET_ALL_NEWS" });
  }, [dispatch]);

  useEffect(() => {
    if (userId) { dispatch({ type: "GET_WATCHLIST" });}
  }, [dispatch, userId]);

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
        subtitle={<>{stockTitle} - 共 {stockList.length} 檔</>}
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
