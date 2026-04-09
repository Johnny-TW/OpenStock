"use client"

import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsUpDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"
import { useReactTable } from "@tanstack/react-table"
import { Button } from "@/components/commons/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/commons/select"

export function parseNumber(value: string): number {
  if (!value || value === "-" || value === "--") return 0
  return parseFloat(value.replace(/,/g, "")) || 0
}

export function SortHeader<T>({
  column,
  label,
  className,
}: {
  column: ReturnType<ReturnType<typeof useReactTable<T>>["getColumn"]>
  label: string
  className?: string
}) {
  if (!column) return <span>{label}</span>
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`-ml-3 h-8 ${className ?? ""}`}
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

export function Pagination<T>({ table }: { table: ReturnType<typeof useReactTable<T>> }) {
  return (
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
  )
}