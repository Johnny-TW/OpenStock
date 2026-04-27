import StockDetailClient from "./stock-detail-client"

interface PageProps {
  params: Promise<{ symbol: string }>
}

export default async function StockDetailPage({ params }: PageProps) {
  const { symbol } = await params
  return <StockDetailClient symbol={symbol} />
}
