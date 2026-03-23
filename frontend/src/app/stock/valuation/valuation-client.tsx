"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { StockValuationTable } from "@/components/data-table/stock/valuation-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/commons/card"

export default function ValuationClient() {
  const dispatch = useAppDispatch()
  const valuation = useAppSelector((state) => state.stock?.valuation)
  const loading = useAppSelector((state) => state.api?.loading)

  useEffect(() => {
    dispatch({ type: "GET_STOCK_VALUATION" })
  }, [dispatch])

  if (!valuation) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入評價資料中...</span>
      </div>
    )
  }

  const list = valuation?.data ?? []
  const title = valuation?.title ?? ""
  const date = valuation?.date ?? ""

  // 統計高殖利率股票
  const highYield = list.filter(
    (s) => parseFloat(s.dividendYield.replace(/,/g, "")) >= 5
  ).length

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">本益比 / 殖利率 / 淨值比</h1>
        <p className="text-sm text-muted-foreground">
          {title} {date && `· 資料日期：${date}`}
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>總檔數</CardDescription>
            <CardTitle className="text-2xl">{list.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">上市個股</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>殖利率 ≥ 5%</CardDescription>
            <CardTitle className="text-2xl text-red-500">{highYield}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">高殖利率標的</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>有本益比資料</CardDescription>
            <CardTitle className="text-2xl">
              {list.filter((s) => s.peRatio && s.peRatio !== "-").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">含 PE ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* 資料表 */}
      <StockValuationTable data={list} title={title} />
    </div>
  )
}
