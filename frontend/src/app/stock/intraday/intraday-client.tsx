"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconActivity,
  IconCurrencyDollar,
  IconClock,
} from "@tabler/icons-react"
import { Loader2, TrendingUp } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { PageHeader } from "@/components/commons/page-header/page-header"
import { Button } from "@/components/commons/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/commons/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/commons/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/commons/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/commons/chart"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/commons/tabs"
import type { IntradayTickDto } from "@/type/stock"
import { parseNumber, SortHeader } from "@/components/data-table/shared"

const chartConfig = {
  volume: { label: "累計成交量", color: "hsl(var(--chart-1))" },
  value: { label: "累計成交值", color: "hsl(var(--chart-2))" },
  transaction: { label: "累計成交筆數", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

const columns: ColumnDef<IntradayTickDto>[] = [
  {
    accessorKey: "time",
    header: "時間",
    cell: ({ row }) => <span className="font-medium">{row.original.time}</span>,
    size: 100,
  },
  {
    accessorKey: "accTradeVolume",
    header: "累計成交量",
    cell: ({ row }) => <div className="text-right">{row.original.accTradeVolume}</div>,
    sortingFn: (a, b) => parseNumber(a.original.accTradeVolume) - parseNumber(b.original.accTradeVolume),
    size: 140,
  },
  {
    accessorKey: "accTradeValue",
    header: "累計成交值",
    cell: ({ row }) => <div className="text-right">{row.original.accTradeValue}</div>,
    sortingFn: (a, b) => parseNumber(a.original.accTradeValue) - parseNumber(b.original.accTradeValue),
    size: 140,
  },
  {
    accessorKey: "accTransaction",
    header: "累計成交筆數",
    cell: ({ row }) => <div className="text-right">{row.original.accTransaction}</div>,
    sortingFn: (a, b) => parseNumber(a.original.accTransaction) - parseNumber(b.original.accTransaction),
    size: 140,
  },
]

function formatLargeNumber(val: string) {
  const n = parseNumber(val)
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)} 兆`
  if (n >= 1e8) return `${(n / 1e8).toFixed(2)} 億`
  if (n >= 1e4) return `${(n / 1e4).toFixed(0)} 萬`
  return val
}

export default function IntradayClient() {
  const dispatch = useAppDispatch()
  const intraday = useAppSelector((state) => state.stock?.intraday)
  const [sorting, setSorting] = useState<SortingState>([{ id: "accTradeVolume", desc: true }])
  const [chartTab, setChartTab] = useState("volume")

  useEffect(() => {
    dispatch({ type: "GET_STOCK_INTRADAY" })
  }, [dispatch])

  const list: IntradayTickDto[] = intraday?.data ?? []
  const latest = list.length > 0 ? list[list.length - 1] : null

  const chartData = useMemo(() => {
    const sampled = list.length > 120
      ? list.filter((_, i) => i % Math.ceil(list.length / 120) === 0 || i === list.length - 1)
      : list
    return sampled.map((item) => ({
      time: item.time,
      volume: parseNumber(item.accTradeVolume),
      value: parseNumber(item.accTradeValue),
      transaction: parseNumber(item.accTransaction),
    }))
  }, [list])

  const table = useReactTable({
    data: list,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 50 },
    },
  })

  if (!intraday) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入資料中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title="盤中五秒累計資訊"
        subtitle={<>共 {list.length} 筆紀錄</>}
      />

      {latest && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>最新時間</CardDescription>
              <IconClock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latest.time}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>累計成交量</CardDescription>
              <IconActivity className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latest.accTradeVolume}</p>
              <p className="text-xs text-muted-foreground">
                約 {formatLargeNumber(latest.accTradeVolume)} 股
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>累計成交值</CardDescription>
              <IconCurrencyDollar className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latest.accTradeValue}</p>
              <p className="text-xs text-muted-foreground">
                約 {formatLargeNumber(latest.accTradeValue)} 元
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>盤中走勢圖</CardTitle>
          <CardDescription>累計成交量 / 成交值 / 筆數隨時間變化趨勢</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={chartTab} onValueChange={setChartTab}>
            <TabsList>
              <TabsTrigger value="volume">成交量</TabsTrigger>
              <TabsTrigger value="value">成交值</TabsTrigger>
              <TabsTrigger value="transaction">成交筆數</TabsTrigger>
            </TabsList>
            <TabsContent value={chartTab} className="mt-4">
              <ChartContainer config={chartConfig} className="h-75 w-full">
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
                      if (v >= 1e12) return `${(v / 1e12).toFixed(1)}兆`
                      if (v >= 1e8) return `${(v / 1e8).toFixed(0)}億`
                      if (v >= 1e4) return `${(v / 1e4).toFixed(0)}萬`
                      return v.toLocaleString()
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
        </CardContent>
        <CardFooter className="gap-2 text-sm">
          <TrendingUp className="size-4" />
          <span className="text-muted-foreground">盤中即時累計走勢</span>
        </CardFooter>
      </Card>

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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  沒有符合的資料
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>每頁</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[20, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>筆</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-8" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <IconChevronsLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <IconChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button variant="outline" size="icon" className="size-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <IconChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            <IconChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
