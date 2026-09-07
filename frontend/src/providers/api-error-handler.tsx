"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-error";

function isFatal(error: unknown): error is ApiError {
  return error instanceof ApiError && error.isServerError;
}

export default function ApiErrorHandler({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [fatalError, setFatalError] = useState<ApiError | null>(null);

  useEffect(() => {
    const handle = (error: unknown) => {
      if (isFatal(error)) setFatalError(error);
    };

    const unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error") handle(event.action.error);
    });

    const unsubscribeMutation = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error") handle(event.action.error);
    });

    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, [queryClient]);

  const handleRetry = useCallback(() => {
    setFatalError(null);
    queryClient.refetchQueries({ type: "active" });
  }, [queryClient]);

  return (
    <>
      {children}
      {fatalError && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-4 bg-background/95 px-6 text-center backdrop-blur-sm">
          <span className="text-6xl">🛠️</span>
          <h2 className="text-2xl font-semibold">伺服器暫時無法回應</h2>
          <p className="max-w-md text-sm text-muted-foreground">{fatalError.message}</p>
          <p className="text-xs text-muted-foreground">錯誤代碼：{fatalError.status}</p>
          <div className="flex gap-2">
            <Button onClick={handleRetry}>重新載入資料</Button>
            <Button variant="outline" onClick={() => setFatalError(null)}>
              繼續瀏覽
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
