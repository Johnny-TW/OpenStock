"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
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
import { Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { Button } from "@/components/commons/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/commons/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/commons/tabs"
import { Input } from "@/components/commons/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/commons/select"
import { PageHeader } from "@/components/commons/page-header"
import { Badge } from "@/components/commons/badge"
import type {
  RevenueRankingDto,
  GrossMarginRankingDto,
  DividendYieldRankingDto,
  PeRatioRankingDto,
} from "@/type/stock"
import { SortHeader, Pagination } from "@/components/data-table/shared"

function formatCurrency(num: number): string {
  if (Math.abs(num) >= 1e8) {
    return `${(num / 1e8).toFixed(2)} 億`
  }
  if (Math.abs(num) >= 1e4) {
    return `${(num / 1e4).toFixed(0)} 萬`
  }
  return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const revenueColumns: ColumnDef<RevenueRankingDto>[] = [
  { accessorKey: "code", header: "代號", cell: ({ row }) => <span className="font-medium">{row.original.code}</span>, size: 80, enableSorting: false },
  { accessorKey: "name", header: "名稱", size: 100, enableSorting: false },
  { accessorKey: "industry", header: "產業別", size: 100, enableSorting: false },
  {
    accessorKey: "revenue",
    header: "營業收入",
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.revenue)}</div>,
    sortingFn: (a, b) => a.original.revenue - b.original.revenue,
    size: 120,
  },
  {
    accessorKey: "operatingIncome",
    header: "營業利益",
    cell: ({ row }) => <div className={`text-right ${row.original.operatingIncome < 0 ? "text-green-500" : ""}`}>{formatCurrency(row.original.operatingIncome)}</div>,
    sortingFn: (a, b) => a.original.operatingIncome - b.original.operatingIncome,
    size: 120,
  },
  {
    accessorKey: "netIncome",
    header: "稅後淨利",
    cell: ({ row }) => <div className={`text-right ${row.original.netIncome < 0 ? "text-green-500" : ""}`}>{formatCurrency(row.original.netIncome)}</div>,
    sortingFn: (a, b) => a.original.netIncome - b.original.netIncome,
    size: 120,
  },
  {
    accessorKey: "eps",
    header: "EPS",
    cell: ({ row }) => <div className={`text-right font-medium ${row.original.eps < 0 ? "text-green-500" : "text-red-500"}`}>{row.original.eps.toFixed(2)}</div>,
    sortingFn: (a, b) => a.original.eps - b.original.eps,
    size: 80,
  },
]

const grossMarginColumns: ColumnDef<GrossMarginRankingDto>[] = [
  { accessorKey: "code", header: "代號", cell: ({ row }) => <span className="font-medium">{row.original.code}</span>, size: 80, enableSorting: false },
  { accessorKey: "name", header: "名稱", size: 100, enableSorting: false },
  { accessorKey: "industry", header: "產業別", size: 100, enableSorting: false },
  {
    accessorKey: "grossMarginRate",
    header: "毛利率",
    cell: ({ row }) => <div className={`text-right font-bold ${row.original.grossMarginRate >= 50 ? "text-red-500" : row.original.grossMarginRate < 0 ? "text-green-500" : ""}`}>{row.original.grossMarginRate.toFixed(2)}%</div>,
    sortingFn: (a, b) => a.original.grossMarginRate - b.original.grossMarginRate,
    size: 100,
  },
  {
    accessorKey: "revenue",
    header: "營業收入",
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.revenue)}</div>,
    sortingFn: (a, b) => a.original.revenue - b.original.revenue,
    size: 120,
  },
  {
    accessorKey: "cost",
    header: "營業成本",
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.cost)}</div>,
    sortingFn: (a, b) => a.original.cost - b.original.cost,
    size: 120,
  },
  {
    accessorKey: "grossProfit",
    header: "營業毛利",
    cell: ({ row }) => <div className={`text-right ${row.original.grossProfit < 0 ? "text-green-500" : ""}`}>{formatCurrency(row.original.grossProfit)}</div>,
    sortingFn: (a, b) => a.original.grossProfit - b.original.grossProfit,
    size: 120,
  },
]

const dividendYieldColumns: ColumnDef<DividendYieldRankingDto>[] = [
  { accessorKey: "code", header: "代號", cell: ({ row }) => <span className="font-medium">{row.original.code}</span>, size: 80, enableSorting: false },
  { accessorKey: "name", header: "名稱", size: 100, enableSorting: false },
  { accessorKey: "industry", header: "產業別", size: 100, enableSorting: false },
  {
    accessorKey: "dividendYield",
    header: "殖利率",
    cell: ({ row }) => <div className={`text-right font-bold ${row.original.dividendYield >= 5 ? "text-red-500" : ""}`}>{row.original.dividendYield.toFixed(2)}%</div>,
    sortingFn: (a, b) => a.original.dividendYield - b.original.dividendYield,
    size: 100,
  },
  {
    accessorKey: "peRatio",
    header: "本益比",
    cell: ({ row }) => <div className="text-right">{row.original.peRatio > 0 ? row.original.peRatio.toFixed(2) : "-"}</div>,
    sortingFn: (a, b) => a.original.peRatio - b.original.peRatio,
    size: 100,
  },
  {
    accessorKey: "pbRatio",
    header: "股價淨值比",
    cell: ({ row }) => <div className="text-right">{row.original.pbRatio > 0 ? row.original.pbRatio.toFixed(2) : "-"}</div>,
    sortingFn: (a, b) => a.original.pbRatio - b.original.pbRatio,
    size: 110,
  },
]

const peRatioColumns: ColumnDef<PeRatioRankingDto>[] = [
  { accessorKey: "code", header: "代號", cell: ({ row }) => <span className="font-medium">{row.original.code}</span>, size: 80, enableSorting: false },
  { accessorKey: "name", header: "名稱", size: 100, enableSorting: false },
  { accessorKey: "industry", header: "產業別", size: 100, enableSorting: false },
  {
    accessorKey: "peRatio",
    header: "本益比",
    cell: ({ row }) => <div className={`text-right font-bold ${row.original.peRatio <= 10 ? "text-red-500" : row.original.peRatio >= 50 ? "text-green-500" : ""}`}>{row.original.peRatio.toFixed(2)}</div>,
    sortingFn: (a, b) => a.original.peRatio - b.original.peRatio,
    size: 100,
  },
  {
    accessorKey: "dividendYield",
    header: "殖利率",
    cell: ({ row }) => <div className="text-right">{row.original.dividendYield > 0 ? `${row.original.dividendYield.toFixed(2)}%` : "-"}</div>,
    sortingFn: (a, b) => a.original.dividendYield - b.original.dividendYield,
    size: 100,
  },
  {
    accessorKey: "pbRatio",
    header: "股價淨值比",
    cell: ({ row }) => <div className="text-right">{row.original.pbRatio > 0 ? row.original.pbRatio.toFixed(2) : "-"}</div>,
    sortingFn: (a, b) => a.original.pbRatio - b.original.pbRatio,
    size: 110,
  },
]

function RankingTable<T>({
  data,
  columns,
  globalFilter,
  defaultSorting,
}: {
  data: T[]
  columns: ColumnDef<T, unknown>[]
  globalFilter: string
  defaultSorting: SortingState
}) {
  const [sorting, setSorting] = useState<SortingState>(defaultSorting)

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 50 },
    },
  })

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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  沒有符合的資料
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination table={table} />
    </div>
  )
}

export default function RankingClient() {
  const dispatch = useAppDispatch()
  const ranking = useAppSelector((state) => state.ranking)
  const [activeTab, setActiveTab] = useState("revenue")
  const [search, setSearch] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("all")

  useEffect(() => {
    if (activeTab === "revenue" && !ranking?.revenue) {
      dispatch({ type: "GET_RANKING_REVENUE" })
    } else if (activeTab === "gross-margin" && !ranking?.grossMargin) {
      dispatch({ type: "GET_RANKING_GROSS_MARGIN" })
    } else if (activeTab === "dividend-yield" && !ranking?.dividendYield) {
      dispatch({ type: "GET_RANKING_DIVIDEND_YIELD" })
    } else if (activeTab === "pe-ratio" && !ranking?.peRatio) {
      dispatch({ type: "GET_RANKING_PE_RATIO" })
    }
  }, [activeTab, dispatch, ranking?.revenue, ranking?.grossMargin, ranking?.dividendYield, ranking?.peRatio])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    setSearch("")
    setSelectedIndustry("all")
  }, [])

  const filterByIndustry = useCallback(<T extends { industry: string }>(list: T[]) => {
    if (selectedIndustry === "all") return list
    return list.filter((r) => r.industry === selectedIndustry)
  }, [selectedIndustry])

  const revenueData = useMemo(() => filterByIndustry(ranking?.revenue?.data ?? []), [ranking?.revenue, filterByIndustry])
  const grossMarginData = useMemo(() => filterByIndustry(ranking?.grossMargin?.data ?? []), [ranking?.grossMargin, filterByIndustry])
  const dividendYieldData = useMemo(() => filterByIndustry(ranking?.dividendYield?.data ?? []), [ranking?.dividendYield, filterByIndustry])
  const peRatioData = useMemo(() => filterByIndustry(ranking?.peRatio?.data ?? []), [ranking?.peRatio, filterByIndustry])

  const industries = useMemo(() => {
    let list: { industry: string }[] = []
    switch (activeTab) {
      case "revenue": list = ranking?.revenue?.data ?? []; break
      case "gross-margin": list = ranking?.grossMargin?.data ?? []; break
      case "dividend-yield": list = ranking?.dividendYield?.data ?? []; break
      case "pe-ratio": list = ranking?.peRatio?.data ?? []; break
    }
    const set = new Set(list.map((r) => r.industry).filter(Boolean))
    return Array.from(set).sort()
  }, [activeTab, ranking?.revenue, ranking?.grossMargin, ranking?.dividendYield, ranking?.peRatio])

  const getPeriod = () => {
    switch (activeTab) {
      case "revenue": {
        const y = ranking?.revenue?.year
        const q = ranking?.revenue?.quarter
        return y ? `${y} 年第 ${q} 季` : ""
      }
      case "gross-margin": {
        const y = ranking?.grossMargin?.year
        const q = ranking?.grossMargin?.quarter
        return y ? `${y} 年第 ${q} 季` : ""
      }
      default: return "即時資料"
    }
  }

  const isLoading = () => {
    switch (activeTab) {
      case "revenue": return !ranking?.revenue
      case "gross-margin": return !ranking?.grossMargin
      case "dividend-yield": return !ranking?.dividendYield
      case "pe-ratio": return !ranking?.peRatio
      default: return false
    }
  }

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="排行榜"
        subtitle={<>{getPeriod() && `${getPeriod()}`}</>}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="revenue">營收排行</TabsTrigger>
            <TabsTrigger value="gross-margin">毛利率排行</TabsTrigger>
            <TabsTrigger value="dividend-yield">殖利率排行</TabsTrigger>
            <TabsTrigger value="pe-ratio">本益比排行</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="全部產業" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部產業</SelectItem>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="搜尋代號、名稱..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
        </div>

        {isLoading() ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">載入排行資料中...</span>
          </div>
        ) : (
          <>
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

      <p className="text-xs text-muted-foreground/60 pt-2">
        資料來源：
        <a href="https://openapi.twse.com.tw" target="_blank" rel="noopener noreferrer" className="underline">
          臺灣證券交易所 OpenAPI
        </a>
        ，僅供投資研究參考，不構成任何投資建議。
      </p>
    </div>
  )
}
