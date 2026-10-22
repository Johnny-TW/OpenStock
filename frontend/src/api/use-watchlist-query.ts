import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { watchlistKeys } from "@/api/query-keys";
import { deleteAPI, fetchAPI, patchAPI, postAPI } from "@/lib/api-client";
import type { WatchlistItem } from "@/types/stock";

export function useWatchlist(enabled = true) {
  return useQuery({
    queryKey: watchlistKeys.list(),
    queryFn: () => fetchAPI<WatchlistItem[]>("watchlist"),
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useAddWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { stockNo: string; stockName: string; groupName: string }) =>
      postAPI<WatchlistItem>("watchlist", data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
      toast.success(`已加入自選股：${variables.stockName}`);
    },
  });
}

export function useRemoveWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: number }) => deleteAPI<unknown>(`watchlist/${params.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
      toast.success("已移除自選股");
    },
  });
}

export function useUpdateWatchlistGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: number; groupName: string }) =>
      patchAPI<unknown>(`watchlist/${params.id}/group`, { groupName: params.groupName }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
      toast.success(`已移至「${variables.groupName}」`);
    },
  });
}
