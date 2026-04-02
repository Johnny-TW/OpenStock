"use client"

import React, { useState, useCallback, useMemo, useEffect } from "react"
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Newspaper,
  Sparkles,
  ShieldAlert,
  BarChart3,
  Trophy,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { PageHeader } from "@/components/commons/page-header"
import { Button } from "@/components/commons/button"
import { Badge } from "@/components/commons/badge"
import { Checkbox } from "@/components/commons/checkbox"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/commons/dialog"

interface Scores {
  fundamental: number
  technical: number
  chip: number
  news: number
  strategic: number
  total: number
}

interface AnalysisFactor {
  category: string
  description: string
  importance: string
}

interface TechnicalIndicators {
  ma5: number
  ma10: number
  ma20: number
  ma60: number
  rsi14: number
  kValue: number
  dValue: number
  macdLine: number
  signalLine: number
  macdHistogram: number
  bollingerUpper: number
  bollingerMiddle: number
  bollingerLower: number
  volumeRatio: number
  high20: number
  low20: number
  trend: string
  recentCloses: number[]
}

interface TopPick {
  code: string
  name: string
  reason: string
  entryPrice: string
  stopLoss: string
  targetPrice: string
  direction: string
  signal: string
  timeframe: string
  technicalSummary: string
  scores: Scores
  bullishFactors: AnalysisFactor[]
  bearishFactors: AnalysisFactor[]
  indicators?: TechnicalIndicators
}

interface AnalysisResult {
  marketOverview: string
  topPicks: TopPick[]
  risks: string
  newsImpact: string
  technicalOutlook: string
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

const RANK_MEDALS = ["🥇", "🥈", "🥉"]

function getDirectionConfig(direction: string) {
  if (direction === "偏多")
    return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" }
  if (direction === "偏空")
    return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" }
  return { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" }
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600"
  if (score >= 80) return "text-green-600"
  if (score >= 70) return "text-blue-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-emerald-500"
  if (score >= 80) return "bg-green-500"
  if (score >= 70) return "bg-blue-500"
  if (score >= 60) return "bg-yellow-500"
  return "bg-red-500"
}

const SCORE_LABELS: { key: keyof Omit<Scores, "total">; label: string }[] = [
  { key: "fundamental", label: "基本面" },
  { key: "technical", label: "技術面" },
  { key: "chip", label: "籌碼面" },
  { key: "news", label: "新聞面" },
  { key: "strategic", label: "戰略面" },
]

const CATEGORY_COLORS: Record<string, string> = {
  "題材": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "基本": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "技術": "bg-amber-400/10 text-amber-500 border-amber-400/20",
  "籌碼": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "新聞": "bg-green-500/10 text-green-400 border-green-500/20",
}

const SectionCard = React.memo(function SectionCard({
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
})

const ScoreBar = React.memo(function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="w-14 text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getScoreBgColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`w-8 text-right text-xs font-semibold tabular-nums ${getScoreColor(score)}`}>
        {score}
      </span>
    </div>
  )
})

const MiniLineChart = React.memo(function MiniLineChart({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null
  const w = 560
  const h = 160
  const pad = { top: 10, right: 10, bottom: 10, left: 10 }
  const iw = w - pad.left - pad.right
  const ih = h - pad.top - pad.bottom
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = pad.left + (i / (data.length - 1)) * iw
    const y = pad.top + ih - ((v - min) / range) * ih
    return `${x},${y}`
  })
  const isUp = data[data.length - 1] >= data[0]
  const stroke = isUp ? "#ef4444" : "#22c55e"
  const fill = isUp ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)"
  const areaPath = `M${points[0]} ${points.join(" L")} L${pad.left + iw},${pad.top + ih} L${pad.left},${pad.top + ih} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 160 }}>
      <path d={areaPath} fill={fill} />
      <polyline points={points.join(" ")} fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  )
})

function StockDetailDialog({ pick, open, onClose }: { pick: TopPick; open: boolean; onClose: () => void }) {
  const closes = pick.indicators?.recentCloses ?? []
  const lastPrice = closes.length > 0 ? closes[closes.length - 1] : 0
  const firstPrice = closes.length > 1 ? closes[0] : lastPrice
  const changePercent = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0
  const isUp = changePercent >= 0
  const dirConfig = getDirectionConfig(pick.direction)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 [&>button:last-child]:top-3 [&>button:last-child]:right-3">
        <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-0.5 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <DialogTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                AI 趨勢分析報告
              </DialogTitle>
              <p className="text-sm font-bold truncate">
                {pick.name} <span className="font-normal text-muted-foreground">({pick.code})</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* 綜合評分 */}
          <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">AI 綜合評分</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-semibold ${dirConfig.color} ${dirConfig.bg} ${dirConfig.border}`}>
                  {pick.direction === "偏多" ? <TrendingUp className="size-3" /> : pick.direction === "偏空" ? <TrendingDown className="size-3" /> : null}
                  {pick.direction}
                </span>
              </div>
              <span className={`text-3xl font-black tabular-nums ${getScoreColor(pick.scores.total)}`}>
                {pick.scores.total}
                <span className="text-sm font-normal text-muted-foreground ml-1">/ 100</span>
              </span>
            </div>
            <div className="divide-y">
              {SCORE_LABELS.map(({ key, label }) => (
                <ScoreBar key={key} label={label} score={pick.scores[key]} />
              ))}
            </div>
          </div>

          {/* 走勢圖 */}
          {closes.length > 5 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  日線走勢（近 {closes.length} 日）
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold tabular-nums ${isUp ? "text-red-500" : "text-green-500"}`}>
                    {lastPrice}
                  </span>
                  <span className={`text-xs font-medium tabular-nums ${isUp ? "text-red-500" : "text-green-500"}`}>
                    {isUp ? "+" : ""}{changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <MiniLineChart data={closes} />
            </div>
          )}

          {/* 進退場建議 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg border bg-muted/20">
              <span className="text-[10px] text-muted-foreground">建議進場價</span>
              <span className="font-mono font-bold text-base text-green-600">{pick.entryPrice}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg border bg-muted/20">
              <span className="text-[10px] text-muted-foreground">停損價</span>
              <span className="font-mono font-bold text-base text-red-600">{pick.stopLoss}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg border bg-muted/20">
              <span className="text-[10px] text-muted-foreground">目標價</span>
              <span className="font-mono font-bold text-base text-blue-600">{pick.targetPrice}</span>
            </div>
          </div>

          {/* 技術指標快覽 */}
          {pick.indicators && (
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { label: "RSI(14)", value: pick.indicators.rsi14.toString() },
                { label: "K / D", value: `${pick.indicators.kValue} / ${pick.indicators.dValue}` },
                { label: "MACD", value: `${pick.indicators.macdHistogram > 0 ? "+" : ""}${pick.indicators.macdHistogram}` },
                { label: "量比", value: `${pick.indicators.volumeRatio}x` },
                { label: "MA5", value: pick.indicators.ma5.toString() },
                { label: "MA20", value: pick.indicators.ma20.toString() },
                { label: "趨勢", value: pick.indicators.trend },
                { label: "訊號", value: pick.signal },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center p-2 rounded border bg-muted/20">
                  <span className="text-[9px] text-muted-foreground">{item.label}</span>
                  <span className="font-mono font-semibold text-xs">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* 看多/看空因素 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pick.bullishFactors.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b">
                  <div className="w-0.5 h-4 rounded-full bg-red-500" />
                  <span className="text-sm font-bold text-red-500">看多因素</span>
                </div>
                <ul className="divide-y">
                  {pick.bullishFactors.map((f, i) => (
                    <li key={i} className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-500" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${CATEGORY_COLORS[f.category] ?? CATEGORY_COLORS["基本"]}`}>
                              {f.category || "基本"}
                            </span>
                            {f.importance === "重要" && (
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium bg-red-500/10 text-red-500">重要</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pick.bearishFactors.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b">
                  <div className="w-0.5 h-4 rounded-full bg-emerald-500" />
                  <span className="text-sm font-bold text-emerald-500">看空因素</span>
                </div>
                <ul className="divide-y">
                  {pick.bearishFactors.map((f, i) => (
                    <li key={i} className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-muted-foreground/30" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${CATEGORY_COLORS[f.category] ?? CATEGORY_COLORS["基本"]}`}>
                              {f.category || "基本"}
                            </span>
                            {f.importance === "重要" && (
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-500/10 text-amber-500">重要</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {pick.technicalSummary && (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
              <BarChart3 className="size-3.5 mt-0.5 shrink-0" />
              <span>{pick.technicalSummary}</span>
            </div>
          )}

          <div className="border rounded px-4 py-3 text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold">免責聲明：</span>本分析結果由 AI 大型語言模型（Claude）生成，僅供參考，不代表任何投資建議。投資前請審慎評估風險。
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const StockRankCard = React.memo(function StockRankCard({
  pick,
  rank,
}: {
  pick: TopPick
  rank: number
}) {
  const [open, setOpen] = useState(false)
  const dirConfig = getDirectionConfig(pick.direction)
  const medal = RANK_MEDALS[rank] ?? `${rank + 1}`

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-white bg-white w-full p-4 flex items-center gap-4 text-left hover:shadow-md transition-all cursor-pointer"
      >
        <span className="text-2xl w-8 text-center shrink-0">
          {typeof medal === "string" && medal.length <= 2 ? medal : <span className="text-lg font-bold text-muted-foreground">{medal}</span>}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold">{pick.code}</span>
            <span className="text-sm">{pick.name}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${dirConfig.color}`}>
              {pick.direction}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {SCORE_LABELS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>{label}</span>
                <span className={`font-mono font-semibold ${getScoreColor(pick.scores[key])}`}>
                  {pick.scores[key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-center">
            <span className={`text-2xl font-bold font-mono ${getScoreColor(pick.scores.total)}`}>
              {pick.scores.total}
            </span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>
      </button>

      <StockDetailDialog pick={pick} open={open} onClose={() => setOpen(false)} />
    </>
  )
})

export default function AnalysisClient() {
  const dispatch = useAppDispatch()
  const result: AnalysisResult | null = useAppSelector((state: any) => state.analysis?.result ?? null)
  const loading = useAppSelector((state: any) => {
    const loadingStack = state.api?.loadingStack ?? []
    return loadingStack.some((item: any) => item.path?.startsWith("analysis") && item.loading)
  })
  const [watchlistOnly, setWatchlistOnly] = useState(false)
  const watchlist = useAppSelector((state: any) => state.watchlist?.list ?? [])

  const handleAnalyze = useCallback(() => {
    const data = watchlistOnly && watchlist.length > 0
      ? { stockCodes: watchlist.map((w: any) => w.stockNo) }
      : {}
    dispatch({ type: "ANALYZE_MARKET", data })
  }, [watchlistOnly, watchlist, dispatch])

  useEffect(() => {
    dispatch({ type: "GET_CACHED_ANALYSIS" })
  }, [dispatch])

  const sortedPicks = useMemo(() => {
    if (!result?.topPicks) return []
    return [...result.topPicks].sort((a, b) => (b.scores?.total ?? 0) - (a.scores?.total ?? 0))
  }, [result?.topPicks])

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <PageHeader
        title="AI 股票分析"
        subtitle="結合台股即時數據、技術指標與國際新聞，由 AI 多維度評分並產出進退場建議（每日快取一次）"
      />

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
          {loading ? "AI 分析中..." : result ? "重新分析" : "開始分析"}
        </Button>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <Checkbox
            checked={watchlistOnly}
            onCheckedChange={(checked: boolean) => setWatchlistOnly(checked)}
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
          <p className="text-sm">AI 正在擷取歷史資料、計算技術指標並進行多維度深度分析，請稍候...</p>
        </div>
      )}

      {result && !loading && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground text-right">
            分析時間：{formatDateTime(result.generatedAt)}
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <SectionCard icon={<TrendingUp className="size-5" />} title="今日市場概況">
              <p className="text-sm leading-relaxed text-foreground">{result.marketOverview}</p>
            </SectionCard>

            {result.technicalOutlook && (
              <SectionCard icon={<BarChart3 className="size-5 text-violet-500" />} title="技術面展望">
                <p className="text-sm leading-relaxed text-foreground">{result.technicalOutlook}</p>
              </SectionCard>
            )}
          </div>

          <SectionCard icon={<Trophy className="size-5 text-amber-500" />} title="AI 評分排行榜">
            {sortedPicks.length === 0 ? (
              <p className="text-sm text-muted-foreground">暫無推薦</p>
            ) : (
              <div className="flex flex-col gap-3">
                {sortedPicks.map((pick, i) => (
                  <StockRankCard key={pick.code} pick={pick} rank={i} />
                ))}
              </div>
            )}
          </SectionCard>

          <div className="grid sm:grid-cols-2 gap-4">
            <SectionCard icon={<ShieldAlert className="size-5 text-amber-500" />} title="風險提示">
              <p className="text-sm leading-relaxed text-foreground">{result.risks}</p>
            </SectionCard>

            <SectionCard icon={<Newspaper className="size-5 text-blue-500" />} title="國際新聞影響">
              <p className="text-sm leading-relaxed text-foreground">{result.newsImpact}</p>
            </SectionCard>
          </div>

          <p className="text-xs text-muted-foreground text-center px-4">
            以上內容由 AI 根據技術指標自動生成，僅供參考，不構成任何投資建議。投資有風險，請審慎評估。
          </p>
        </div>
      )}
    </div>
  )
}
