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
import type { TopVolumeDto } from "@/type/stock"
import { parseNumber, SortHeader } from "@/components/data-table/shared"

function getChangeColor(direction: string) {
  if (direction === "-") return "text-green-500"
  if (direction === "+") return "text-red-500"
  return ""
}

const columns: ColumnDef<TopVolumeDto>[] = [
  {
    accessorKey: "rank",
    header: "排名",
    cell: ({ row }) => <span>{row.original.rank}</span>,
    sortingFn: (a, b) => parseNumber(a.original.rank) - parseNumber(b.original.rank),
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
    sortingFn: (a, b) => parseNumber(a.original.tradeVolume) - parseNumber(b.original.tradeVolume),
    size: 120,
  },
  {
    accessorKey: "openingPrice",
    header: "開盤",
    cell: ({ row }) => <div className="text-right">{row.original.openingPrice}</div>,
    sortingFn: (a, b) => parseNumber(a.original.openingPrice) - parseNumber(b.original.openingPrice),
    size: 90,
  },
  {
    accessorKey: "highestPrice",
    header: "最高",
    cell: ({ row }) => <div className="text-right">{row.original.highestPrice}</div>,
    sortingFn: (a, b) => parseNumber(a.original.highestPrice) - parseNumber(b.original.highestPrice),
    size: 90,
  },
  {
    accessorKey: "lowestPrice",
    header: "最低",
    cell: ({ row }) => <div className="text-right">{row.original.lowestPrice}</div>,
    sortingFn: (a, b) => parseNumber(a.original.lowestPrice) - parseNumber(b.original.lowestPrice),
    size: 90,
  },
  {
    accessorKey: "closingPrice",
    header: "收盤",
    cell: ({ row }) => <div className="text-right">{row.original.closingPrice}</div>,
    sortingFn: (a, b) => parseNumber(a.original.closingPrice) - parseNumber(b.original.closingPrice),
    size: 90,
  },
  {
    accessorKey: "change",
    header: "漲跌",
    cell: ({ row }) => (
      <div className={`text-right ${getChangeColor(row.original.direction)}`}>
        {row.original.direction}{row.original.change}
      </div>
    ),
    sortingFn: (a, b) => {
      const aVal = parseNumber(a.original.change) * (a.original.direction === "-" ? -1 : 1)
      const bVal = parseNumber(b.original.change) * (b.original.direction === "-" ? -1 : 1)
      return aVal - bVal
    },
    size: 90,
  },
]

export default function TopVolumeClient() {
  const dispatch = useAppDispatch()
  const topVolume = useAppSelector((state) => state.stock?.topVolume)
  const [sorting, setSorting] = useState<SortingState>([{ id: "tradeVolume", desc: true }])
  const [globalFilter, setGlobalFilter] = useState("")

  useEffect(() => {
    dispatch({ type: "GET_STOCK_TOP_VOLUME" })
  }, [dispatch])

  const list: TopVolumeDto[] = topVolume?.data ?? []

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

  if (!topVolume) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入成交排行中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="成交量前 20 名"
        subtitle={<>共 {list.length} 檔</>}
      />

      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="搜尋代號或名稱..."
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
