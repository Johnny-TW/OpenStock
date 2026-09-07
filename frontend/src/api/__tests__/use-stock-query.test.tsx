import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { stockKeys } from "@/api/query-keys";
import {
  useHeatmap,
  useRankingRevenue,
  useStockDailyByCodes,
  useStockDailyPaged,
  useStockDetail,
  useStockValuation,
} from "@/api/use-stock-query";
import type { StockDailyQuery } from "@/types/stock";

vi.mock("@/lib/api-client", () => ({
  fetchAPI: vi.fn(),
}));

const { fetchAPI } = await import("@/lib/api-client");

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

beforeEach(() => {
  vi.mocked(fetchAPI).mockResolvedValue([]);
});

describe("useStockValuation", () => {
  it("使用 stockKeys.valuation 並打對端點", async () => {
    const { client, wrapper } = createWrapper();
    const { result } = renderHook(() => useStockValuation(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchAPI).toHaveBeenCalledWith("stock/valuation");
    expect(client.getQueryData(stockKeys.valuation())).toEqual([]);
  });
});

describe("useStockDailyPaged", () => {
  it("空字串的 search 與 all 產業不會送進 query params", async () => {
    const query: StockDailyQuery = {
      page: 1,
      pageSize: 20,
      search: "",
      industry: "all",
    };
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useStockDailyPaged(query), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchAPI).toHaveBeenCalledWith("stock/daily-all/paged", {
      page: 1,
      pageSize: 20,
      search: undefined,
      industry: undefined,
      sortBy: undefined,
      sortDir: undefined,
    });
  });

  it("沒有 sortBy 時不送 sortDir", async () => {
    const query: StockDailyQuery = {
      page: 2,
      pageSize: 50,
      industry: "半導體業",
      sortDir: "desc",
    };
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useStockDailyPaged(query), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchAPI).toHaveBeenCalledWith(
      "stock/daily-all/paged",
      expect.objectContaining({ industry: "半導體業", sortBy: undefined, sortDir: undefined }),
    );
  });

  it("有 sortBy 時才帶 sortDir", async () => {
    const query: StockDailyQuery = {
      page: 1,
      pageSize: 20,
      sortBy: "closingPrice",
      sortDir: "asc",
    };
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useStockDailyPaged(query), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchAPI).toHaveBeenCalledWith(
      "stock/daily-all/paged",
      expect.objectContaining({ sortBy: "closingPrice", sortDir: "asc" }),
    );
  });
});

describe("useStockDailyByCodes", () => {
  it("codes 為空時不發送請求", () => {
    const { wrapper } = createWrapper();
    renderHook(() => useStockDailyByCodes([]), { wrapper });

    expect(fetchAPI).not.toHaveBeenCalled();
  });

  it("codes 會以逗號串接送出", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useStockDailyByCodes(["2330", "2317"]), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchAPI).toHaveBeenCalledWith("stock/daily-all/by-codes", { codes: "2330,2317" });
  });
});

describe("useStockDetail", () => {
  it("symbol 為空時不發送請求", () => {
    const { wrapper } = createWrapper();
    renderHook(() => useStockDetail(""), { wrapper });

    expect(fetchAPI).not.toHaveBeenCalled();
  });

  it("symbol 有值時帶入 query params", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useStockDetail("2330"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchAPI).toHaveBeenCalledWith("stock/detail", { symbol: "2330" });
  });
});

describe("其他查詢", () => {
  it("useHeatmap 帶入 period", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useHeatmap("1w"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchAPI).toHaveBeenCalledWith("stock/heatmap", { period: "1w" });
  });

  it("useRankingRevenue 對應 ranking key 與端點", async () => {
    const { client, wrapper } = createWrapper();
    const { result } = renderHook(() => useRankingRevenue(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchAPI).toHaveBeenCalledWith("stock/ranking/revenue");
    expect(client.getQueryData(stockKeys.ranking("revenue"))).toEqual([]);
  });
});
