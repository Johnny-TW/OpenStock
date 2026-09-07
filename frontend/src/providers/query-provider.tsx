"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError, isAbortError, resolveErrorMessage } from "@/lib/api-error";
import ApiErrorHandler from "@/providers/api-error-handler";

export function shouldSilence(error: unknown) {
  if (isAbortError(error)) return true;
  return error instanceof ApiError && error.isServerError;
}

export function shouldRetry(failureCount: number, error: unknown) {
  if (isAbortError(error)) return false;
  if (error instanceof ApiError && error.isClientError) return false;
  return failureCount < 1;
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (shouldSilence(error)) return;
        toast.error("資料載入失敗", {
          description: resolveErrorMessage(error, "請稍後再試"),
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (shouldSilence(error)) return;
        toast.error("操作失敗", {
          description: resolveErrorMessage(error, "請稍後再試"),
        });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiErrorHandler>{children}</ApiErrorHandler>
    </QueryClientProvider>
  );
}
