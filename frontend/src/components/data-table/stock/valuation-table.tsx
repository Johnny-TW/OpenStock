"use client"

import * as React from "react"
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
  IconArrowDown,
  IconArrowUp,
  IconArrowsUpDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"

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
import type { StockValuationDto } from "@/type/stock"

function parseNumber(value: string): number {
  if (!value || value === "-" || value === "--") return 0
  return parseFloat(value.replace(/,/g, "")) || 0
}

function SortHeader({
  column,
  label,
}: {
  column: ReturnType<ReturnType<typeof useReactTable>["getColumn"]>
  label: string
}) {
  if (!column) return <span>{label}</span>
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <IconArrowUp className="ml-1 size-3" />
      ) : sorted === "desc" ? (
        <IconArrowDown className="ml-1 size-3" />
      ) : (
        <IconArrowsUpDown className="ml-1 size-3 opacity-40" />
      )}
    </Button>
  )
}

function getDividendYieldColor(value: string): string {
  const num = parseNumber(value)
  if (num >= 5) return "text-red-500"
  if (num >= 3) return "text-orange-500"
  if (num <= 0) return "text-muted-foreground"
  return ""
}

const columns: ColumnDef<StockValuationDto>[] = [
  {
    accessorKey: "code",
    header: "證券代號",
    cell: ({ row }) => (
      <span className="font-mono font-medium">{row.original.code}</span>
    ),
    size: 100,
  },
  {
    accessorKey: "name",
    header: "證券名稱",
    size: 140,
  },
  {
    accessorKey: "dividendYield",
    header: "殖利率(%)",
    cell: ({ row }) => (
      <div className={`text-right font-mono ${getDividendYieldColor(row.original.dividendYield)}`}>
        {row.original.dividendYield}
      </div>
    ),
    sortingFn: (a, b) =>
      parseNumber(a.original.dividendYield) - parseNumber(b.original.dividendYield),
    size: 110,
  },
  {
    accessorKey: "peRatio",
    header: "本益比",
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.peRatio}</div>
    ),
    sortingFn: (a, b) =>
      parseNumber(a.original.peRatio) - parseNumber(b.original.peRatio),
    size: 100,
  },
  {
    accessorKey: "pbRatio",
    header: "股價淨值比",
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.pbRatio}</div>
    ),
    sortingFn: (a, b) =>
      parseNumber(a.original.pbRatio) - parseNumber(b.original.pbRatio),
    size: 110,
  },
  {
    accessorKey: "dividendYear",
    header: "股利年度",
    cell: ({ row }) => (
      <div className="text-center">{row.original.dividendYear}</div>
    ),
    size: 100,
  },
  {
    accessorKey: "financialYear",
    header: "財報年/季",
    cell: ({ row }) => (
      <div className="text-center">{row.original.financialYear}</div>
    ),
    size: 110,
  },
]

interface StockValuationTableProps {
  data: StockValuationDto[]
  title?: string
}

export function StockValuationTable({ data, title }: StockValuationTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="搜尋代號或名稱..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">共 {table.getFilteredRowModel().rows.length} 筆</Badge>
          {title && <span className="hidden sm:inline">{title}</span>}
        </div>
      </div>

      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
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

      {/* Pagination */}
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
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
