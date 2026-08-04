import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteAPI, fetchAPI, patchAPI, postAPI } from "@/lib/api-client";
import type { WatchlistItem } from "@/type/stock";

export function useWatchlist(enabled = true) {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: () => fetchAPI<WatchlistItem[]>("watchlist"),
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useAddWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; stockNo: string; stockName: string; groupName: string }) =>
      postAPI<WatchlistItem>("watchlist", data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(`已加入自選股：${variables.stockName}`);
    },
    onError: () => {
      toast.error("加入自選股失敗");
    },
  });
}

export function useRemoveWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: number; userId: string }) =>
      deleteAPI<unknown>(`watchlist/${params.id}`, { userId: params.userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("已移除自選股");
    },
    onError: () => {
      toast.error("移除自選股失敗");
    },
  });
}

export function useUpdateWatchlistGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: number; userId: string; groupName: string }) =>
      patchAPI<unknown>(`watchlist/${params.id}/group`, {
        userId: params.userId,
        groupName: params.groupName,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(`已移至「${variables.groupName}」`);
    },
    onError: () => {
      toast.error("更新群組失敗");
    },
  });
}
