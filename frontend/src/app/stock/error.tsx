"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/commons/button";

export default function StockError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-center">
      <h2 className="text-xl font-semibold">資料載入失敗</h2>
      <p className="text-muted-foreground text-sm">
        {error.message || "無法取得股市資料，請稍後再試。"}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline" size="sm">
          重試
        </Button>
        <Button onClick={() => router.push("/stock")} size="sm">
          回到總覽
        </Button>
      </div>
    </div>
  );
}
