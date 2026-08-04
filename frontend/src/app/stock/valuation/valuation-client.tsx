"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useStockValuation } from "@/api/use-stock-query";
import { Badge } from "@/components/commons/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/commons/card";
import { PageHeader } from "@/components/commons/page-header/page-header";
import { StockValuationTable } from "@/components/data-table/stock/valuation-table";

function parseNum(val: string): number {
  return parseFloat(val?.replace(/,/g, "") || "0") || 0;
}

const QUICK_FILTERS = [
  { label: "殖利率 ≥ 5%", key: "highYield" },
  { label: "本益比 ≤ 15", key: "lowPE" },
  { label: "淨值比 < 1", key: "lowPB" },
  { label: "全部", key: "all" },
] as const;

type QuickFilterKey = (typeof QUICK_FILTERS)[number]["key"];

export default function ValuationClient() {
  const { data: valuation, isLoading } = useStockValuation();
  const [activeFilter, setActiveFilter] = useState<QuickFilterKey>("all");

  const list = valuation?.data ?? [];
  const title = valuation?.title ?? "";
  const date = valuation?.date ?? "";

  const stats = useMemo(() => {
    if (!list.length) return null;
    const highYield = list.filter((s) => parseNum(s.dividendYield) >= 5).length;
    const lowPE = list.filter((s) => {
      const pe = parseNum(s.peRatio);
      return pe > 0 && pe <= 15;
    }).length;
    const lowPB = list.filter((s) => {
      const pb = parseNum(s.pbRatio);
      return pb > 0 && pb < 1;
    }).length;
    const withPE = list.filter(
      (s) => s.peRatio && s.peRatio !== "-" && parseNum(s.peRatio) > 0,
    ).length;

    const peValues = list.map((s) => parseNum(s.peRatio)).filter((v) => v > 0);
    const yieldValues = list.map((s) => parseNum(s.dividendYield)).filter((v) => v > 0);
    const avgPE = peValues.length ? peValues.reduce((a, b) => a + b, 0) / peValues.length : 0;
    const avgYield = yieldValues.length
      ? yieldValues.reduce((a, b) => a + b, 0) / yieldValues.length
      : 0;

    return { highYield, lowPE, lowPB, withPE, avgPE, avgYield };
  }, [list]);

  const filteredList = useMemo(() => {
    switch (activeFilter) {
      case "highYield":
        return list.filter((s) => parseNum(s.dividendYield) >= 5);
      case "lowPE":
        return list.filter((s) => {
          const pe = parseNum(s.peRatio);
          return pe > 0 && pe <= 15;
        });
      case "lowPB":
        return list.filter((s) => {
          const pb = parseNum(s.pbRatio);
          return pb > 0 && pb < 1;
        });
      default:
        return list;
    }
  }, [list, activeFilter]);

  if (isLoading || !valuation) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入資料中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title="本益比 / 殖利率 / 淨值比"
        subtitle={
          <>
            {title} {date && `· 資料日期：${date}`}
          </>
        }
      />

      {/* 統計卡片 */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>總檔數</CardDescription>
              <CardTitle className="text-2xl">{list.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">上市個股</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>殖利率 ≥ 5%</CardDescription>
              <CardTitle className="text-2xl text-red-500">{stats.highYield}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">高殖利率標的</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>本益比 ≤ 15</CardDescription>
              <CardTitle className="text-2xl text-blue-500">{stats.lowPE}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">低本益比標的</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>淨值比 &lt; 1</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{stats.lowPB}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">可能被低估</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>市場平均本益比</CardDescription>
              <CardTitle className="text-2xl">{stats.avgPE.toFixed(1)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">含 {stats.withPE} 檔</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>市場平均殖利率</CardDescription>
              <CardTitle className="text-2xl">{stats.avgYield.toFixed(2)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">上市個股平均</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 快速篩選 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">快速篩選：</span>
        {QUICK_FILTERS.map((f) => (
          <Badge
            key={f.key}
            variant={activeFilter === f.key ? "default" : "outline"}
            className="cursor-pointer select-none transition-colors"
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </Badge>
        ))}
        {activeFilter !== "all" && (
          <span className="text-sm text-muted-foreground ml-2">
            篩選後 {filteredList.length} 筆
          </span>
        )}
      </div>

      {/* 資料表 */}
      <StockValuationTable data={filteredList} title={title} />
    </div>
  );
}
