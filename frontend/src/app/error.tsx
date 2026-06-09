"use client";

import { useEffect } from "react";
import { Button } from "@/components/commons/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
      <span className="text-6xl">⚠️</span>
      <h2 className="text-2xl font-semibold">發生預期外的錯誤</h2>
      <p className="text-muted-foreground text-sm max-w-md">
        {error.message || "請稍後再試，若問題持續發生請聯絡管理員。"}
      </p>
      <Button onClick={reset} variant="outline">
        重新載入
      </Button>
    </div>
  );
}
