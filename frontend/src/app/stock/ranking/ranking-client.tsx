"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/commons/tabs"
import { Input } from "@/components/commons/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/commons/select"
import { PageHeader } from "@/components/commons/page-header"
import type {
  RevenueRankingDto,
  GrossMarginRankingDto,
  DividendYieldRankingDto,
  PeRatioRankingDto,
} from "@/type/stock"

function formatNumber(num: number): string {
  if (num >= 1e8) return `${(num / 1e4).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 千元`
  return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function formatCurrency(num: number): string {
  if (Math.abs(num) >= 1e8) {
    return `${(num / 1e8).toFixed(2)} 億`
  }
  if (Math.abs(num) >= 1e4) {
    return `${(num / 1e4).toFixed(0)} 萬`
  }
  return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const PAGE_SIZE = 50

export default function RankingClient() {
  const dispatch = useAppDispatch()
  const ranking = useAppSelector((state) => state.ranking)
  const [activeTab, setActiveTab] = useState("revenue")
  const [search, setSearch] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("all")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    if (activeTab === "revenue" && !ranking?.revenue) {
      dispatch({ type: "GET_RANKING_REVENUE" })
    } else if (activeTab === "gross-margin" && !ranking?.grossMargin) {
      dispatch({ type: "GET_RANKING_GROSS_MARGIN" })
    } else if (activeTab === "dividend-yield" && !ranking?.dividendYield) {
      dispatch({ type: "GET_RANKING_DIVIDEND_YIELD" })
    } else if (activeTab === "pe-ratio" && !ranking?.peRatio) {
      dispatch({ type: "GET_RANKING_PE_RATIO" })
    }
  }, [activeTab, dispatch, ranking?.revenue, ranking?.grossMargin, ranking?.dividendYield, ranking?.peRatio])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    setSearch("")
    setSelectedIndustry("all")
    setVisibleCount(PAGE_SIZE)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setVisibleCount(PAGE_SIZE)
  }, [])

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }, [])

  const revenueData = useMemo(() => {
    const list: RevenueRankingDto[] = ranking?.revenue?.data ?? []
    const q = search.toLowerCase()
    return list
      .filter((r) => {
        if (selectedIndustry !== "all" && r.industry !== selectedIndustry) return false
        if (!q) return true
        return r.code.includes(q) || r.name.toLowerCase().includes(q) || r.industry.toLowerCase().includes(q)
      })
      .slice(0, visibleCount)
  }, [ranking?.revenue, search, selectedIndustry, visibleCount])

  const grossMarginData = useMemo(() => {
    const list: GrossMarginRankingDto[] = ranking?.grossMargin?.data ?? []
    const q = search.toLowerCase()
    return list
      .filter((r) => {
        if (selectedIndustry !== "all" && r.industry !== selectedIndustry) return false
        if (!q) return true
        return r.code.includes(q) || r.name.toLowerCase().includes(q) || r.industry.toLowerCase().includes(q)
      })
      .slice(0, visibleCount)
  }, [ranking?.grossMargin, search, selectedIndustry, visibleCount])

  const dividendYieldData = useMemo(() => {
    const list: DividendYieldRankingDto[] = ranking?.dividendYield?.data ?? []
    const q = search.toLowerCase()
    return list
      .filter((r) => {
        if (selectedIndustry !== "all" && r.industry !== selectedIndustry) return false
        if (!q) return true
        return r.code.includes(q) || r.name.toLowerCase().includes(q) || r.industry.toLowerCase().includes(q)
      })
      .slice(0, visibleCount)
  }, [ranking?.dividendYield, search, selectedIndustry, visibleCount])

  const peRatioData = useMemo(() => {
    const list: PeRatioRankingDto[] = ranking?.peRatio?.data ?? []
    const q = search.toLowerCase()
    return list
      .filter((r) => {
        if (selectedIndustry !== "all" && r.industry !== selectedIndustry) return false
        if (!q) return true
        return r.code.includes(q) || r.name.toLowerCase().includes(q) || r.industry.toLowerCase().includes(q)
      })
      .slice(0, visibleCount)
  }, [ranking?.peRatio, search, selectedIndustry, visibleCount])

  const industries = useMemo(() => {
    let list: { industry: string }[] = []
    switch (activeTab) {
      case "revenue": list = ranking?.revenue?.data ?? []; break
      case "gross-margin": list = ranking?.grossMargin?.data ?? []; break
      case "dividend-yield": list = ranking?.dividendYield?.data ?? []; break
      case "pe-ratio": list = ranking?.peRatio?.data ?? []; break
    }
    const set = new Set(list.map((r) => r.industry).filter(Boolean))
    return Array.from(set).sort()
  }, [activeTab, ranking?.revenue, ranking?.grossMargin, ranking?.dividendYield, ranking?.peRatio])

  const getTotal = () => {
    switch (activeTab) {
      case "revenue": return ranking?.revenue?.total ?? 0
      case "gross-margin": return ranking?.grossMargin?.total ?? 0
      case "dividend-yield": return ranking?.dividendYield?.total ?? 0
      case "pe-ratio": return ranking?.peRatio?.total ?? 0
      default: return 0
    }
  }

  const getPeriod = () => {
    switch (activeTab) {
      case "revenue": {
        const y = ranking?.revenue?.year
        const q = ranking?.revenue?.quarter
        return y ? `${y} 年第 ${q} 季` : ""
      }
      case "gross-margin": {
        const y = ranking?.grossMargin?.year
        const q = ranking?.grossMargin?.quarter
        return y ? `${y} 年第 ${q} 季` : ""
      }
      default: return "即時資料"
    }
  }

  const isLoading = () => {
    switch (activeTab) {
      case "revenue": return !ranking?.revenue
      case "gross-margin": return !ranking?.grossMargin
      case "dividend-yield": return !ranking?.dividendYield
      case "pe-ratio": return !ranking?.peRatio
      default: return false
    }
  }

  return (
    <div className="space-y-4 p-4">
      <PageHeader
        title="排行榜"
        subtitle={<>共 {getTotal()} 筆 {getPeriod() && `· ${getPeriod()}`}</>}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="revenue">營收排行</TabsTrigger>
            <TabsTrigger value="gross-margin">毛利率排行</TabsTrigger>
            <TabsTrigger value="dividend-yield">殖利率排行</TabsTrigger>
            <TabsTrigger value="pe-ratio">本益比排行</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Select value={selectedIndustry} onValueChange={(v) => { setSelectedIndustry(v); setVisibleCount(PAGE_SIZE) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="全部產業" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部產業</SelectItem>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="搜尋代號、名稱..."
              value={search}
              onChange={handleSearchChange}
              className="w-full sm:w-64"
            />
          </div>
        </div>

        {isLoading() ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">載入排行資料中...</span>
          </div>
        ) : (
          <>
            <TabsContent value="revenue">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>代號</TableHead>
                      <TableHead>名稱</TableHead>
                      <TableHead>產業別</TableHead>
                      <TableHead className="text-right">營業收入</TableHead>
                      <TableHead className="text-right">營業利益</TableHead>
                      <TableHead className="text-right">稅後淨利</TableHead>
                      <TableHead className="text-right">EPS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueData.map((row, idx) => (
                      <TableRow key={row.code}>
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.industry}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                        <TableCell className={`text-right ${row.operatingIncome < 0 ? "text-green-500" : ""}`}>
                          {formatCurrency(row.operatingIncome)}
                        </TableCell>
                        <TableCell className={`text-right ${row.netIncome < 0 ? "text-green-500" : ""}`}>
                          {formatCurrency(row.netIncome)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${row.eps < 0 ? "text-green-500" : "text-red-500"}`}>
                          {row.eps.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="gross-margin">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>代號</TableHead>
                      <TableHead>名稱</TableHead>
                      <TableHead>產業別</TableHead>
                      <TableHead className="text-right">毛利率</TableHead>
                      <TableHead className="text-right">營業收入</TableHead>
                      <TableHead className="text-right">營業成本</TableHead>
                      <TableHead className="text-right">營業毛利</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grossMarginData.map((row, idx) => (
                      <TableRow key={row.code}>
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.industry}</TableCell>
                        <TableCell className={`text-right font-bold ${row.grossMarginRate >= 50 ? "text-red-500" : row.grossMarginRate < 0 ? "text-green-500" : ""}`}>
                          {row.grossMarginRate.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.cost)}</TableCell>
                        <TableCell className={`text-right ${row.grossProfit < 0 ? "text-green-500" : ""}`}>
                          {formatCurrency(row.grossProfit)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="dividend-yield">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>代號</TableHead>
                      <TableHead>名稱</TableHead>
                      <TableHead>產業別</TableHead>
                      <TableHead className="text-right">殖利率</TableHead>
                      <TableHead className="text-right">本益比</TableHead>
                      <TableHead className="text-right">股價淨值比</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dividendYieldData.map((row, idx) => (
                      <TableRow key={row.code}>
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.industry}</TableCell>
                        <TableCell className={`text-right font-bold ${row.dividendYield >= 5 ? "text-red-500" : ""}`}>
                          {row.dividendYield.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right">
                          {row.peRatio > 0 ? row.peRatio.toFixed(2) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.pbRatio > 0 ? row.pbRatio.toFixed(2) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pe-ratio">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>代號</TableHead>
                      <TableHead>名稱</TableHead>
                      <TableHead>產業別</TableHead>
                      <TableHead className="text-right">本益比</TableHead>
                      <TableHead className="text-right">殖利率</TableHead>
                      <TableHead className="text-right">股價淨值比</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {peRatioData.map((row, idx) => (
                      <TableRow key={row.code}>
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.industry}</TableCell>
                        <TableCell className={`text-right font-bold ${row.peRatio <= 10 ? "text-red-500" : row.peRatio >= 50 ? "text-green-500" : ""}`}>
                          {row.peRatio.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.dividendYield > 0 ? `${row.dividendYield.toFixed(2)}%` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.pbRatio > 0 ? row.pbRatio.toFixed(2) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {visibleCount < getTotal() && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  className="rounded-md border px-6 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
                >
                  載入更多（已顯示 {visibleCount} / {getTotal()}）
                </button>
              </div>
            )}
          </>
        )}
      </Tabs>

      <p className="text-xs text-muted-foreground/60 pt-2">
        資料來源：
        <a href="https://openapi.twse.com.tw" target="_blank" rel="noopener noreferrer" className="underline">
          臺灣證券交易所 OpenAPI
        </a>
        ，僅供投資研究參考，不構成任何投資建議。
      </p>
    </div>
  )
}
