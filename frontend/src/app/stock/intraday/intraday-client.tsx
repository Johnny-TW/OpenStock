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
  CardHeader,
  CardTitle,
} from "@/components/commons/card"
import type { IntradayTickDto } from "@/type/stock"
import { parseNumber, SortHeader } from "@/components/data-table/shared"

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

export default function IntradayClient() {
  const dispatch = useAppDispatch()
  const intraday = useAppSelector((state) => state.stock?.intraday)
  const [sorting, setSorting] = useState<SortingState>([{ id: "accTradeVolume", desc: true }])

  useEffect(() => {
    dispatch({ type: "GET_STOCK_INTRADAY" })
  }, [dispatch])

  const list: IntradayTickDto[] = intraday?.data ?? []
  const latest = list.length > 0 ? list[list.length - 1] : null

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
        <span className="ml-2 text-muted-foreground">載入盤中資料中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="盤中五秒累計資訊"
        subtitle={<>共 {list.length} 筆紀錄</>}
      />

      {latest && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">最新時間</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latest.time}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">累計成交量</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latest.accTradeVolume}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">累計成交值</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latest.accTradeValue}</p>
            </CardContent>
          </Card>
        </div>
      )}

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
