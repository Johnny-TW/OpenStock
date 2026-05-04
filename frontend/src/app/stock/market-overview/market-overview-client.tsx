"use client";

import { IconActivity, IconClock, IconCurrencyDollar } from "@tabler/icons-react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Label,
  Line,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/commons/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/commons/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/commons/chart";
import { Input } from "@/components/commons/input";
import { PageHeader } from "@/components/commons/page-header/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/commons/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/commons/tabs";
import { Pagination, parseNumber, SortHeader } from "@/components/data-table/shared";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import type { IndexHistoryDto, IntradayTickDto, MarketIndexDto } from "@/type/stock";

// 圖表配置：定義不同圖表類型的顏色和標籤
const intradayChartConfig = {
  volume: { label: "累計成交量", color: "hsl(217, 91%, 60%)" },
  value: { label: "累計成交值", color: "hsl(199, 89%, 48%)" },
  transaction: { label: "累計成交筆數", color: "hsl(210, 40%, 58%)" },
} satisfies ChartConfig;

const historyChartConfig = {
  closingIndex: { label: "收盤指數", color: "hsl(217, 91%, 60%)" },
  highLow: { label: "高低區間", color: "hsl(199, 89%, 48%)" },
  openingIndex: { label: "開盤指數", color: "hsl(210, 40%, 58%)" },
} satisfies ChartConfig;

// 解析漲跌顏色：根據漲跌值返回對應的文字顏色類名
function getChangeColor(val: string) {
  if (!val) return "";
  if (val.startsWith("-")) return "text-green-500";
  if (val === "0.00" || val === "0") return "";
  return "text-red-500";
}

const marketIndexColumns: ColumnDef<MarketIndexDto>[] = [
  {
    accessorKey: "name",
    header: "指數名稱",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    enableSorting: false,
    size: 200,
  },
  {
    accessorKey: "closingIndex",
    header: "收盤指數",
    cell: ({ row }) => <div className="text-right">{row.original.closingIndex}</div>,
    sortingFn: (a, b) =>
      parseNumber(a.original.closingIndex) - parseNumber(b.original.closingIndex),
    size: 120,
  },
  {
    accessorKey: "changePoints",
    header: "漲跌點數",
    cell: ({ row }) => (
      <div className={`text-right ${getChangeColor(row.original.changePoints)}`}>
        {row.original.direction} {row.original.changePoints}
      </div>
    ),
    sortingFn: (a, b) =>
      parseNumber(a.original.changePoints) - parseNumber(b.original.changePoints),
    size: 120,
  },
  {
    accessorKey: "changePercent",
    header: "漲跌百分比",
    cell: ({ row }) => (
      <div className={`text-right ${getChangeColor(row.original.changePercent)}`}>
        {row.original.changePercent}%
      </div>
    ),
    sortingFn: (a, b) =>
      parseNumber(a.original.changePercent) - parseNumber(b.original.changePercent),
    size: 120,
  },
];

// 歷史指數表格欄位定義，包含日期、開盤、最高、最低、收盤等欄位，並定義排序函數
const historyColumns: ColumnDef<IndexHistoryDto>[] = [
  {
    accessorKey: "date",
    header: "日期",
    cell: ({ row }) => <span className="font-medium">{row.original.date}</span>,
    size: 120,
  },
  {
    accessorKey: "openingIndex",
    header: "開盤指數",
    cell: ({ row }) => <div className="text-right">{row.original.openingIndex}</div>,
    sortingFn: (a, b) =>
      parseNumber(a.original.openingIndex) - parseNumber(b.original.openingIndex),
    size: 120,
  },
  {
    accessorKey: "highestIndex",
    header: "最高指數",
    cell: ({ row }) => <div className="text-right text-red-500">{row.original.highestIndex}</div>,
    sortingFn: (a, b) =>
      parseNumber(a.original.highestIndex) - parseNumber(b.original.highestIndex),
    size: 120,
  },
  {
    accessorKey: "lowestIndex",
    header: "最低指數",
    cell: ({ row }) => <div className="text-right text-green-500">{row.original.lowestIndex}</div>,
    sortingFn: (a, b) => parseNumber(a.original.lowestIndex) - parseNumber(b.original.lowestIndex),
    size: 120,
  },
  {
    accessorKey: "closingIndex",
    header: "收盤指數",
    cell: ({ row }) => <div className="text-right font-semibold">{row.original.closingIndex}</div>,
    sortingFn: (a, b) =>
      parseNumber(a.original.closingIndex) - parseNumber(b.original.closingIndex),
    size: 120,
  },
];

// 格式化大量數字，將數字轉換為更易讀的格式，例如將 1000000 轉換為 "100 萬"
function formatLargeNumber(val: string) {
  const n = parseNumber(val);
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)} 兆`;
  if (n >= 1e8) return `${(n / 1e8).toFixed(2)} 億`;
  if (n >= 1e4) return `${(n / 1e4).toFixed(0)} 萬`;
  return val;
}

// 解析並格式化數字，適用於指數相關數據
function IntradayChartSection({ list }: { list: IntradayTickDto[] }) {
  const [chartTab, setChartTab] = useState("volume");

  const chartData = useMemo(() => {
    const sampled =
      list.length > 120
        ? list.filter((_, i) => i % Math.ceil(list.length / 120) === 0 || i === list.length - 1)
        : list;
    return sampled.map((item) => ({
      time: item.time,
      volume: parseNumber(item.accTradeVolume),
      value: parseNumber(item.accTradeValue),
      transaction: parseNumber(item.accTransaction),
    }));
  }, [list]);

  return (
    <div className="space-y-4">
      <Tabs value={chartTab} onValueChange={setChartTab}>
        <TabsList>
          <TabsTrigger value="volume">成交量</TabsTrigger>
          <TabsTrigger value="value">成交值</TabsTrigger>
          <TabsTrigger value="transaction">成交筆數</TabsTrigger>
        </TabsList>
        <TabsContent value={chartTab} className="mt-4">
          <ChartContainer config={intradayChartConfig} className="h-80 w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`fill-${chartTab}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${chartTab})`} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={`var(--color-${chartTab})`} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => v?.slice(0, 5)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => {
                  if (v >= 1e12) return `${(v / 1e12).toFixed(1)}兆`;
                  if (v >= 1e8) return `${(v / 1e8).toFixed(0)}億`;
                  if (v >= 1e4) return `${(v / 1e4).toFixed(0)}萬`;
                  return v.toLocaleString();
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `時間：${label}`}
                    formatter={(value) => value.toLocaleString()}
                  />
                }
              />
              <Area
                dataKey={chartTab}
                type="monotone"
                fill={`url(#fill-${chartTab})`}
                stroke={`var(--color-${chartTab})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 解析並格式化數字，適用於指數歷史數據
function HistoryChartSection({ list }: { list: IndexHistoryDto[] }) {
  const chartData = useMemo(() => {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((item) => ({
      date: item.date,
      closingIndex: parseNumber(item.closingIndex),
      openingIndex: parseNumber(item.openingIndex),
      highestIndex: parseNumber(item.highestIndex),
      lowestIndex: parseNumber(item.lowestIndex),
    }));
  }, [list]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const closes = chartData.map((d) => d.closingIndex);
    const latest = closes[closes.length - 1];
    const first = closes[0];
    const change = latest - first;
    const changePercent = ((change / first) * 100).toFixed(2);
    return { change, changePercent, isUp: change >= 0 };
  }, [chartData]);

  return (
    <div className="space-y-4">
      <ChartContainer config={historyChartConfig} className="h-80 w-full">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillHighLow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-highLow)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-highLow)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(v) => {
              const parts = v.split("/");
              return parts.length >= 2
                ? `${parts[parts.length - 2]}/${parts[parts.length - 1]}`
                : v;
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            domain={["auto", "auto"]}
            tickFormatter={(v) => v.toLocaleString()}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(label) => `日期：${label}`}
                formatter={(value, name) => {
                  const labels: Record<string, string> = {
                    closingIndex: "收盤",
                    openingIndex: "開盤",
                    highestIndex: "最高",
                    lowestIndex: "最低",
                  };
                  return `${labels[name as string] || name}：${Number(value).toLocaleString()}`;
                }}
              />
            }
          />
          <Area
            dataKey="highestIndex"
            type="monotone"
            fill="url(#fillHighLow)"
            stroke="none"
            stackId="range"
          />
          <Area
            dataKey="lowestIndex"
            type="monotone"
            fill="transparent"
            stroke="none"
            stackId="range-base"
          />
          <Line
            dataKey="closingIndex"
            type="monotone"
            stroke="var(--color-closingIndex)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="openingIndex"
            type="monotone"
            stroke="var(--color-openingIndex)"
            strokeWidth={1}
            dot={false}
            strokeDasharray="4 4"
          />
        </ComposedChart>
      </ChartContainer>
      {stats && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
          {stats.isUp ? (
            <TrendingUp className="size-4 text-red-500" />
          ) : (
            <TrendingDown className="size-4 text-green-500" />
          )}
          <span>
            期間 {stats.isUp ? "上漲" : "下跌"} {Math.abs(Number(stats.changePercent))}%
          </span>
        </div>
      )}
    </div>
  );
}

// 這是
export default function MarketOverviewClient() {
  const dispatch = useAppDispatch();
  const marketIndex = useAppSelector((state) => state.stock?.marketIndex);
  const intraday = useAppSelector((state) => state.stock?.intraday);
  const indexHistory = useAppSelector((state) => state.stock?.indexHistory);
  const dailyAll = useAppSelector((state) => state.stock?.dailyAll);

  const [indexSorting, setIndexSorting] = useState<SortingState>([
    { id: "closingIndex", desc: true },
  ]);
  const [historySorting, setHistorySorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [indexFilter, setIndexFilter] = useState("");
  const [historyFilter, setHistoryFilter] = useState("");
  const [chartView, setChartView] = useState("intraday");
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      if (!marketIndex) dispatch({ type: "GET_STOCK_MARKET_INDEX" });
      if (!intraday) dispatch({ type: "GET_STOCK_INTRADAY" });
      if (!indexHistory) dispatch({ type: "GET_STOCK_INDEX_HISTORY" });
      if (!dailyAll) dispatch({ type: "GET_STOCK_DAILY_ALL" });
    }
  }, [dispatch, marketIndex, intraday, indexHistory, dailyAll]);

  const intradayList: IntradayTickDto[] = useMemo(() => {
    const d = intraday?.data;
    return Array.isArray(d) ? d : [];
  }, [intraday?.data]);
  const historyList: IndexHistoryDto[] = useMemo(() => {
    const d = indexHistory?.data;
    return Array.isArray(d) ? d : [];
  }, [indexHistory?.data]);
  const indexList: MarketIndexDto[] = useMemo(() => {
    const d = marketIndex?.data;
    return Array.isArray(d) ? d : [];
  }, [marketIndex?.data]);
  const latest = intradayList.length > 0 ? intradayList[intradayList.length - 1] : null;

  const historyStats = useMemo(() => {
    if (historyList.length === 0) return null;
    const sorted = [...historyList].sort((a, b) => a.date.localeCompare(b.date));
    const parsed = sorted.map((d) => ({
      close: parseNumber(d.closingIndex),
      high: parseNumber(d.highestIndex),
      low: parseNumber(d.lowestIndex),
    }));
    const latestClose = parsed[parsed.length - 1].close;
    const high = Math.max(...parsed.map((d) => d.high));
    const low = Math.min(...parsed.map((d) => d.low));
    const first = parsed[0].close;
    const change = latestClose - first;
    const changePercent = ((change / first) * 100).toFixed(2);
    return { latestClose, high, low, change, changePercent, isUp: change >= 0 };
  }, [historyList]);

  const taiexRow = indexList.find((r) => r.name?.includes("發行量加權"));

  // ── 漲跌家數統計 ──
  const _marketSentiment = useMemo(() => {
    const stocks = dailyAll?.data ?? [];
    if (!stocks.length) return null;
    let up = 0,
      down = 0,
      flat = 0;
    for (const s of stocks) {
      const change = parseFloat(s.change?.replace(/,/g, "") || "0");
      if (change > 0) up++;
      else if (change < 0) down++;
      else flat++;
    }
    const total = up + down + flat;
    return { up, down, flat, total };
  }, [dailyAll?.data]);

  const indexTable = useReactTable({
    data: indexList,
    columns: marketIndexColumns,
    state: { sorting: indexSorting, globalFilter: indexFilter },
    onSortingChange: setIndexSorting,
    onGlobalFilterChange: setIndexFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const historyTable = useReactTable({
    data: historyList,
    columns: historyColumns,
    state: { sorting: historySorting, globalFilter: historyFilter },
    onSortingChange: setHistorySorting,
    onGlobalFilterChange: setHistoryFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const isLoading = !marketIndex || !intraday || !indexHistory;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入資料中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <PageHeader title="大盤總覽" subtitle={<>加權指數即時行情、盤中走勢、歷史指數</>} />

      {/* ── 頂部統計卡片 ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {taiexRow && (
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>加權指數</CardDescription>
              {getChangeColor(taiexRow.changePoints).includes("red") ? (
                <TrendingUp className="size-4 text-red-500" />
              ) : (
                <TrendingDown className="size-4 text-green-500" />
              )}
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{taiexRow.closingIndex}</p>
              <p className={`text-sm font-semibold ${getChangeColor(taiexRow.changePoints)}`}>
                {taiexRow.direction} {taiexRow.changePoints} ({taiexRow.changePercent}%)
              </p>
            </CardContent>
          </Card>
        )}
        {latest && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>累計成交量</CardDescription>
                <IconActivity className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatLargeNumber(latest.accTradeVolume)}</p>
                <p className="text-xs text-muted-foreground">更新 {latest.time}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>累計成交值</CardDescription>
                <IconCurrencyDollar className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatLargeNumber(latest.accTradeValue)}</p>
                <p className="text-xs text-muted-foreground">更新 {latest.time}</p>
              </CardContent>
            </Card>
          </>
        )}
        {historyStats && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>區間漲跌</CardDescription>
              <IconClock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${historyStats.isUp ? "text-red-500" : "text-green-500"}`}
              >
                {historyStats.isUp ? "+" : ""}
                {historyStats.change.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {historyStats.changePercent}%（高 {historyStats.high.toLocaleString()} / 低{" "}
                {historyStats.low.toLocaleString()}）
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 產業分類總覽 */}
      {indexList.length > 0 && <IndustryRadialSection indices={indexList} />}

      {/* 圖表區 */}
      <Card>
        <CardHeader>
          <CardTitle>走勢圖</CardTitle>
          <CardDescription>盤中即時走勢與歷史收盤指數</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={chartView} onValueChange={setChartView}>
            <TabsList>
              <TabsTrigger value="intraday">盤中走勢</TabsTrigger>
              <TabsTrigger value="history">歷史走勢</TabsTrigger>
            </TabsList>
            <TabsContent value="intraday" className="mt-4">
              {intradayList.length > 0 ? (
                <IntradayChartSection list={intradayList} />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">盤中資料尚未載入</p>
              )}
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              {historyList.length > 0 ? (
                <HistoryChartSection list={historyList} />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">歷史資料尚未載入</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="gap-2 text-sm">
          <TrendingUp className="size-4" />
          <span className="text-muted-foreground">資料來源：臺灣證券交易所</span>
        </CardFooter>
      </Card>

      {/* 底部資料表：左右並排 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 左：各類指數 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">各類指數</CardTitle>
              <Badge variant="outline">{indexTable.getFilteredRowModel().rows.length} 筆</Badge>
            </div>
            <Input
              placeholder="搜尋指數名稱..."
              value={indexFilter}
              onChange={(e) => setIndexFilter(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="px-0">
            <DataTableRenderer table={indexTable} columns={marketIndexColumns} />
            <div className="px-6 pt-2">
              <Pagination table={indexTable} />
            </div>
          </CardContent>
        </Card>

        {/* 右：指數歷史 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">指數歷史</CardTitle>
              <Badge variant="outline">{historyTable.getFilteredRowModel().rows.length} 筆</Badge>
            </div>
            <Input
              placeholder="搜尋日期..."
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="px-0">
            <DataTableRenderer table={historyTable} columns={historyColumns} />
            <div className="px-6 pt-2">
              <Pagination table={historyTable} />
            </div>
          </CardContent>
        </Card>
      </div>

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

// 產業分類雷達圖顏色列表
const RADIAL_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(199, 89%, 48%)",
  "hsl(210, 40%, 58%)",
  "hsl(230, 70%, 55%)",
  "hsl(190, 80%, 45%)",
  "hsl(220, 60%, 50%)",
  "hsl(205, 75%, 52%)",
  "hsl(215, 50%, 62%)",
];

// 產業分類雷達圖卡片
function IndustryRadialCard({
  name,
  closingIndex,
  changePercent,
  direction,
  color,
}: {
  name: string;
  closingIndex: string;
  changePercent: string;
  direction: string;
  color: string;
}) {
  const pct = Math.abs(parseNumber(changePercent));
  const maxAngle = Math.min(pct * 36, 340);
  const isUp = direction !== "-" && changePercent !== "0.00";
  const isDown = direction === "-";

  const chartData = [{ value: pct, fill: color }];
  const config = {
    value: { label: name, color },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-sm">{name}</CardTitle>
        <CardDescription>
          <span className={isDown ? "text-green-500" : isUp ? "text-red-500" : ""}>
            {isDown ? "-" : isUp ? "+" : ""}
            {changePercent}%
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="mx-auto aspect-square max-h-35">
          <RadialBarChart
            data={chartData}
            endAngle={isDown ? -maxAngle : maxAngle}
            innerRadius={48}
            outerRadius={70}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[64, 54]}
            />
            <RadialBar dataKey="value" background cornerRadius={6} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-lg font-bold"
                        >
                          {closingIndex}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// 產業分類雷達圖區塊，顯示漲跌幅前幾大的類股指數
function IndustryRadialSection({ indices }: { indices: MarketIndexDto[] }) {
  const sectorIndices = useMemo(() => {
    return indices
      .filter((idx) => {
        const n = idx.name;
        return (
          n.includes("類") ||
          n.includes("紡織") ||
          n.includes("塑膠") ||
          n.includes("電子") ||
          n.includes("金融") ||
          n.includes("半導體") ||
          n.includes("航運") ||
          n.includes("觀光") ||
          n.includes("鋼鐵") ||
          n.includes("營建") ||
          n.includes("生技") ||
          n.includes("油電")
        );
      })
      .sort(
        (a, b) => Math.abs(parseNumber(b.changePercent)) - Math.abs(parseNumber(a.changePercent)),
      )
      .slice(0, 8);
  }, [indices]);

  if (sectorIndices.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">產業分類總覽</h3>
        <Badge variant="outline">漲跌幅前 {sectorIndices.length} 大類股</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {sectorIndices.map((idx, i) => (
          <IndustryRadialCard
            key={idx.name}
            name={idx.name}
            closingIndex={idx.closingIndex}
            changePercent={idx.changePercent}
            direction={idx.direction}
            color={RADIAL_COLORS[i % RADIAL_COLORS.length]}
          />
        ))}
      </div>
    </div>
  );
}

// 資料表渲染器，使用 React Table 的 table 實例和欄位定義來渲染表格
function DataTableRenderer<T>({
  table,
  columns,
}: {
  table: ReturnType<typeof useReactTable<T>>;
  columns: ColumnDef<T, unknown>[];
}) {
  return (
    <div className="overflow-auto border-t">
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
  );
}
