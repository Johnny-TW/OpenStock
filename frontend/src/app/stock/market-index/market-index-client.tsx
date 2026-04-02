"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { PageHeader } from "@/components/commons/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/commons/table"
import type { MarketIndexDto } from "@/type/stock"

function getChangeColor(val: string) {
  if (!val) return ""
  if (val.startsWith("-")) return "text-green-500"
  if (val === "0.00" || val === "0") return ""
  return "text-red-500"
}

export default function MarketIndexClient() {
  const dispatch = useAppDispatch()
  const marketIndex = useAppSelector((state) => state.stock?.marketIndex)

  useEffect(() => {
    dispatch({ type: "GET_STOCK_MARKET_INDEX" })
  }, [dispatch])

  if (!marketIndex) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入指數資料中...</span>
      </div>
    )
  }

  const list: MarketIndexDto[] = marketIndex?.data ?? []

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="大盤 / 類股指數總覽"
        subtitle={<>共 {list.length} 項指數</>}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>指數名稱</TableHead>
              <TableHead className="text-right">收盤指數</TableHead>
              <TableHead className="text-right">漲跌點數</TableHead>
              <TableHead className="text-right">漲跌百分比</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right">{row.closingIndex}</TableCell>
                <TableCell className={`text-right ${getChangeColor(row.changePoints)}`}>
                  {row.direction} {row.changePoints}
                </TableCell>
                <TableCell className={`text-right ${getChangeColor(row.changePercent)}`}>
                  {row.changePercent}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
