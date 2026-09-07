import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { watchlistKeys } from "@/api/query-keys";
import {
  useAddWatchlist,
  useRemoveWatchlist,
  useUpdateWatchlistGroup,
  useWatchlist,
} from "@/api/use-watchlist-query";

vi.mock("@/lib/api-client", () => ({
  fetchAPI: vi.fn(),
  postAPI: vi.fn(),
  patchAPI: vi.fn(),
  deleteAPI: vi.fn(),
}));

const { fetchAPI, postAPI, patchAPI, deleteAPI } = await import("@/lib/api-client");

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

const item = { id: 1, stockNo: "2330", stockName: "台積電", groupName: "科技" };

beforeEach(() => {
  vi.mocked(fetchAPI).mockResolvedValue([item]);
  vi.mocked(postAPI).mockResolvedValue(item);
  vi.mocked(patchAPI).mockResolvedValue(undefined);
  vi.mocked(deleteAPI).mockResolvedValue(undefined);
});

describe("useWatchlist", () => {
  it("以 watchlistKeys 取得自選股清單", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useWatchlist(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchAPI).toHaveBeenCalledWith("watchlist");
    expect(result.current.data).toEqual([item]);
  });

  it("enabled 為 false 時不發送請求", () => {
    const { wrapper } = createWrapper();
    renderHook(() => useWatchlist(false), { wrapper });

    expect(fetchAPI).not.toHaveBeenCalled();
  });
});

describe("useAddWatchlist", () => {
  it("成功後失效 watchlist 快取並提示股票名稱", async () => {
    const { client, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useAddWatchlist(), { wrapper });

    result.current.mutate({
      userId: "u1",
      stockNo: "2330",
      stockName: "台積電",
      groupName: "科技",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(postAPI).toHaveBeenCalledWith("watchlist", {
      userId: "u1",
      stockNo: "2330",
      stockName: "台積電",
      groupName: "科技",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: watchlistKeys.all });
    expect(toast.success).toHaveBeenCalledWith("已加入自選股：台積電");
  });

  it("失敗時不再自行跳 toast，交由全域 mutationCache 處理", async () => {
    vi.mocked(postAPI).mockRejectedValue(new Error("失敗"));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useAddWatchlist(), { wrapper });

    result.current.mutate({
      userId: "u1",
      stockNo: "2330",
      stockName: "台積電",
      groupName: "科技",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe("useRemoveWatchlist", () => {
  it("以 id 呼叫 delete 並帶 userId", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRemoveWatchlist(), { wrapper });

    result.current.mutate({ id: 7, userId: "u1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(deleteAPI).toHaveBeenCalledWith("watchlist/7", { userId: "u1" });
    expect(toast.success).toHaveBeenCalledWith("已移除自選股");
  });
});

describe("useUpdateWatchlistGroup", () => {
  it("更新群組後提示新的群組名稱", async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateWatchlistGroup(), { wrapper });

    result.current.mutate({ id: 7, userId: "u1", groupName: "金融" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(patchAPI).toHaveBeenCalledWith("watchlist/7/group", {
      userId: "u1",
      groupName: "金融",
    });
    expect(toast.success).toHaveBeenCalledWith("已移至「金融」");
  });
});
