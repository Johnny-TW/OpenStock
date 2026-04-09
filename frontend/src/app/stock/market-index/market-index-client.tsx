"use client"

import { useEffect, useState } from "react"
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
import { Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { PageHeader } from "@/components/commons/page-header"
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
import type { MarketIndexDto } from "@/type/stock"
import { parseNumber, SortHeader } from "@/components/data-table/shared"

function getChangeColor(val: string) {
  if (!val) return ""
  if (val.startsWith("-")) return "text-green-500"
  if (val === "0.00" || val === "0") return ""
  return "text-red-500"
}

const columns: ColumnDef<MarketIndexDto>[] = [
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
    sortingFn: (a, b) => parseNumber(a.original.closingIndex) - parseNumber(b.original.closingIndex),
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
    sortingFn: (a, b) => parseNumber(a.original.changePoints) - parseNumber(b.original.changePoints),
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
    sortingFn: (a, b) => parseNumber(a.original.changePercent) - parseNumber(b.original.changePercent),
    size: 120,
  },
]

export default function MarketIndexClient() {
  const dispatch = useAppDispatch()
  const marketIndex = useAppSelector((state) => state.stock?.marketIndex)
  const [sorting, setSorting] = useState<SortingState>([{ id: "closingIndex", desc: true }])
  const [globalFilter, setGlobalFilter] = useState("")

  useEffect(() => {
    dispatch({ type: "GET_STOCK_MARKET_INDEX" })
  }, [dispatch])

  const list: MarketIndexDto[] = marketIndex?.data ?? []

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

  if (!marketIndex) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入指數資料中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="大盤 / 類股指數總覽"
        subtitle={<>共 {list.length} 項指數</>}
      />

      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="搜尋指數名稱..."
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
