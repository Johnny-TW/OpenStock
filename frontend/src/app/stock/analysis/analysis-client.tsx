"use client"

import { useEffect, useState } from "react"
import { Loader2, RefreshCw, TrendingUp, AlertTriangle, Newspaper, Sparkles } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { Button } from "@/components/commons/button"
import { Badge } from "@/components/commons/badge"
import { useAppSelector as useSelector } from "@/hooks/use-redux"

interface TopPick {
  code: string
  name: string
  reason: string
}

interface AnalysisResult {
  marketOverview: string
  topPicks: TopPick[]
  risks: string
  newsImpact: string
  generatedAt: string
}

function formatDateTime(iso: string) {
  if (!iso) return ""
  const d = new Date(iso)
  return d.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function SectionCard({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-3 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h2 className="font-semibold text-base">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function AnalysisClient() {
  const dispatch = useAppDispatch()
  const result: AnalysisResult | null = useAppSelector((state: any) => state.analysis?.result ?? null)
  const loading = useAppSelector((state: any) => {
    const loadingMap = state.loading ?? {}
    return Object.keys(loadingMap).some((k) => k.startsWith("analysis") && loadingMap[k] === true)
  })
  const [watchlistOnly, setWatchlistOnly] = useState(false)
  const watchlist = useAppSelector((state: any) => state.watchlist?.list ?? [])

  function handleAnalyze() {
    const data = watchlistOnly && watchlist.length > 0
      ? { stockCodes: watchlist.map((w: any) => w.stockNo) }
      : {}
    dispatch({ type: "ANALYZE_MARKET", data })
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkles className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">AI 股票分析</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          結合今日台股數據與國際新聞，由 AI 產生市場分析與建議關注標的
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleAnalyze}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {loading ? "AI 分析中..." : "開始分析"}
        </Button>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded"
            checked={watchlistOnly}
            onChange={(e) => setWatchlistOnly(e.target.checked)}
          />
          <span>只分析我的自選股</span>
          {watchlist.length > 0 && (
            <Badge variant="secondary">{watchlist.length} 檔</Badge>
          )}
        </label>
      </div>

      {!result && !loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground rounded-xl border border-dashed">
          <Sparkles className="size-10 opacity-40" />
          <p className="text-sm">點擊「開始分析」讓 AI 為你解讀今日台股</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
          <Loader2 className="size-10 animate-spin" />
          <p className="text-sm">AI 正在分析數據與新聞，請稍候...</p>
        </div>
      )}

      {result && !loading && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground text-right">
            分析時間：{formatDateTime(result.generatedAt)}
          </p>

          <SectionCard icon={<TrendingUp className="size-5" />} title="今日市場概況">
            <p className="text-sm leading-relaxed text-foreground">{result.marketOverview}</p>
          </SectionCard>

          <SectionCard icon={<Sparkles className="size-5" />} title="AI 推薦關注標的">
            {result.topPicks.length === 0 ? (
              <p className="text-sm text-muted-foreground">暫無推薦</p>
            ) : (
              <div className="flex flex-col gap-3">
                {result.topPicks.map((pick) => (
                  <div
                    key={pick.code}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-semibold text-sm">{pick.code}</span>
                      <span className="text-sm text-muted-foreground">{pick.name}</span>
                    </div>
                    <span className="text-xs text-foreground sm:ml-2 leading-relaxed">{pick.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <div className="grid sm:grid-cols-2 gap-4">
            <SectionCard icon={<AlertTriangle className="size-5 text-amber-500" />} title="風險提示">
              <p className="text-sm leading-relaxed text-foreground">{result.risks}</p>
            </SectionCard>

            <SectionCard icon={<Newspaper className="size-5 text-blue-500" />} title="國際新聞影響">
              <p className="text-sm leading-relaxed text-foreground">{result.newsImpact}</p>
            </SectionCard>
          </div>

          <p className="text-xs text-muted-foreground text-center px-4">
            ⚠️ 以上內容由 AI 自動生成，僅供參考，不構成任何投資建議。投資有風險，請審慎評估。
          </p>
        </div>
      )}
    </div>
  )
}
