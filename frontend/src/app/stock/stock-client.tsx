"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { StockDataTable } from "@/components/data-table/stock/data-table";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { PageHeader } from "@/components/commons/page-header";

export default function StockClient() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const dailyAll = useAppSelector((state) => state.stock?.dailyAll);
  const watchlist = useAppSelector((state) => state.watchlist?.list ?? []);
  const userId = (session?.user as any)?.email ?? "";

  useEffect(() => {
    dispatch({ type: "GET_STOCK_DAILY_ALL" });
  }, [dispatch]);

  useEffect(() => {
    if (userId) {
      dispatch({ type: "GET_WATCHLIST" });
    }
  }, [dispatch, userId]);

  if (!dailyAll) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入股票資料中...</span>
      </div>
    );
  }

  const stockList = dailyAll?.data ?? [];
  const stockTitle = dailyAll?.title ?? "";

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title={stockTitle || "當日日成交資訊"}
        subtitle={<>共 {stockList.length} 檔</>}
      />
      <StockDataTable data={stockList} title={stockTitle} watchlist={watchlist} userId={userId} />
    </div>
  );
}
