"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
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
} from "@tabler/icons-react"
import { Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { PageHeader } from "@/components/commons/page-header/page-header"
import { Button } from "@/components/commons/button"
import { Input } from "@/components/commons/input"
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
import { Badge } from "@/components/commons/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/commons/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/commons/chart"
import type { IndexHistoryDto } from "@/type/stock"
import { parseNumber, SortHeader } from "@/components/data-table/shared"

const chartConfig = {
  closingIndex: { label: "收盤指數", color: "hsl(var(--chart-1))" },
  highLow: { label: "高低區間", color: "hsl(var(--chart-2))" },
  openingIndex: { label: "開盤指數", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

const columns: ColumnDef<IndexHistoryDto>[] = [
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
    sortingFn: (a, b) => parseNumber(a.original.openingIndex) - parseNumber(b.original.openingIndex),
    size: 120,
  },
  {
    accessorKey: "highestIndex",
    header: "最高指數",
    cell: ({ row }) => <div className="text-right text-red-500">{row.original.highestIndex}</div>,
    sortingFn: (a, b) => parseNumber(a.original.highestIndex) - parseNumber(b.original.highestIndex),
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
    sortingFn: (a, b) => parseNumber(a.original.closingIndex) - parseNumber(b.original.closingIndex),
    size: 120,
  },
]

export default function IndexHistoryClient() {
  const dispatch = useAppDispatch()
  const indexHistory = useAppSelector((state) => state.stock?.indexHistory)
  const [sorting, setSorting] = useState<SortingState>([{ id: "closingIndex", desc: true }])
  const [globalFilter, setGlobalFilter] = useState("")

  useEffect(() => {
    dispatch({ type: "GET_STOCK_INDEX_HISTORY" })
  }, [dispatch])

  const list: IndexHistoryDto[] = indexHistory?.data ?? []

  const chartData = useMemo(() => {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date))
    return sorted.map((item) => ({
      date: item.date,
      closingIndex: parseNumber(item.closingIndex),
      openingIndex: parseNumber(item.openingIndex),
      highestIndex: parseNumber(item.highestIndex),
      lowestIndex: parseNumber(item.lowestIndex),
      range: [parseNumber(item.lowestIndex), parseNumber(item.highestIndex)] as [number, number],
    }))
  }, [list])

  const stats = useMemo(() => {
    if (chartData.length === 0) return null
    const closes = chartData.map((d) => d.closingIndex)
    const latest = closes[closes.length - 1]
    const first = closes[0]
    const high = Math.max(...chartData.map((d) => d.highestIndex))
    const low = Math.min(...chartData.map((d) => d.lowestIndex))
    const change = latest - first
    const changePercent = ((change / first) * 100).toFixed(2)
    return { latest, high, low, change, changePercent, isUp: change >= 0 }
  }, [chartData])

  const table = useReactTable({
    data: list,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 20 },
    },
  })

  if (!indexHistory) {
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
        title="每日收盤指數歷史"
        subtitle={<>共 {list.length} 筆紀錄</>}
      />

      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>最新收盤</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.latest.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>區間漲跌</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${stats.isUp ? "text-red-500" : "text-green-500"}`}>
                {stats.isUp ? "+" : ""}{stats.change.toFixed(2)} ({stats.changePercent}%)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>區間最高</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-500">{stats.high.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>區間最低</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">{stats.low.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>指數走勢圖</CardTitle>
            <CardDescription>收盤指數趨勢與每日高低區間</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80 w-full">
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
                    const parts = v.split("/")
                    return parts.length >= 2 ? `${parts[parts.length - 2]}/${parts[parts.length - 1]}` : v
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
                        }
                        return `${labels[name as string] || name}：${Number(value).toLocaleString()}`
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
          </CardContent>
          <CardFooter className="gap-2 text-sm">
            {stats?.isUp ? (
              <TrendingUp className="size-4 text-red-500" />
            ) : (
              <TrendingDown className="size-4 text-green-500" />
            )}
            <span className="text-muted-foreground">
              期間 {stats?.isUp ? "上漲" : "下跌"} {Math.abs(Number(stats?.changePercent))}%
            </span>
          </CardFooter>
        </Card>
      )}

      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="搜尋日期..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
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
