import type { Metadata } from "next";
import StockDetailClient from "./stock-detail-client";

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  return {
    title: upperSymbol,
    description: `${upperSymbol} 股票詳細資訊、技術分析與 AI 解讀`,
  };
}

export default async function StockDetailPage({ params }: PageProps) {
  const { symbol } = await params;
  return <StockDetailClient symbol={symbol} />;
}
