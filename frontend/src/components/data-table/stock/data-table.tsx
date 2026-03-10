"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsUpDown,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconGripVertical,
  IconLayoutColumns,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/commons/badge"
import { Button } from "@/components/commons/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/commons/chart"
import { Checkbox } from "@/components/commons/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/commons/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/commons/dropdown-menu"
import { Input } from "@/components/commons/input"
import { Label } from "@/components/commons/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/commons/select"
import { Separator } from "@/components/commons/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/commons/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/commons/tabs"

import type { StockDailyDto } from "@/type/stock"

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "")
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function getChangeColor(change: string): string {
  if (change.startsWith("+")) return "text-red-500"
  if (change.startsWith("-")) return "text-green-500"
  return "text-muted-foreground"
}

export type StockRow = StockDailyDto & { _rowId: number }

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">拖曳排序</span>
    </Button>
  )
}

const columns: ColumnDef<StockRow>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original._rowId} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="全選"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="選取"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: "證券代號",
    cell: ({ row }) => <TableCellViewer item={row.original} />,
    enableHiding: false,
    size: 100,
  },
  {
    accessorKey: "name",
    header: "證券名稱",
    size: 140,
  },
  {
    accessorKey: "closingPrice",
    header: "收盤價",
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.closingPrice}</div>
    ),
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.closingPrice) -
      parseNumber(rowB.original.closingPrice),
    size: 100,
  },
  {
    accessorKey: "change",
    header: "漲跌價差",
    cell: ({ row }) => (
      <div className={`text-right font-mono ${getChangeColor(row.original.change)}`}>
        {row.original.change}
      </div>
    ),
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.change) - parseNumber(rowB.original.change),
    size: 100,
  },
  {
    accessorKey: "openingPrice",
    header: "開盤價",
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.openingPrice}</div>
    ),
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.openingPrice) -
      parseNumber(rowB.original.openingPrice),
    size: 100,
  },
  {
    accessorKey: "highestPrice",
    header: "最高價",
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.highestPrice}</div>
    ),
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.highestPrice) -
      parseNumber(rowB.original.highestPrice),
    size: 100,
  },
  {
    accessorKey: "lowestPrice",
    header: "最低價",
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.lowestPrice}</div>
    ),
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.lowestPrice) -
      parseNumber(rowB.original.lowestPrice),
    size: 100,
  },
  {
    accessorKey: "tradeVolume",
    header: "成交股數",
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.tradeVolume}</div>
    ),
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.tradeVolume) -
      parseNumber(rowB.original.tradeVolume),
    size: 130,
  },
  {
    accessorKey: "tradeValue",
    header: "成交金額",
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.tradeValue}</div>
    ),
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.tradeValue) -
      parseNumber(rowB.original.tradeValue),
    size: 150,
  },
  {
    accessorKey: "transaction",
    header: "成交筆數",
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.transaction}</div>
    ),
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.transaction) -
      parseNumber(rowB.original.transaction),
    size: 110,
  },
]

function DraggableRow({ row }: { row: Row<StockRow> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original._rowId,
  })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function StockDataTable({
  data: initialData,
  title,
}: {
  data: StockDailyDto[]
  title?: string
}) {
  // 加上 _rowId 供拖曳排序使用
  const [data, setData] = React.useState<StockRow[]>(() =>
    initialData.map((d, i) => ({ ...d, _rowId: i }))
  )

  // 當外部資料變更時同步
  React.useEffect(() => {
    setData(initialData.map((d, i) => ({ ...d, _rowId: i })))
  }, [initialData])

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50,
  })

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ _rowId }) => _rowId) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    getRowId: (row) => row._rowId.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="table"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          檢視
        </Label>
        <Select defaultValue="table">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="選擇檢視" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="table">日成交總覽</SelectItem>
            <SelectItem value="summary">統計摘要</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="table">日成交總覽</TabsTrigger>
          <TabsTrigger value="summary">
            統計摘要 <Badge variant="secondary">{data.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Input
            placeholder="搜尋代號或名稱..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs h-8 text-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">自訂欄位</span>
                <span className="lg:hidden">欄位</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TabsContent
        value="table"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        {title && (
          <h2 className="text-lg font-semibold">{title}</h2>
        )}

        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <button
                            className="flex items-center gap-1 hover:text-foreground cursor-pointer select-none"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <IconArrowUp className="size-4" />,
                              desc: <IconArrowDown className="size-4" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <IconArrowsUpDown className="size-4 text-muted-foreground/50" />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      無資料
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            已選 {table.getFilteredSelectedRowModel().rows.length} /{" "}
            {table.getFilteredRowModel().rows.length} 筆
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                每頁筆數
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[20, 50, 100, 200].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              第 {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()} 頁
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">第一頁</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">上一頁</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">下一頁</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">最後一頁</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent
        value="summary"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
          統計摘要 — 共 {data.length} 檔證券
        </div>
      </TabsContent>
    </Tabs>
  )
}

const chartConfig = {
  price: {
    label: "價格",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function TableCellViewer({ item }: { item: StockRow }) {
  const isMobile = useIsMobile()

  const change = parseNumber(item.change)
  const isUp = change > 0
  const isDown = change < 0

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left font-mono">
          {item.code}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>
            {item.code} {item.name}
          </DrawerTitle>
          <DrawerDescription className="flex items-center gap-2">
            收盤 {item.closingPrice}
            <span className={getChangeColor(item.change)}>
              {item.change}
              {isUp && <IconTrendingUp className="inline size-4 ml-1" />}
              {isDown && <IconTrendingDown className="inline size-4 ml-1" />}
            </span>
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={[
                    { label: "最低", value: parseNumber(item.lowestPrice) },
                    { label: "開盤", value: parseNumber(item.openingPrice) },
                    { label: "收盤", value: parseNumber(item.closingPrice) },
                    { label: "最高", value: parseNumber(item.highestPrice) },
                  ]}
                  margin={{ left: 0, right: 10 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="value"
                    type="natural"
                    fill="var(--color-price)"
                    fillOpacity={0.4}
                    stroke="var(--color-price)"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">開盤價</Label>
              <span className="font-mono">{item.openingPrice}</span>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">收盤價</Label>
              <span className="font-mono">{item.closingPrice}</span>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">最高價</Label>
              <span className="font-mono">{item.highestPrice}</span>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">最低價</Label>
              <span className="font-mono">{item.lowestPrice}</span>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">漲跌價差</Label>
              <span className={`font-mono ${getChangeColor(item.change)}`}>
                {item.change}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">成交筆數</Label>
              <span className="font-mono">{item.transaction}</span>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">成交股數</Label>
              <span className="font-mono">{item.tradeVolume}</span>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">成交金額</Label>
              <span className="font-mono">{item.tradeValue}</span>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">關閉</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
