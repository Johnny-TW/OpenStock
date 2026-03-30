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
  IconHeart,
  IconHeartFilled,
  IconX,
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
import { useAppDispatch } from "@/hooks/use-redux"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/commons/dialog"

import type { StockDailyDto, WatchlistItem } from "@/type/stock"

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

function WatchlistButton({
  item,
  watchlist,
  dispatch,
  userId,
}: {
  item: StockRow
  watchlist: WatchlistItem[]
  dispatch: ReturnType<typeof useAppDispatch>
  userId: string
}) {
  const watchlistItem = watchlist.find((w) => w.stockNo === item.code)
  const isInWatchlist = !!watchlistItem
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedGroup, setSelectedGroup] = React.useState("未分類")
  const [isCreatingNew, setIsCreatingNew] = React.useState(false)
  const [newGroupName, setNewGroupName] = React.useState("")

  const allGroupNames = React.useMemo(() => {
    const groups = new Set<string>(watchlist.map((w) => w.groupName || "未分類"))
    groups.add("未分類")
    return Array.from(groups)
  }, [watchlist])

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (isInWatchlist && watchlistItem) {
      dispatch({ type: "REMOVE_WATCHLIST", id: watchlistItem.id, userId })
    } else {
      const defaultGroup = allGroupNames[0] ?? "未分類"
      setSelectedGroup(defaultGroup)
      setIsCreatingNew(false)
      setNewGroupName("")
      setDialogOpen(true)
    }
  }

  function handleConfirm() {
    const groupName = isCreatingNew
      ? newGroupName.trim() || "未分類"
      : selectedGroup
    dispatch({
      type: "ADD_WATCHLIST",
      data: { userId, stockNo: item.code, stockName: item.name, groupName },
    })
    setDialogOpen(false)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center justify-center size-7 rounded hover:bg-muted transition-colors ${
          isInWatchlist
            ? "text-red-500"
            : "text-muted-foreground hover:text-red-400"
        }`}
      >
        {isInWatchlist ? (
          <IconHeartFilled className="size-4" />
        ) : (
          <IconHeart className="size-4" />
        )}
      </button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>加入自選股</DialogTitle>
            <DialogDescription>
              {item.code} {item.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Label>選擇群組</Label>
            {!isCreatingNew ? (
              <Select
                value={selectedGroup}
                onValueChange={(v) => {
                  if (v === "__new__") {
                    setIsCreatingNew(true)
                    setNewGroupName("")
                  } else {
                    setSelectedGroup(v)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allGroupNames.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">＋ 新增群組</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                  placeholder="輸入群組名稱"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCreatingNew(false)}
                >
                  <IconX className="size-4" />
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirm}>加入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function WatchlistGroupSelect({
  currentGroup,
  watchlistItem,
  dispatch,
  userId,
  allGroupNames,
}: {
  currentGroup: string
  watchlistItem: WatchlistItem
  dispatch: ReturnType<typeof useAppDispatch>
  userId: string
  allGroupNames: string[]
}) {
  const [isCreatingNew, setIsCreatingNew] = React.useState(false)
  const [newName, setNewName] = React.useState("")

  function handleGroupChange(value: string) {
    if (value === "__new__") {
      setIsCreatingNew(true)
      setNewName("")
      return
    }
    dispatch({
      type: "UPDATE_WATCHLIST_GROUP",
      id: watchlistItem.id,
      groupName: value,
      userId,
    })
  }

  function handleNewGroupSubmit() {
    const name = newName.trim()
    if (!name) return
    dispatch({
      type: "UPDATE_WATCHLIST_GROUP",
      id: watchlistItem.id,
      groupName: name,
      userId,
    })
    setIsCreatingNew(false)
    setNewName("")
  }

  if (isCreatingNew) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleNewGroupSubmit()}
          placeholder="群組名稱"
          className="h-7 text-xs w-28"
          autoFocus
        />
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-xs" onClick={handleNewGroupSubmit}>
          ✓
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setIsCreatingNew(false)}>
          <IconX className="size-3" />
        </Button>
      </div>
    )
  }

  return (
    <Select value={currentGroup} onValueChange={handleGroupChange}>
      <SelectTrigger className="h-7 text-xs w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allGroupNames.map((g) => (
          <SelectItem key={g} value={g} className="text-xs">
            {g}
          </SelectItem>
        ))}
        <SelectItem value="__new__" className="text-xs text-muted-foreground">
          ＋ 新增群組
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

type GroupedItem = { stock: StockRow; wItem: WatchlistItem }

type WatchlistSortKey = "code" | "name" | "closingPrice" | "change" | "openingPrice" | "highestPrice" | "lowestPrice" | "tradeVolume" | "tradeValue" | "transaction"

function SortableHead({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
  className = "",
}: {
  label: string
  sortKey: WatchlistSortKey
  currentKey: WatchlistSortKey | null
  direction: "asc" | "desc"
  onSort: (key: WatchlistSortKey) => void
  className?: string
}) {
  const isActive = currentKey === sortKey
  return (
    <TableHead className={className}>
      <button
        className="flex items-center gap-1 hover:text-foreground cursor-pointer select-none"
        onClick={() => onSort(sortKey)}
      >
        {label}
        {isActive ? (
          direction === "asc" ? <IconArrowUp className="size-4" /> : <IconArrowDown className="size-4" />
        ) : (
          <IconArrowsUpDown className="size-4 text-muted-foreground/50" />
        )}
      </button>
    </TableHead>
  )
}

function WatchlistGroupSection({
  groupName,
  items,
  dispatch,
  userId,
  allGroupNames,
}: {
  groupName: string
  items: GroupedItem[]
  dispatch: ReturnType<typeof useAppDispatch>
  userId: string
  allGroupNames: string[]
}) {
  const [sortKey, setSortKey] = React.useState<WatchlistSortKey | null>(null)
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc")

  function handleSort(key: WatchlistSortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sortedItems = React.useMemo(() => {
    if (!sortKey) return items
    return [...items].sort((a, b) => {
      const valA = a.stock[sortKey]
      const valB = b.stock[sortKey]
      const numA = parseNumber(valA)
      const numB = parseNumber(valB)
      const isNum = numA !== 0 || numB !== 0 || valA === "0" || valB === "0"
      const cmp = isNum ? numA - numB : String(valA).localeCompare(String(valB))
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [items, sortKey, sortDir])

  const headProps = { currentKey: sortKey, direction: sortDir, onSort: handleSort }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <span className="font-semibold text-sm">{groupName}</span>
        <Badge variant="secondary" className="text-xs">{items.length}</Badge>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <SortableHead label="代號" sortKey="code" className="w-24" {...headProps} />
              <SortableHead label="名稱" sortKey="name" {...headProps} />
              <SortableHead label="收盤價" sortKey="closingPrice" className="text-right" {...headProps} />
              <SortableHead label="漲跌價差" sortKey="change" className="text-right" {...headProps} />
              <SortableHead label="開盤價" sortKey="openingPrice" className="text-right" {...headProps} />
              <SortableHead label="最高價" sortKey="highestPrice" className="text-right" {...headProps} />
              <SortableHead label="最低價" sortKey="lowestPrice" className="text-right" {...headProps} />
              <SortableHead label="成交股數" sortKey="tradeVolume" className="text-right" {...headProps} />
              <SortableHead label="成交金額" sortKey="tradeValue" className="text-right" {...headProps} />
              <SortableHead label="成交筆數" sortKey="transaction" className="text-right" {...headProps} />
              <TableHead className="w-44">群組</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map(({ stock, wItem }) => (
              <TableRow key={stock.code}>
                <TableCell>
                  <button
                    onClick={() => dispatch({ type: "REMOVE_WATCHLIST", id: wItem.id, userId })}
                    className="flex items-center justify-center size-7 rounded hover:bg-muted transition-colors text-red-500 hover:text-red-600"
                  >
                    <IconHeartFilled className="size-4" />
                  </button>
                </TableCell>
                <TableCell><TableCellViewer item={stock} /></TableCell>
                <TableCell>{stock.name}</TableCell>
                <TableCell className="text-right font-mono">{stock.closingPrice}</TableCell>
                <TableCell className={`text-right font-mono ${getChangeColor(stock.change)}`}>{stock.change}</TableCell>
                <TableCell className="text-right font-mono">{stock.openingPrice}</TableCell>
                <TableCell className="text-right font-mono">{stock.highestPrice}</TableCell>
                <TableCell className="text-right font-mono">{stock.lowestPrice}</TableCell>
                <TableCell className="text-right font-mono">{stock.tradeVolume}</TableCell>
                <TableCell className="text-right font-mono">{stock.tradeValue}</TableCell>
                <TableCell className="text-right font-mono">{stock.transaction}</TableCell>
                <TableCell>
                  <WatchlistGroupSelect
                    currentGroup={groupName}
                    watchlistItem={wItem}
                    dispatch={dispatch}
                    userId={userId}
                    allGroupNames={allGroupNames}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

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
  watchlist,
  userId,
}: {
  data: StockDailyDto[]
  title?: string
  watchlist: WatchlistItem[]
  userId: string
}) {
  const dispatch = useAppDispatch()

  // 加上 _rowId 供拖曳排序使用
  const [data, setData] = React.useState<StockRow[]>(() =>
    initialData.map((d, i) => ({ ...d, _rowId: i }))
  )

  // 當外部資料變更時同步
  React.useEffect(() => {
    setData(initialData.map((d, i) => ({ ...d, _rowId: i })))
  }, [initialData])

  const [activeTab, setActiveTab] = React.useState<"all" | "watchlist" | "summary">("all")
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

  const watchlistCodes = React.useMemo(
    () => new Set(watchlist.map((w) => w.stockNo)),
    [watchlist]
  )

  const groupedDisplayData = React.useMemo(() => {
    const groups: Record<string, GroupedItem[]> = {}
    const keyword = (globalFilter ?? "").trim().toLowerCase()
    for (const wItem of watchlist) {
      const group = wItem.groupName || "未分類"
      const stock = data.find((s) => s.code === wItem.stockNo)
      if (!stock) continue
      if (keyword && !stock.code.toLowerCase().includes(keyword) && !stock.name.toLowerCase().includes(keyword)) continue
      if (!groups[group]) groups[group] = []
      groups[group].push({ stock, wItem })
    }
    return groups
  }, [watchlist, data, globalFilter])

  const displayData = React.useMemo(() => {
    if (activeTab === "watchlist") {
      return data.filter((s) => watchlistCodes.has(s.code))
    }
    return data
  }, [data, activeTab, watchlistCodes])

  const allColumns = React.useMemo<ColumnDef<StockRow>[]>(
    () => [
      {
        id: "watchlist",
        header: () => null,
        cell: ({ row }) => (
          <WatchlistButton
            item={row.original}
            watchlist={watchlist}
            dispatch={dispatch}
            userId={userId}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ],
    [dispatch, watchlist, userId]
  )

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => displayData?.map(({ _rowId }) => _rowId) || [],
    [displayData]
  )

  const table = useReactTable({
    data: displayData,
    columns: allColumns,
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
        const oldIndex = prev.findIndex((item) => item._rowId === active.id)
        const newIndex = prev.findIndex((item) => item._rowId === over.id)
        if (oldIndex === -1 || newIndex === -1) return prev
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => {
        setActiveTab(v as "all" | "watchlist" | "summary")
        table.setPageIndex(0)
      }}
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          檢視
        </Label>
        <Select
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as "all" | "watchlist" | "summary")
            table.setPageIndex(0)
          }}
        >
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="選擇檢視" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="watchlist">我的最愛</SelectItem>
            <SelectItem value="summary">統計摘要</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="watchlist">
            <IconHeartFilled className="size-3.5 text-red-500" />
            我的最愛
            {watchlist.length > 0 && (
              <Badge variant="secondary">{watchlist.length}</Badge>
            )}
          </TabsTrigger>
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
        value="all"
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
                      colSpan={allColumns.length}
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
        value="watchlist"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <IconHeart className="size-10" />
            <p className="text-sm">還沒有加入任何自選股</p>
            <p className="text-xs">點擊表格中的 ♡ 來新增</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.keys(groupedDisplayData).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">找不到符合的自選股</p>
              </div>
            ) : (
              Object.entries(groupedDisplayData).map(([groupName, items]) => (
                <WatchlistGroupSection
                  key={groupName}
                  groupName={groupName}
                  items={items}
                  dispatch={dispatch}
                  userId={userId}
                  allGroupNames={Object.keys(groupedDisplayData)}
                />
              ))
            )}
          </div>
        )}
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
