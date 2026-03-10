"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { StockDataTable } from "@/components/data-table/stock/data-table";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";

export default function StockClient() {
  const dispatch = useAppDispatch();
  const dailyAll = useAppSelector((state) => state.stock?.dailyAll);
  const loading = useAppSelector((state) => state.api?.loading);

  useEffect(() => {
    dispatch({ type: "GET_STOCK_DAILY_ALL" });
  }, [dispatch]);

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
      <div>
        <h1 className="text-2xl font-bold">
          {stockTitle || "當日日成交資訊"}
        </h1>
        <p className="text-sm text-muted-foreground">
          共 {stockList.length} 檔
        </p>
      </div>
      <StockDataTable data={stockList} title={stockTitle} />
    </div>
  );
}
