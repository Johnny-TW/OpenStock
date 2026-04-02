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
import type { IndexHistoryDto } from "@/type/stock"

export default function IndexHistoryClient() {
  const dispatch = useAppDispatch()
  const indexHistory = useAppSelector((state) => state.stock?.indexHistory)

  useEffect(() => {
    dispatch({ type: "GET_STOCK_INDEX_HISTORY" })
  }, [dispatch])

  if (!indexHistory) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">載入歷史指數中...</span>
      </div>
    )
  }

  const list: IndexHistoryDto[] = indexHistory?.data ?? []

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="每日收盤指數歷史"
        subtitle={<>共 {list.length} 筆紀錄</>}
      />

      <div className="rounded-md border max-h-[600px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead className="text-right">開盤指數</TableHead>
              <TableHead className="text-right">最高指數</TableHead>
              <TableHead className="text-right">最低指數</TableHead>
              <TableHead className="text-right">收盤指數</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{row.date}</TableCell>
                <TableCell className="text-right">{row.openingIndex}</TableCell>
                <TableCell className="text-right">{row.highestIndex}</TableCell>
                <TableCell className="text-right">{row.lowestIndex}</TableCell>
                <TableCell className="text-right">{row.closingIndex}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
