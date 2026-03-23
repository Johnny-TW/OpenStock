"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/commons/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/commons/card"
import type { IntradayTickDto } from "@/type/stock"

export default function IntradayClient() {
  const dispatch = useAppDispatch()
  const intraday = useAppSelector((state) => state.stock?.intraday)

  useEffect(() => {
    dispatch({ type: "GET_STOCK_INTRADAY" })
  }, [dispatch])

  if (!intraday) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入盤中資料中...</span>
      </div>
    )
  }

  const list: IntradayTickDto[] = intraday?.data ?? []
  const latest = list.length > 0 ? list[list.length - 1] : null

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">盤中五秒累計資訊</h1>
        <p className="text-sm text-muted-foreground">共 {list.length} 筆紀錄</p>
      </div>

      {latest && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                最新時間
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latest.time}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                累計成交量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latest.accTradeVolume}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                累計成交值
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{latest.accTradeValue}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="rounded-md border max-h-[500px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>時間</TableHead>
              <TableHead className="text-right">累計成交量</TableHead>
              <TableHead className="text-right">累計成交值</TableHead>
              <TableHead className="text-right">累計成交筆數</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{row.time}</TableCell>
                <TableCell className="text-right">{row.accTradeVolume}</TableCell>
                <TableCell className="text-right">{row.accTradeValue}</TableCell>
                <TableCell className="text-right">{row.accTransaction}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
