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
import type { TopVolumeDto } from "@/type/stock"

function getChangeColor(direction: string) {
  if (direction === "-") return "text-green-500"
  if (direction === "+") return "text-red-500"
  return ""
}

export default function TopVolumeClient() {
  const dispatch = useAppDispatch()
  const topVolume = useAppSelector((state) => state.stock?.topVolume)

  useEffect(() => {
    dispatch({ type: "GET_STOCK_TOP_VOLUME" })
  }, [dispatch])

  if (!topVolume) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入成交排行中...</span>
      </div>
    )
  }

  const list: TopVolumeDto[] = topVolume?.data ?? []

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="成交量前 20 名"
        subtitle={<>共 {list.length} 檔</>}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">排名</TableHead>
              <TableHead>代號</TableHead>
              <TableHead>名稱</TableHead>
              <TableHead className="text-right">成交量</TableHead>
              <TableHead className="text-right">開盤</TableHead>
              <TableHead className="text-right">最高</TableHead>
              <TableHead className="text-right">最低</TableHead>
              <TableHead className="text-right">收盤</TableHead>
              <TableHead className="text-right">漲跌</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((row) => (
              <TableRow key={row.rank}>
                <TableCell>{row.rank}</TableCell>
                <TableCell className="font-medium">{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell className="text-right">{row.tradeVolume}</TableCell>
                <TableCell className="text-right">{row.openingPrice}</TableCell>
                <TableCell className="text-right">{row.highestPrice}</TableCell>
                <TableCell className="text-right">{row.lowestPrice}</TableCell>
                <TableCell className="text-right">{row.closingPrice}</TableCell>
                <TableCell className={`text-right ${getChangeColor(row.direction)}`}>
                  {row.direction}{row.change}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
