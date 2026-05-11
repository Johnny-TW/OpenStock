import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchAPI, postAPI } from "@/lib/api-client";

export function useCachedAnalysis() {
  return useQuery({
    queryKey: ["analysis", "market"],
    queryFn: () => fetchAPI<unknown>("analysis/market"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAnalyzeMarket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { stockCodes?: string[] }) => postAPI<unknown>("analysis/market", data),
    onSuccess: (data) => {
      queryClient.setQueryData(["analysis", "market"], data);
      toast.success("AI 分析完成");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "AI 分析失敗";
      toast.error(msg);
    },
  });
}
