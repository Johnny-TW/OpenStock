"use client";

import {
  IconArrowDown,
  IconArrowsUpDown,
  IconArrowUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconHeart,
  IconHeartFilled,
  IconLayoutColumns,
  IconX,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Badge } from "@/components/commons/badge";
import { Button } from "@/components/commons/button";
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
import type { StockDailyDto, StockDailySortField, WatchlistItem } from "@/type/stock";

function getChangeColor(change: string): string {
  if (change.startsWith("+")) return "text-red-500";
  if (change.startsWith("-")) return "text-green-500";
  return "text-muted-foreground";
}

function getChangePercentValue(row: StockDailyDto): number {
  const closing = parseNumber(row.closingPrice);
  const change = parseNumber(row.change);
  const prev = closing - change;
  if (prev === 0) return 0;
  return (change / prev) * 100;
}

function getChangePercent(row: StockDailyDto): string {
  const pct = getChangePercentValue(row);
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

const WatchlistButton = React.memo(function WatchlistButton({
  item,
  watchlistItem,
  allGroupNames,
  onAdd,
  onRemove,
  userId,
}: {
  item: StockDailyDto;
  watchlistItem: WatchlistItem | undefined;
  allGroupNames: string[];
  onAdd: (data: { userId: string; stockNo: string; stockName: string; groupName: string }) => void;
  onRemove: (params: { id: number; userId: string }) => void;
  userId: string;
}) {
  const isInWatchlist = !!watchlistItem;
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState("未分類");
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState("");

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isInWatchlist && watchlistItem) {
      // 已在自選股，點擊則移除
      onRemove({ id: watchlistItem.id, userId });
    } else {
      // 不在自選股，點擊則開啟加入對話框
      const defaultGroup = allGroupNames[0] ?? "未分類";
      setSelectedGroup(defaultGroup);
      setIsCreatingNew(false);
      setNewGroupName("");
      setDialogOpen(true);
    }
  }

  // 確認加入自選股，呼叫 onAdd 並關閉對話框
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
    onUpdateGroup({ id: watchlistItem.id, groupName: value, userId });
  }

  function handleNewGroupSubmit() {
    const name = newName.trim();
    if (!name) return;
    onUpdateGroup({ id: watchlistItem.id, groupName: name, userId });
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

type GroupedItem = { stock: StockDailyDto; wItem: WatchlistItem };

type ColumnDef = {
  key: StockDailySortField;
  label: string;
  align: "left" | "right";
  color?: boolean;
};

const ALL_COLUMNS: ColumnDef[] = [
  { key: "code", label: "證券代號", align: "left" },
  { key: "name", label: "證券名稱", align: "left" },
  { key: "closingPrice", label: "收盤價", align: "right" },
  { key: "change", label: "漲跌價差", align: "right", color: true },
  { key: "changePercent", label: "漲跌幅", align: "right", color: true },
  { key: "openingPrice", label: "開盤價", align: "right" },
  { key: "highestPrice", label: "最高價", align: "right" },
  { key: "lowestPrice", label: "最低價", align: "right" },
  { key: "tradeVolume", label: "成交股數", align: "right" },
  { key: "tradeValue", label: "成交金額", align: "right" },
  { key: "transaction", label: "成交筆數", align: "right" },
];

const TOGGLEABLE_COLUMNS = ALL_COLUMNS.filter((col) => col.key !== "code" && col.key !== "name");

function StockCell({ stock, col }: { stock: StockDailyDto; col: ColumnDef }) {
  if (col.key === "code") {
    return (
      <Link href={`/stock/${stock.code}`} className="font-mono hover:text-primary hover:underline">
        {stock.code}
      </Link>
    );
  }
  if (col.key === "name") return <>{stock.name}</>;
  if (col.key === "changePercent") {
    return (
      <span className={`font-mono ${getChangeColor(stock.change)}`}>{getChangePercent(stock)}</span>
    );
  }
  if (col.color) {
    return <span className={`font-mono ${getChangeColor(stock.change)}`}>{stock[col.key]}</span>;
  }
  return <span className="font-mono">{stock[col.key]}</span>;
}

const StockRow = React.memo(function StockRow({
  stock,
  visibleColumns,
  watchlistItem,
  watchlistGroupNames,
  onAdd,
  onRemove,
  onRowClick,
  userId,
}: {
  stock: StockDailyDto;
  visibleColumns: ColumnDef[];
  watchlistItem: WatchlistItem | undefined;
  watchlistGroupNames: string[];
  onAdd: (data: { userId: string; stockNo: string; stockName: string; groupName: string }) => void;
  onRemove: (params: { id: number; userId: string }) => void;
  onRowClick: (e: React.MouseEvent, code: string) => void;
  userId: string;
}) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={(e) => onRowClick(e, stock.code)}
    >
      <TableCell>
        <WatchlistButton
          item={stock}
          watchlistItem={watchlistItem}
          allGroupNames={watchlistGroupNames}
          onAdd={onAdd}
          onRemove={onRemove}
          userId={userId}
        />
      </TableCell>
      {visibleColumns.map((col) => (
        <TableCell key={col.key} className={col.align === "right" ? "text-right" : ""}>
          <StockCell stock={stock} col={col} />
        </TableCell>
      ))}
    </TableRow>
  );
});

function SortHeader({
  col,
  sortBy,
  sortDir,
  onSort,
}: {
  col: ColumnDef;
  sortBy: StockDailySortField | null;
  sortDir: "asc" | "desc";
  onSort: (key: StockDailySortField) => void;
}) {
  const isActive = sortBy === col.key;
  return (
    <TableHead className={col.align === "right" ? "text-right" : ""}>
      <button
        className={`flex items-center gap-1 hover:text-foreground cursor-pointer select-none ${
          col.align === "right" ? "ml-auto" : ""
        }`}
        onClick={() => onSort(col.key)}
      >
        {col.label}
        {isActive ? (
          sortDir === "asc" ? (
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

function WatchlistGroupSection({
  groupName,
  items,
  onRemove,
  onUpdateGroup,
  userId,
  allGroupNames,
  visibleColumns,
}: {
  groupName: string;
  items: GroupedItem[];
  onRemove: (params: { id: number; userId: string }) => void;
  onUpdateGroup: (params: { id: number; userId: string; groupName: string }) => void;
  userId: string;
  allGroupNames: string[];
  visibleColumns: ColumnDef[];
}) {
  const [sortKey, setSortKey] = React.useState<StockDailySortField | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  function handleSort(key: StockDailySortField) {
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
      let cmp: number;
      if (sortKey === "changePercent") {
        cmp = getChangePercentValue(a.stock) - getChangePercentValue(b.stock);
      } else if (sortKey === "code" || sortKey === "name") {
        cmp = a.stock[sortKey].localeCompare(b.stock[sortKey]);
      } else {
        cmp = parseNumber(a.stock[sortKey]) - parseNumber(b.stock[sortKey]);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

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
                <SortHeader
                  key={col.key}
                  col={col}
                  sortBy={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
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
                  <TableCell key={col.key} className={col.align === "right" ? "text-right" : ""}>
                    <StockCell stock={stock} col={col} />
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

export function StockDataTable({
  data,
  total,
  page,
  pageSize,
  totalPages,
  industries,
  searchInput,
  onSearchChange,
  industry,
  onIndustryChange,
  sortBy,
  sortDir,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  isFetching,
  watchlist,
  watchlistStocks,
  userId,
}: {
  data: StockDailyDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  industries: string[];
  searchInput: string;
  onSearchChange: (value: string) => void;
  industry: string;
  onIndustryChange: (value: string) => void;
  sortBy: StockDailySortField | null;
  sortDir: "asc" | "desc";
  onSortChange: (key: StockDailySortField) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isFetching: boolean;
  watchlist: WatchlistItem[];
  watchlistStocks: StockDailyDto[];
  userId: string;
}) {
  const router = useRouter();
  const addWatchlist = useAddWatchlist();
  const removeWatchlist = useRemoveWatchlist();
  const updateWatchlistGroup = useUpdateWatchlistGroup();

  const handleAdd = React.useCallback(
    (d: { userId: string; stockNo: string; stockName: string; groupName: string }) => {
      addWatchlist.mutate(d);
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

  const [activeTab, setActiveTab] = React.useState<"all" | "watchlist" | "summary">("all");
  const [activeGroup, setActiveGroup] = React.useState<string>("__all__");
  const [hiddenCols, setHiddenCols] = React.useState<Set<StockDailySortField>>(new Set());

  const visibleColumns = React.useMemo(
    () => ALL_COLUMNS.filter((col) => !hiddenCols.has(col.key)),
    [hiddenCols],
  );

  function toggleColumn(key: StockDailySortField, visible: boolean) {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (visible) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const watchlistStockMap = React.useMemo(
    () => new Map(watchlistStocks.map((s) => [s.code, s])),
    [watchlistStocks],
  );

  const watchlistItemMap = React.useMemo(
    () => new Map(watchlist.map((w) => [w.stockNo, w])),
    [watchlist],
  );

  const watchlistGroupNames = React.useMemo(() => {
    const groups = new Set<string>(watchlist.map((w) => w.groupName || "未分類"));
    groups.add("未分類");
    return Array.from(groups);
  }, [watchlist]);

  const groupedDisplayData = React.useMemo(() => {
    const groups: Record<string, GroupedItem[]> = {};
    const keyword = (searchInput ?? "").trim().toLowerCase();
    for (const wItem of watchlist) {
      const group = wItem.groupName || "未分類";
      const stock = watchlistStockMap.get(wItem.stockNo);
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
  }, [watchlist, watchlistStockMap, searchInput]);

  const handleRowClick = React.useCallback(
    (e: React.MouseEvent, code: string) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a")) return;
      router.push(`/stock/${code}`);
    },
    [router],
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as "all" | "watchlist" | "summary")}
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          檢視
        </Label>
        <Select value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
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
            統計摘要 <Badge variant="secondary">{total}</Badge>
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          {isFetching && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          <Select value={industry} onValueChange={onIndustryChange}>
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
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
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
              {TOGGLEABLE_COLUMNS.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.key}
                  checked={!hiddenCols.has(col.key)}
                  onCheckedChange={(value) => toggleColumn(col.key, !!value)}
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TabsContent value="all" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-10"></TableHead>
                {visibleColumns.map((col) => (
                  <SortHeader
                    key={col.key}
                    col={col}
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onSort={onSortChange}
                  />
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length ? (
                data.map((stock) => (
                  <StockRow
                    key={stock.code}
                    stock={stock}
                    visibleColumns={visibleColumns}
                    watchlistItem={watchlistItemMap.get(stock.code)}
                    watchlistGroupNames={watchlistGroupNames}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onRowClick={handleRowClick}
                    userId={userId}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 1} className="h-24 text-center">
                    無資料
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">共 {total} 筆</div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                每頁筆數
              </Label>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[20, 50, 100].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              第 {page} / {totalPages} 頁
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange(1)}
                disabled={page <= 1 || isFetching}
              >
                <span className="sr-only">第一頁</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || isFetching}
              >
                <span className="sr-only">上一頁</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || isFetching}
              >
                <span className="sr-only">下一頁</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => onPageChange(totalPages)}
                disabled={page >= totalPages || isFetching}
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
                    visibleColumns={visibleColumns}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="summary" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
          統計摘要 — 共 {total} 檔證券
        </div>
      </TabsContent>
    </Tabs>
  );
}
