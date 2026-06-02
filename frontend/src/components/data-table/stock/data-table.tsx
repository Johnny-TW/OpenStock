"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconArrowDown,
  IconArrowsUpDown,
  IconArrowUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconGripVertical,
  IconHeart,
  IconHeartFilled,
  IconLayoutColumns,
  IconX,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import { Badge } from "@/components/commons/badge";
import { Button } from "@/components/commons/button";
import { Checkbox } from "@/components/commons/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/commons/dialog";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/commons/dropdown-menu";
import { Input } from "@/components/commons/input";
import { Label } from "@/components/commons/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/commons/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/commons/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/commons/tabs";
import { parseNumber } from "@/components/data-table/shared";
import {
  useAddWatchlist,
  useRemoveWatchlist,
  useUpdateWatchlistGroup,
} from "@/hooks/use-watchlist-query";
import type { StockDailyDto, WatchlistItem } from "@/type/stock";

function getChangeColor(change: string): string {
  if (change.startsWith("+")) return "text-red-500";
  if (change.startsWith("-")) return "text-green-500";
  return "text-muted-foreground";
}

function getChangePercent(row: StockDailyDto): string {
  const closing = parseNumber(row.closingPrice);
  const change = parseNumber(row.change);
  const prev = closing - change;
  if (prev === 0) return "0.00%";
  const pct = (change / prev) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export type StockRow = StockDailyDto & { _rowId: number };

const WatchlistButton = React.memo(function WatchlistButton({
  item,
  watchlist,
  onAdd,
  onRemove,
  userId,
}: {
  item: StockRow;
  watchlist: WatchlistItem[];
  onAdd: (data: { userId: string; stockNo: string; stockName: string; groupName: string }) => void;
  onRemove: (params: { id: number; userId: string }) => void;
  userId: string;
}) {
  const watchlistItem = watchlist.find((w) => w.stockNo === item.code);
  const isInWatchlist = !!watchlistItem;
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState("未分類");
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState("");

  const allGroupNames = React.useMemo(() => {
    const groups = new Set<string>(watchlist.map((w) => w.groupName || "未分類"));
    groups.add("未分類");
    return Array.from(groups);
  }, [watchlist]);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isInWatchlist && watchlistItem) {
      onRemove({ id: watchlistItem.id, userId });
    } else {
      const defaultGroup = allGroupNames[0] ?? "未分類";
      setSelectedGroup(defaultGroup);
      setIsCreatingNew(false);
      setNewGroupName("");
      setDialogOpen(true);
    }
  }

  function handleConfirm() {
    const groupName = isCreatingNew ? newGroupName.trim() || "未分類" : selectedGroup;
    onAdd({ userId, stockNo: item.code, stockName: item.name, groupName });
    setDialogOpen(false);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center justify-center size-7 rounded hover:bg-muted transition-colors ${
          isInWatchlist ? "text-red-500" : "text-muted-foreground hover:text-red-400"
        }`}
      >
        {isInWatchlist ? <IconHeartFilled className="size-4" /> : <IconHeart className="size-4" />}
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
                    setIsCreatingNew(true);
                    setNewGroupName("");
                  } else {
                    setSelectedGroup(v);
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
                <Button variant="ghost" size="icon" onClick={() => setIsCreatingNew(false)}>
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
  );
});

function WatchlistGroupSelect({
  currentGroup,
  watchlistItem,
  onUpdateGroup,
  userId,
  allGroupNames,
}: {
  currentGroup: string;
  watchlistItem: WatchlistItem;
  onUpdateGroup: (params: { id: number; userId: string; groupName: string }) => void;
  userId: string;
  allGroupNames: string[];
}) {
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [newName, setNewName] = React.useState("");

  function handleGroupChange(value: string) {
    if (value === "__new__") {
      setIsCreatingNew(true);
      setNewName("");
      return;
    }
    onUpdateGroup({
      id: watchlistItem.id,
      groupName: value,
      userId,
    });
  }

  function handleNewGroupSubmit() {
    const name = newName.trim();
    if (!name) return;
    onUpdateGroup({
      id: watchlistItem.id,
      groupName: name,
      userId,
    });
    setIsCreatingNew(false);
    setNewName("");
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
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-xs"
          onClick={handleNewGroupSubmit}
        >
          ✓
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => setIsCreatingNew(false)}
        >
          <IconX className="size-3" />
        </Button>
      </div>
    );
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
  );
}

type GroupedItem = { stock: StockRow; wItem: WatchlistItem };

type WatchlistSortKey =
  | "code"
  | "name"
  | "closingPrice"
  | "change"
  | "changePercent"
  | "openingPrice"
  | "highestPrice"
  | "lowestPrice"
  | "tradeVolume"
  | "tradeValue"
  | "transaction";

function SortableHead({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
  className = "",
}: {
  label: string;
  sortKey: WatchlistSortKey;
  currentKey: WatchlistSortKey | null;
  direction: "asc" | "desc";
  onSort: (key: WatchlistSortKey) => void;
  className?: string;
}) {
  const isActive = currentKey === sortKey;
  return (
    <TableHead className={className}>
      <button
        className="flex items-center gap-1 hover:text-foreground cursor-pointer select-none"
        onClick={() => onSort(sortKey)}
      >
        {label}
        {isActive ? (
          direction === "asc" ? (
            <IconArrowUp className="size-4" />
          ) : (
            <IconArrowDown className="size-4" />
          )
        ) : (
          <IconArrowsUpDown className="size-4 text-muted-foreground/50" />
        )}
      </button>
    </TableHead>
  );
}

const WATCHLIST_COLUMNS: { key: WatchlistSortKey; label: string; className?: string }[] = [
  { key: "code", label: "代號", className: "w-24" },
  { key: "name", label: "名稱" },
  { key: "closingPrice", label: "收盤價", className: "text-right" },
  { key: "change", label: "漲跌價差", className: "text-right" },
  { key: "changePercent", label: "漲跌幅", className: "text-right" },
  { key: "openingPrice", label: "開盤價", className: "text-right" },
  { key: "highestPrice", label: "最高價", className: "text-right" },
  { key: "lowestPrice", label: "最低價", className: "text-right" },
  { key: "tradeVolume", label: "成交股數", className: "text-right" },
  { key: "tradeValue", label: "成交金額", className: "text-right" },
  { key: "transaction", label: "成交筆數", className: "text-right" },
];

function WatchlistGroupSection({
  groupName,
  items,
  onRemove,
  onUpdateGroup,
  userId,
  allGroupNames,
  columnVisibility,
}: {
  groupName: string;
  items: GroupedItem[];
  onRemove: (params: { id: number; userId: string }) => void;
  onUpdateGroup: (params: { id: number; userId: string; groupName: string }) => void;
  userId: string;
  allGroupNames: string[];
  columnVisibility: VisibilityState;
}) {
  const [sortKey, setSortKey] = React.useState<WatchlistSortKey | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  function handleSort(key: WatchlistSortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedItems = React.useMemo(() => {
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      if (sortKey === "changePercent") {
        const closingA = parseNumber(a.stock.closingPrice);
        const changeA = parseNumber(a.stock.change);
        const prevA = closingA - changeA;
        const pctA = prevA === 0 ? 0 : (changeA / prevA) * 100;

        const closingB = parseNumber(b.stock.closingPrice);
        const changeB = parseNumber(b.stock.change);
        const prevB = closingB - changeB;
        const pctB = prevB === 0 ? 0 : (changeB / prevB) * 100;

        return sortDir === "asc" ? pctA - pctB : pctB - pctA;
      }
      const valA = a.stock[sortKey];
      const valB = b.stock[sortKey];
      const numA = parseNumber(valA);
      const numB = parseNumber(valB);
      const isNum = numA !== 0 || numB !== 0 || valA === "0" || valB === "0";
      const cmp = isNum ? numA - numB : String(valA).localeCompare(String(valB));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

  const headProps = { currentKey: sortKey, direction: sortDir, onSort: handleSort };

  const visibleColumns = React.useMemo(
    () => WATCHLIST_COLUMNS.filter((col) => columnVisibility[col.key] !== false),
    [columnVisibility],
  );

  const renderCell = (stock: StockRow, key: WatchlistSortKey) => {
    switch (key) {
      case "code":
        return (
          <a href={`/stock/${stock.code}`} className="font-mono hover:text-primary hover:underline">
            {stock.code}
          </a>
        );
      case "name":
        return stock.name;
      case "change":
        return <span className={`font-mono ${getChangeColor(stock.change)}`}>{stock.change}</span>;
      case "changePercent":
        return (
          <span className={`font-mono ${getChangeColor(stock.change)}`}>
            {getChangePercent(stock)}
          </span>
        );
      default:
        return <span className="font-mono">{stock[key]}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <span className="font-semibold text-sm">{groupName}</span>
        <Badge variant="secondary" className="text-xs">
          {items.length}
        </Badge>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              {visibleColumns.map((col) => (
                <SortableHead
                  key={col.key}
                  label={col.label}
                  sortKey={col.key}
                  className={col.className ?? ""}
                  {...headProps}
                />
              ))}
              <TableHead className="w-44">群組</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map(({ stock, wItem }) => (
              <TableRow key={stock.code}>
                <TableCell>
                  <button
                    onClick={() => onRemove({ id: wItem.id, userId })}
                    className="flex items-center justify-center size-7 rounded hover:bg-muted transition-colors text-red-500 hover:text-red-600"
                  >
                    <IconHeartFilled className="size-4" />
                  </button>
                </TableCell>
                {visibleColumns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={col.key !== "code" && col.key !== "name" ? "text-right" : ""}
                  >
                    {renderCell(stock, col.key)}
                  </TableCell>
                ))}
                <TableCell>
                  <WatchlistGroupSelect
                    currentGroup={groupName}
                    watchlistItem={wItem}
                    onUpdateGroup={onUpdateGroup}
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
  );
}

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id });
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
  );
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
    cell: ({ row }) => (
      <a
        href={`/stock/${row.original.code}`}
        className="text-foreground w-fit px-0 text-left font-mono hover:text-primary hover:underline"
      >
        {row.original.code}
      </a>
    ),
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
    cell: ({ row }) => <div className="text-right font-mono">{row.original.closingPrice}</div>,
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.closingPrice) - parseNumber(rowB.original.closingPrice),
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
    id: "changePercent",
    header: "漲跌幅",
    accessorFn: (row) => {
      const closing = parseNumber(row.closingPrice);
      const change = parseNumber(row.change);
      const prev = closing - change;
      return prev === 0 ? 0 : (change / prev) * 100;
    },
    cell: ({ row }) => {
      const pct = getChangePercent(row.original);
      return (
        <div className={`text-right font-mono ${getChangeColor(row.original.change)}`}>{pct}</div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const pctA = (rowA.getValue("changePercent") as number) || 0;
      const pctB = (rowB.getValue("changePercent") as number) || 0;
      return pctA - pctB;
    },
    size: 100,
  },
  {
    accessorKey: "openingPrice",
    header: "開盤價",
    cell: ({ row }) => <div className="text-right font-mono">{row.original.openingPrice}</div>,
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.openingPrice) - parseNumber(rowB.original.openingPrice),
    size: 100,
  },
  {
    accessorKey: "highestPrice",
    header: "最高價",
    cell: ({ row }) => <div className="text-right font-mono">{row.original.highestPrice}</div>,
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.highestPrice) - parseNumber(rowB.original.highestPrice),
    size: 100,
  },
  {
    accessorKey: "lowestPrice",
    header: "最低價",
    cell: ({ row }) => <div className="text-right font-mono">{row.original.lowestPrice}</div>,
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.lowestPrice) - parseNumber(rowB.original.lowestPrice),
    size: 100,
  },
  {
    accessorKey: "tradeVolume",
    header: "成交股數",
    cell: ({ row }) => <div className="text-right font-mono">{row.original.tradeVolume}</div>,
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.tradeVolume) - parseNumber(rowB.original.tradeVolume),
    size: 130,
  },
  {
    accessorKey: "tradeValue",
    header: "成交金額",
    cell: ({ row }) => <div className="text-right font-mono">{row.original.tradeValue}</div>,
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.tradeValue) - parseNumber(rowB.original.tradeValue),
    size: 150,
  },
  {
    accessorKey: "transaction",
    header: "成交筆數",
    cell: ({ row }) => <div className="text-right font-mono">{row.original.transaction}</div>,
    sortingFn: (rowA, rowB) =>
      parseNumber(rowA.original.transaction) - parseNumber(rowB.original.transaction),
    size: 110,
  },
];

function DraggableRow({ row }: { row: Row<StockRow> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original._rowId,
  });
  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("a") ||
      target.closest("[role='checkbox']")
    )
      return;
    window.location.href = `/stock/${row.original.code}`;
  };
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 cursor-pointer hover:bg-muted/50 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
      onClick={handleRowClick}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function StockDataTable({
  data: initialData,
  title,
  watchlist,
  userId,
}: {
  data: StockDailyDto[];
  title?: string;
  watchlist: WatchlistItem[];
  userId: string;
}) {
  const addWatchlist = useAddWatchlist();
  const removeWatchlist = useRemoveWatchlist();
  const updateWatchlistGroup = useUpdateWatchlistGroup();

  const handleAdd = React.useCallback(
    (data: { userId: string; stockNo: string; stockName: string; groupName: string }) => {
      addWatchlist.mutate(data);
    },
    [addWatchlist],
  );

  const handleRemove = React.useCallback(
    (params: { id: number; userId: string }) => {
      removeWatchlist.mutate(params);
    },
    [removeWatchlist],
  );

  const handleUpdateGroup = React.useCallback(
    (params: { id: number; userId: string; groupName: string }) => {
      updateWatchlistGroup.mutate(params);
    },
    [updateWatchlistGroup],
  );

  // 加上 _rowId 供拖曳排序使用
  const [data, setData] = React.useState<StockRow[]>(() =>
    (initialData ?? []).map((d, i) => ({ ...d, _rowId: i })),
  );

  // 當外部資料變更時同步
  React.useEffect(() => {
    setData((initialData ?? []).map((d, i) => ({ ...d, _rowId: i })));
  }, [initialData]);

  const [activeTab, setActiveTab] = React.useState<"all" | "watchlist" | "summary">("all");
  const [activeGroup, setActiveGroup] = React.useState<string>("__all__");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedIndustry, setSelectedIndustry] = React.useState("all");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const industries = React.useMemo(() => {
    const set = new Set(data.map((s) => s.industry).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const watchlistCodes = React.useMemo(() => new Set(watchlist.map((w) => w.stockNo)), [watchlist]);

  const stockMap = React.useMemo(() => new Map(data.map((s) => [s.code, s])), [data]);

  const groupedDisplayData = React.useMemo(() => {
    const groups: Record<string, GroupedItem[]> = {};
    const keyword = (globalFilter ?? "").trim().toLowerCase();
    for (const wItem of watchlist) {
      const group = wItem.groupName || "未分類";
      const stock = stockMap.get(wItem.stockNo);
      if (!stock) continue;
      if (
        keyword &&
        !stock.code.toLowerCase().includes(keyword) &&
        !stock.name.toLowerCase().includes(keyword)
      )
        continue;
      if (!groups[group]) groups[group] = [];
      groups[group].push({ stock, wItem });
    }
    return groups;
  }, [watchlist, stockMap, globalFilter]);

  const displayData = React.useMemo(() => {
    let list = data;
    if (activeTab === "watchlist") {
      list = list.filter((s) => watchlistCodes.has(s.code));
    }
    if (selectedIndustry !== "all") {
      list = list.filter((s) => s.industry === selectedIndustry);
    }
    return list;
  }, [data, activeTab, watchlistCodes, selectedIndustry]);

  const allColumns = React.useMemo<ColumnDef<StockRow>[]>(
    () => [
      {
        id: "watchlist",
        header: () => null,
        cell: ({ row }) => (
          <WatchlistButton
            item={row.original}
            watchlist={watchlist}
            onAdd={handleAdd}
            onRemove={handleRemove}
            userId={userId}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ],
    [watchlist, userId, handleAdd, handleRemove],
  );

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => displayData?.map(({ _rowId }) => _rowId) || [],
    [displayData],
  );

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
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = prev.findIndex((item) => item._rowId === active.id);
        const newIndex = prev.findIndex((item) => item._rowId === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => {
        setActiveTab(v as "all" | "watchlist" | "summary");
        table.setPageIndex(0);
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
            setActiveTab(v as "all" | "watchlist" | "summary");
            table.setPageIndex(0);
          }}
        >
          <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
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
            {watchlist.length > 0 && <Badge variant="secondary">{watchlist.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="summary">
            統計摘要 <Badge variant="secondary">{data.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Select
            value={selectedIndustry}
            onValueChange={(v) => {
              setSelectedIndustry(v);
              table.setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="全部產業" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部產業</SelectItem>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TabsContent value="all" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
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
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <IconArrowUp className="size-4" />,
                              desc: <IconArrowDown className="size-4" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <IconArrowsUpDown className="size-4 text-muted-foreground/50" />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={allColumns.length} className="h-24 text-center">
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
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
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
              第 {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 頁
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
              <>
                <div className="flex items-center gap-1 overflow-x-auto border-b pb-0">
                  <button
                    className={`px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors whitespace-nowrap border-b-2 ${activeGroup === "__all__" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    onClick={() => setActiveGroup("__all__")}
                  >
                    全部群組
                    <span className="ml-1.5 text-xs opacity-70">({watchlist.length})</span>
                  </button>
                  {Object.entries(groupedDisplayData).map(([groupName, items]) => (
                    <button
                      key={groupName}
                      className={`px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors whitespace-nowrap border-b-2 ${activeGroup === groupName ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                      onClick={() => setActiveGroup(groupName)}
                    >
                      {groupName}
                      <span className="ml-1.5 text-xs opacity-70">({items.length})</span>
                    </button>
                  ))}
                </div>
                {(activeGroup === "__all__"
                  ? Object.entries(groupedDisplayData)
                  : Object.entries(groupedDisplayData).filter(([name]) => name === activeGroup)
                ).map(([groupName, items]) => (
                  <WatchlistGroupSection
                    key={groupName}
                    groupName={groupName}
                    items={items}
                    onRemove={handleRemove}
                    onUpdateGroup={handleUpdateGroup}
                    userId={userId}
                    allGroupNames={Object.keys(groupedDisplayData)}
                    columnVisibility={columnVisibility}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="summary" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
          統計摘要 — 共 {data.length} 檔證券
        </div>
      </TabsContent>
    </Tabs>
  );
}
