import type { StockDailyAllResponse } from "@/type/stock";

const API_HOST = (process.env.NEXT_PUBLIC_API_HOST ?? "").replace(/\/+$/, "");

export async function fetchStockDailyAll(): Promise<StockDailyAllResponse> {
  const res = await fetch(`${API_HOST}/stock/daily-all`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch stock data: ${res.status}`);
  }

  return res.json();
}
