"use client";

import {
  type ColumnDef,
  flexRender,
  type RowData,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  useRankingDividendYield,
  useRankingGrossMargin,
  useRankingPeRatio,
  useRankingRevenue,
  useStockDailyAll,
  useTopVolume,
} from "@/api/use-stock-query";
import { Badge } from "@/components/commons/badge";
import { Input } from "@/components/commons/input";
import { PageHeader } from "@/components/commons/page-header/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/commons/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/commons/table";
import { Tabs, TabsContent } from "@/components/commons/tabs";
import { Pagination, parseNumber, SortHeader } from "@/components/data-table/shared";
import {
  type StockTableFeatures,
  stockTableFeatures,
} from "@/components/data-table/table-features";
import type {
  DividendYieldRankingDto,
  GrossMarginRankingDto,
  PeRatioRankingDto,
  RevenueRankingDto,
  StockDailyDto,
  TopVolumeDto,
} from "@/type/stock";

function formatCurrency(num: number): string {
  if (Math.abs(num) >= 1e8) {
    return `${(num / 1e8).toFixed(2)} 億`;
  }
  if (Math.abs(num) >= 1e4) {
    return `${(num / 1e4).toFixed(0)} 萬`;
  }
  return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getChangeColor(direction: string) {
  if (direction === "-") return "text-green-500";
  if (direction === "+") return "text-red-500";
  return "";
}

// 漲跌幅排行
interface ChangeRankItem {
  code: string;
  name: string;
  closingPrice: string;
  change: string;
  changePct: number;
  tradeVolume: string;
  tradeValue: string;
  industry: string;
}

const changeRankColumns: ColumnDef<StockTableFeatures, ChangeRankItem>[] = [
  {
    accessorKey: "rank",
    header: "排名",
    cell: ({ row }) => <span>{row.index + 1}</span>,
    size: 60,
    enableSorting: false,
  },
  {
    accessorKey: "code",
    header: "代號",
    cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    size: 80,
    enableSorting: false,
  },
  { accessorKey: "name", header: "名稱", size: 100, enableSorting: false },
  {
    accessorKey: "closingPrice",
    header: "收盤價",
    cell: ({ row }) => <div className="text-right">{row.original.closingPrice}</div>,
    sortFn: (a, b) => parseNumber(a.original.closingPrice) - parseNumber(b.original.closingPrice),
    size: 90,
  },
  {
    accessorKey: "changePct",
    header: "漲跌幅",
    cell: ({ row }) => {
      const pct = row.original.changePct;
      const color = pct > 0 ? "text-red-500" : pct < 0 ? "text-green-500" : "";
      const arrow = pct > 0 ? "▲" : pct < 0 ? "▼" : "";
      return (
        <div className={`text-right font-semibold ${color}`}>
          {arrow} {Math.abs(pct).toFixed(2)}%
        </div>
      );
    },
    sortFn: (a, b) => a.original.changePct - b.original.changePct,
    size: 100,
  },
  {
    accessorKey: "change",
    header: "漲跌",
    cell: ({ row }) => {
      const pct = row.original.changePct;
      const color = pct > 0 ? "text-red-500" : pct < 0 ? "text-green-500" : "";
      return <div className={`text-right ${color}`}>{row.original.change}</div>;
    },
    size: 80,
  },
  {
    accessorKey: "tradeVolume",
    header: "成交量",
    cell: ({ row }) => <div className="text-right">{row.original.tradeVolume}</div>,
    sortFn: (a, b) => parseNumber(a.original.tradeVolume) - parseNumber(b.original.tradeVolume),
    size: 100,
  },
];

const topVolumeColumns: ColumnDef<StockTableFeatures, TopVolumeDto>[] = [
  {
    accessorKey: "rank",
    header: "排名",
    cell: ({ row }) => <span>{row.original.rank}</span>,
    sortFn: (a, b) => parseNumber(a.original.rank) - parseNumber(b.original.rank),
    size: 60,
  },
  {
    accessorKey: "code",
    header: "代號",
    cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    size: 80,
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "名稱",
    size: 100,
    enableSorting: false,
  },
  {
    accessorKey: "tradeVolume",
    header: "成交量",
    cell: ({ row }) => <div className="text-right">{row.original.tradeVolume}</div>,
    sortFn: (a, b) => parseNumber(a.original.tradeVolume) - parseNumber(b.original.tradeVolume),
    size: 120,
  },
  {
    accessorKey: "openingPrice",
    header: "開盤",
    cell: ({ row }) => <div className="text-right">{row.original.openingPrice}</div>,
    sortFn: (a, b) => parseNumber(a.original.openingPrice) - parseNumber(b.original.openingPrice),
    size: 90,
  },
  {
    accessorKey: "highestPrice",
    header: "最高",
    cell: ({ row }) => <div className="text-right">{row.original.highestPrice}</div>,
    sortFn: (a, b) => parseNumber(a.original.highestPrice) - parseNumber(b.original.highestPrice),
    size: 90,
  },
  {
    accessorKey: "lowestPrice",
    header: "最低",
    cell: ({ row }) => <div className="text-right">{row.original.lowestPrice}</div>,
    sortFn: (a, b) => parseNumber(a.original.lowestPrice) - parseNumber(b.original.lowestPrice),
    size: 90,
  },
  {
    accessorKey: "closingPrice",
    header: "收盤",
    cell: ({ row }) => <div className="text-right">{row.original.closingPrice}</div>,
    sortFn: (a, b) => parseNumber(a.original.closingPrice) - parseNumber(b.original.closingPrice),
    size: 90,
  },
  {
    accessorKey: "change",
    header: "漲跌",
    cell: ({ row }) => (
      <div className={`text-right ${getChangeColor(row.original.direction)}`}>
        {row.original.direction}
        {row.original.change}
      </div>
    ),
    sortFn: (a, b) => {
      const aVal = parseNumber(a.original.change) * (a.original.direction === "-" ? -1 : 1);
      const bVal = parseNumber(b.original.change) * (b.original.direction === "-" ? -1 : 1);
      return aVal - bVal;
    },
    size: 90,
  },
];

const revenueColumns: ColumnDef<StockTableFeatures, RevenueRankingDto>[] = [
  {
    accessorKey: "code",
    header: "代號",
    cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    size: 80,
    enableSorting: false,
  },
  { accessorKey: "name", header: "名稱", size: 100, enableSorting: false },
  { accessorKey: "industry", header: "產業別", size: 100, enableSorting: false },
  {
    accessorKey: "revenue",
    header: "營業收入",
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.revenue)}</div>,
    sortFn: (a, b) => a.original.revenue - b.original.revenue,
    size: 120,
  },
  {
    accessorKey: "operatingIncome",
    header: "營業利益",
    cell: ({ row }) => (
      <div className={`text-right ${row.original.operatingIncome < 0 ? "text-green-500" : ""}`}>
        {formatCurrency(row.original.operatingIncome)}
      </div>
    ),
    sortFn: (a, b) => a.original.operatingIncome - b.original.operatingIncome,
    size: 120,
  },
  {
    accessorKey: "netIncome",
    header: "稅後淨利",
    cell: ({ row }) => (
      <div className={`text-right ${row.original.netIncome < 0 ? "text-green-500" : ""}`}>
        {formatCurrency(row.original.netIncome)}
      </div>
    ),
    sortFn: (a, b) => a.original.netIncome - b.original.netIncome,
    size: 120,
  },
  {
    accessorKey: "eps",
    header: "EPS",
    cell: ({ row }) => (
      <div
        className={`text-right font-medium ${row.original.eps < 0 ? "text-green-500" : "text-red-500"}`}
      >
        {row.original.eps.toFixed(2)}
      </div>
    ),
    sortFn: (a, b) => a.original.eps - b.original.eps,
    size: 80,
  },
];

const grossMarginColumns: ColumnDef<StockTableFeatures, GrossMarginRankingDto>[] = [
  {
    accessorKey: "code",
    header: "代號",
    cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    size: 80,
    enableSorting: false,
  },
  { accessorKey: "name", header: "名稱", size: 100, enableSorting: false },
  { accessorKey: "industry", header: "產業別", size: 100, enableSorting: false },
  {
    accessorKey: "grossMarginRate",
    header: "毛利率",
    cell: ({ row }) => (
      <div
        className={`text-right font-bold ${row.original.grossMarginRate >= 50 ? "text-red-500" : row.original.grossMarginRate < 0 ? "text-green-500" : ""}`}
      >
        {row.original.grossMarginRate.toFixed(2)}%
      </div>
    ),
    sortFn: (a, b) => a.original.grossMarginRate - b.original.grossMarginRate,
    size: 100,
  },
  {
    accessorKey: "revenue",
    header: "營業收入",
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.revenue)}</div>,
    sortFn: (a, b) => a.original.revenue - b.original.revenue,
    size: 120,
  },
  {
    accessorKey: "cost",
    header: "營業成本",
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.cost)}</div>,
    sortFn: (a, b) => a.original.cost - b.original.cost,
    size: 120,
  },
  {
    accessorKey: "grossProfit",
    header: "營業毛利",
    cell: ({ row }) => (
      <div className={`text-right ${row.original.grossProfit < 0 ? "text-green-500" : ""}`}>
        {formatCurrency(row.original.grossProfit)}
      </div>
    ),
    sortFn: (a, b) => a.original.grossProfit - b.original.grossProfit,
    size: 120,
  },
];

const dividendYieldColumns: ColumnDef<StockTableFeatures, DividendYieldRankingDto>[] = [
  {
    accessorKey: "code",
    header: "代號",
    cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    size: 80,
    enableSorting: false,
  },
  { accessorKey: "name", header: "名稱", size: 100, enableSorting: false },
  { accessorKey: "industry", header: "產業別", size: 100, enableSorting: false },
  {
    accessorKey: "dividendYield",
    header: "殖利率",
    cell: ({ row }) => (
      <div
        className={`text-right font-bold ${row.original.dividendYield >= 5 ? "text-red-500" : ""}`}
      >
        {row.original.dividendYield.toFixed(2)}%
      </div>
    ),
    sortFn: (a, b) => a.original.dividendYield - b.original.dividendYield,
    size: 100,
  },
  {
    accessorKey: "peRatio",
    header: "本益比",
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.peRatio > 0 ? row.original.peRatio.toFixed(2) : "-"}
      </div>
    ),
    sortFn: (a, b) => a.original.peRatio - b.original.peRatio,
    size: 100,
  },
  {
    accessorKey: "pbRatio",
    header: "股價淨值比",
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.pbRatio > 0 ? row.original.pbRatio.toFixed(2) : "-"}
      </div>
    ),
    sortFn: (a, b) => a.original.pbRatio - b.original.pbRatio,
    size: 110,
  },
];

const peRatioColumns: ColumnDef<StockTableFeatures, PeRatioRankingDto>[] = [
  {
    accessorKey: "code",
    header: "代號",
    cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    size: 80,
    enableSorting: false,
  },
  { accessorKey: "name", header: "名稱", size: 100, enableSorting: false },
  { accessorKey: "industry", header: "產業別", size: 100, enableSorting: false },
  {
    accessorKey: "peRatio",
    header: "本益比",
    cell: ({ row }) => (
      <div
        className={`text-right font-bold ${row.original.peRatio <= 10 ? "text-red-500" : row.original.peRatio >= 50 ? "text-green-500" : ""}`}
      >
        {row.original.peRatio.toFixed(2)}
      </div>
    ),
    sortFn: (a, b) => a.original.peRatio - b.original.peRatio,
    size: 100,
  },
  {
    accessorKey: "dividendYield",
    header: "殖利率",
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.dividendYield > 0 ? `${row.original.dividendYield.toFixed(2)}%` : "-"}
      </div>
    ),
    sortFn: (a, b) => a.original.dividendYield - b.original.dividendYield,
    size: 100,
  },
  {
    accessorKey: "pbRatio",
    header: "股價淨值比",
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.pbRatio > 0 ? row.original.pbRatio.toFixed(2) : "-"}
      </div>
    ),
    sortFn: (a, b) => a.original.pbRatio - b.original.pbRatio,
    size: 110,
  },
];

function RankingTable<T extends RowData>({
  data,
  columns,
  globalFilter,
  defaultSorting,
}: {
  data: T[];
  columns: ColumnDef<StockTableFeatures, T>[];
  globalFilter: string;
  defaultSorting: SortingState;
}) {
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);

  const table = useTable({
    features: stockTableFeatures,
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Badge variant="outline">共 {table.getFilteredRowModel().rows.length} 筆</Badge>
      </div>
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <SortHeader
                        column={header.column as any}
                        label={String(header.column.columnDef.header)}
                        className="justify-end"
                      />
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  沒有符合的資料
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination table={table} />
    </div>
  );
}

export default function RankingClient() {
  const { data: dailyAll } = useStockDailyAll();
  const { data: topVolume } = useTopVolume();
  const { data: rankingRevenue } = useRankingRevenue();
  const { data: rankingGrossMargin } = useRankingGrossMargin();
  const { data: rankingDividendYield } = useRankingDividendYield();
  const { data: rankingPeRatio } = useRankingPeRatio();
  const [activeTab, setActiveTab] = useState("change");
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setSearch("");
    setSelectedIndustry("all");
  }, []);

  const filterByIndustry = useCallback(
    <T extends { industry: string }>(list: T[]) => {
      if (selectedIndustry === "all") return list;
      return list.filter((r) => r.industry === selectedIndustry);
    },
    [selectedIndustry],
  );

  // 漲跌幅排行
  const changeRankData = useMemo(() => {
    const stocks: StockDailyDto[] = dailyAll?.data ?? [];
    if (!stocks.length) return { up: [] as ChangeRankItem[], down: [] as ChangeRankItem[] };
    const mapped = stocks
      .map((s) => {
        const close = parseNumber(s.closingPrice);
        const change = parseNumber(s.change);
        const prev = close - change;
        const pct = prev > 0 ? (change / prev) * 100 : 0;
        return {
          code: s.code,
          name: s.name,
          closingPrice: s.closingPrice,
          change: s.change,
          changePct: pct,
          tradeVolume: s.tradeVolume,
          tradeValue: s.tradeValue,
          industry: s.industry || "",
        };
      })
      .filter((r) => parseNumber(r.closingPrice) > 0);
    const up = [...mapped].filter((r) => r.changePct > 0).sort((a, b) => b.changePct - a.changePct);
    const down = [...mapped]
      .filter((r) => r.changePct < 0)
      .sort((a, b) => a.changePct - b.changePct);
    return { up, down };
  }, [dailyAll?.data]);

  const topVolumeRaw = topVolume?.data;
  const topVolumeData: TopVolumeDto[] = Array.isArray(topVolumeRaw) ? topVolumeRaw : [];
  const revenueData = useMemo(
    () => filterByIndustry(Array.isArray(rankingRevenue?.data) ? rankingRevenue.data : []),
    [rankingRevenue, filterByIndustry],
  );
  const grossMarginData = useMemo(
    () => filterByIndustry(Array.isArray(rankingGrossMargin?.data) ? rankingGrossMargin.data : []),
    [rankingGrossMargin, filterByIndustry],
  );
  const dividendYieldData = useMemo(
    () =>
      filterByIndustry(Array.isArray(rankingDividendYield?.data) ? rankingDividendYield.data : []),
    [rankingDividendYield, filterByIndustry],
  );
  const peRatioData = useMemo(
    () => filterByIndustry(Array.isArray(rankingPeRatio?.data) ? rankingPeRatio.data : []),
    [rankingPeRatio, filterByIndustry],
  );

  const industries = useMemo(() => {
    let list: { industry: string }[] = [];
    switch (activeTab) {
      case "revenue":
        list = Array.isArray(rankingRevenue?.data) ? rankingRevenue.data : [];
        break;
      case "gross-margin":
        list = Array.isArray(rankingGrossMargin?.data) ? rankingGrossMargin.data : [];
        break;
      case "dividend-yield":
        list = Array.isArray(rankingDividendYield?.data) ? rankingDividendYield.data : [];
        break;
      case "pe-ratio":
        list = Array.isArray(rankingPeRatio?.data) ? rankingPeRatio.data : [];
        break;
    }
    const set = new Set(list.map((r) => r.industry).filter(Boolean));
    return Array.from(set).sort();
  }, [activeTab, rankingRevenue, rankingGrossMargin, rankingDividendYield, rankingPeRatio]);

  const getPeriod = () => {
    switch (activeTab) {
      case "change":
        return "當日漲跌幅排行";
      case "top-volume":
        return "即時成交量排行";
      case "revenue": {
        const y = rankingRevenue?.year;
        const q = rankingRevenue?.quarter;
        return y ? `${y} 年第 ${q} 季` : "";
      }
      case "gross-margin": {
        const y = rankingGrossMargin?.year;
        const q = rankingGrossMargin?.quarter;
        return y ? `${y} 年第 ${q} 季` : "";
      }
      default:
        return "即時資料";
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case "change":
        return !dailyAll;
      case "top-volume":
        return !topVolume;
      case "revenue":
        return !rankingRevenue;
      case "gross-margin":
        return !rankingGrossMargin;
      case "dividend-yield":
        return !rankingDividendYield;
      case "pe-ratio":
        return !rankingPeRatio;
      default:
        return false;
    }
  };

  const isBottomLoading =
    !rankingPeRatio ||
    !rankingDividendYield ||
    !rankingGrossMargin ||
    !rankingRevenue ||
    !topVolume;

  const showIndustryFilter = !["top-volume", "change"].includes(activeTab);

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="排行榜"
        subtitle={getPeriod() || undefined}
        controls={
          <div className="flex items-center gap-2">
            {showIndustryFilter && (
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="全部產業" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部產業</SelectItem>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input
              placeholder="搜尋代號、名稱..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {isLoading() ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">載入資料中...</span>
          </div>
        ) : (
          <>
            <TabsContent value="change">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <RankingTable
                    data={changeRankData.up}
                    columns={changeRankColumns}
                    globalFilter={search}
                    defaultSorting={[{ id: "changePct", desc: true }]}
                  />
                </div>
                <div>
                  <RankingTable
                    data={changeRankData.down}
                    columns={changeRankColumns}
                    globalFilter={search}
                    defaultSorting={[{ id: "changePct", desc: false }]}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="top-volume">
              <RankingTable
                data={topVolumeData}
                columns={topVolumeColumns}
                globalFilter={search}
                defaultSorting={[{ id: "tradeVolume", desc: true }]}
              />
            </TabsContent>
            <TabsContent value="revenue">
              <RankingTable
                data={revenueData}
                columns={revenueColumns}
                globalFilter={search}
                defaultSorting={[{ id: "revenue", desc: true }]}
              />
            </TabsContent>
            <TabsContent value="gross-margin">
              <RankingTable
                data={grossMarginData}
                columns={grossMarginColumns}
                globalFilter={search}
                defaultSorting={[{ id: "grossMarginRate", desc: true }]}
              />
            </TabsContent>
            <TabsContent value="dividend-yield">
              <RankingTable
                data={dividendYieldData}
                columns={dividendYieldColumns}
                globalFilter={search}
                defaultSorting={[{ id: "dividendYield", desc: true }]}
              />
            </TabsContent>
            <TabsContent value="pe-ratio">
              <RankingTable
                data={peRatioData}
                columns={peRatioColumns}
                globalFilter={search}
                defaultSorting={[{ id: "peRatio", desc: false }]}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {isBottomLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">載入資料中...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <PageHeader title="殖利率排行" subtitle="依殖利率由高至低" />
              <RankingTable
                data={dividendYieldData}
                columns={dividendYieldColumns}
                globalFilter={search}
                defaultSorting={[{ id: "dividendYield", desc: true }]}
              />
            </div>
            <div className="space-y-2">
              <PageHeader title="本益比排行" subtitle="依本益比由低至高" />
              <RankingTable
                data={peRatioData}
                columns={peRatioColumns}
                globalFilter={search}
                defaultSorting={[{ id: "peRatio", desc: false }]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <PageHeader
                title="毛利率排行"
                subtitle={
                  rankingGrossMargin?.year
                    ? `${rankingGrossMargin.year} 年第 ${rankingGrossMargin.quarter} 季`
                    : ""
                }
              />
              <RankingTable
                data={grossMarginData}
                columns={grossMarginColumns}
                globalFilter={search}
                defaultSorting={[{ id: "grossMarginRate", desc: true }]}
              />
            </div>
            <div className="space-y-2">
              <PageHeader
                title="營收排行"
                subtitle={
                  rankingRevenue?.year
                    ? `${rankingRevenue.year} 年第 ${rankingRevenue.quarter} 季`
                    : ""
                }
              />
              <RankingTable
                data={revenueData}
                columns={revenueColumns}
                globalFilter={search}
                defaultSorting={[{ id: "revenue", desc: true }]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <PageHeader title="成交排行" subtitle="即時成交量排行" />
            <RankingTable
              data={topVolumeData}
              columns={topVolumeColumns}
              globalFilter={search}
              defaultSorting={[{ id: "tradeVolume", desc: true }]}
            />
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground/60 pt-2">
        資料來源：
        <a
          href="https://openapi.twse.com.tw"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          臺灣證券交易所 OpenAPI
        </a>
        ，僅供投資研究參考，不構成任何投資建議。
      </p>
    </div>
  );
}
