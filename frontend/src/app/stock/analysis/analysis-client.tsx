"use client";

import {
  BarChart3,
  Check,
  Loader2,
  Newspaper,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { LightweightChart } from "@/components/charts/lightweight-chart";
import { Badge } from "@/components/commons/badge";
import { Button } from "@/components/commons/button";
import { Checkbox } from "@/components/commons/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/commons/dialog";
import { PageHeader } from "@/components/commons/page-header/page-header";
import { useAnalyzeMarketStream, useCachedAnalysis } from "@/hooks/use-analysis-query";
import { useWatchlist } from "@/hooks/use-watchlist-query";
import tp from "./trading-plan.module.scss";

interface Scores {
  fundamental: number;
  technical: number;
  chip: number;
  news: number;
  strategic: number;
  total: number;
}

interface AnalysisFactor {
  category: string;
  description: string;
  importance: string;
}

interface TechnicalIndicators {
  ma5: number;
  ma10: number;
  ma20: number;
  ma60: number;
  rsi14: number;
  kValue: number;
  dValue: number;
  macdLine: number;
  signalLine: number;
  macdHistogram: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  volumeRatio: number;
  high20: number;
  low20: number;
  trend: string;
  recentCloses: number[];
  recentDates?: string[];
  momentum5d?: number;
  momentum10d?: number;
  momentum20d?: number;
  candlePatterns?: string[];
  supportLevel?: number;
  resistanceLevel?: number;
}

interface TopPick {
  code: string;
  name: string;
  reason: string;
  entryPrice: string;
  stopLoss: string;
  targetPrice: string;
  direction: string;
  signal: string;
  timeframe: string;
  technicalSummary: string;
  scores: Scores;
  bullishFactors: AnalysisFactor[];
  bearishFactors: AnalysisFactor[];
  indicators?: TechnicalIndicators;
}

interface AnalysisResult {
  marketOverview: string;
  topPicks: TopPick[];
  risks: string;
  newsImpact: string;
  technicalOutlook: string;
  generatedAt: string;
}

function formatDateTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

function getDirectionConfig(direction: string) {
  if (direction === "做多")
    return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (direction === "放空")
    return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
  return { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" };
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 80) return "text-green-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

const SCORE_LABELS: { key: keyof Omit<Scores, "total">; label: string }[] = [
  { key: "fundamental", label: "基本面" },
  { key: "technical", label: "技術面" },
  { key: "chip", label: "籌碼面" },
  { key: "news", label: "新聞面" },
  { key: "strategic", label: "戰略面" },
];

const SectionCard = React.memo(function SectionCard({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-3 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h2 className="font-semibold text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
});

function StockDetailDialog({
  pick,
  open,
  onClose,
}: {
  pick: TopPick;
  open: boolean;
  onClose: () => void;
}) {
  const closes = pick.indicators?.recentCloses ?? [];
  const lastPrice = closes.length > 0 ? closes[closes.length - 1] : 0;
  const firstPrice = closes.length > 1 ? closes[0] : lastPrice;
  const changePercent = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
  const isUp = changePercent >= 0;

  const getScoreClass = (s: number) =>
    s >= 70 ? tp.scoreHigh : s >= 50 ? tp.scoreMid : tp.scoreLow;
  const getScoreBarColor = (s: number) => (s >= 70 ? "#22c55e" : s >= 50 ? "#eab308" : "#ef4444");

  const directionLabel =
    pick.direction === "做多" ? "多頭策略" : pick.direction === "放空" ? "空頭策略" : "觀望策略";
  const directionClass =
    pick.direction === "做多"
      ? tp.strategyLong
      : pick.direction === "放空"
        ? tp.strategyShort
        : tp.strategyWatch;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-0 [&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:text-gray-400">
        <div className={tp.tradingPlan}>
          {/* Header */}
          <div className={tp.header}>
            <div className={tp.headerLeft}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <DialogTitle className="inline text-lg font-bold">
                    {pick.code} {pick.name}
                  </DialogTitle>
                  <span>交易計畫</span>
                </div>
                <p>
                  訊號：{pick.signal} · {pick.timeframe}
                </p>
              </div>
            </div>
            <div className={tp.timestamp}>分析時間：{new Date().toLocaleString("zh-TW")}</div>
          </div>

          {/* Stats Cards */}
          <div className={tp.statsRow}>
            <div className={tp.statsCard}>
              <div className={tp.statsCardHeader}>
                <span className={tp.statsCardLabel}>目前股價</span>
              </div>
              <span className={`${tp.statsCardValue} ${isUp ? tp.up : tp.down}`}>
                {lastPrice || pick.entryPrice}
              </span>
            </div>
            <div className={tp.statsCard}>
              <div className={tp.statsCardHeader}>
                <span className={tp.statsCardLabel}>漲跌幅</span>
                <span className={`${tp.statsCardTrend} ${isUp ? tp.up : tp.down}`}>
                  {isUp ? "+" : ""}
                  {changePercent.toFixed(2)}%
                </span>
              </div>
              <span className={`${tp.statsCardValue} ${isUp ? tp.up : tp.down}`}>
                {isUp ? "+" : ""}
                {(
                  Number(lastPrice || pick.entryPrice) -
                  Number(pick.indicators?.ma20 || pick.entryPrice)
                ).toFixed(1)}
              </span>
            </div>
            <div className={tp.statsCard}>
              <div className={tp.statsCardHeader}>
                <span className={tp.statsCardLabel}>趨勢方向</span>
              </div>
              <span className={tp.statsCardValue}>{pick.indicators?.trend ?? pick.direction}</span>
            </div>
            <div className={tp.statsCard}>
              <div className={tp.statsCardHeader}>
                <span className={tp.statsCardLabel}>綜合評分</span>
              </div>
              <span className={`${tp.statsCardValue} ${getScoreClass(pick.scores.total)}`}>
                {pick.scores.total}
              </span>
            </div>
          </div>

          {/* 走勢圖 */}
          <div className={tp.chartSection}>
            <LightweightChart symbol={pick.code} stockName={pick.name} />
          </div>

          {/* Body - 可捲動 */}
          <div className={tp.body}>
            {/* Row 1: 趨勢判斷 + 關鍵價位 */}
            <div className={tp.row}>
              <div className={tp.section}>
                <div className={tp.sectionHeader}>
                  <span className={tp.sectionNum}>1</span>
                  趨勢判斷
                </div>
                <div className={tp.sectionBody}>
                  <ul className={tp.trendList}>
                    <li>趨勢方向：{pick.indicators?.trend ?? "盤整"}</li>
                    {pick.indicators && (
                      <>
                        <li>
                          均線排列：MA5={pick.indicators.ma5} / MA20={pick.indicators.ma20} / MA60=
                          {pick.indicators.ma60}
                        </li>
                        <li>
                          RSI(14)={pick.indicators.rsi14}，
                          {pick.indicators.rsi14 > 70
                            ? "超買區間"
                            : pick.indicators.rsi14 < 30
                              ? "超賣區間"
                              : "中性區間"}
                        </li>
                        <li>
                          量比={pick.indicators.volumeRatio}x，
                          {pick.indicators.volumeRatio > 1.5
                            ? "量能放大"
                            : pick.indicators.volumeRatio < 0.7
                              ? "量能萎縮"
                              : "量能正常"}
                        </li>
                      </>
                    )}
                    {pick.indicators?.candlePatterns &&
                      pick.indicators.candlePatterns.length > 0 && (
                        <li>K線形態：{pick.indicators.candlePatterns.join("、")}</li>
                      )}
                    <li>{pick.technicalSummary}</li>
                  </ul>
                </div>
              </div>

              <div className={tp.section}>
                <div className={tp.sectionHeader}>
                  <span className={tp.sectionNum}>2</span>
                  關鍵價位
                </div>
                <div className={tp.sectionBody}>
                  {pick.indicators && (
                    <>
                      <div className={tp.priceLevel}>
                        <span className={tp.levelLabel}>
                          <span className={tp.levelDot} style={{ background: "#ef4444" }} />
                          壓力位
                        </span>
                        <span className={`${tp.levelValue} ${tp.up}`}>
                          {pick.indicators.resistanceLevel}
                        </span>
                      </div>
                      <div className={tp.priceLevel}>
                        <span className={tp.levelLabel}>
                          <span className={tp.levelDot} style={{ background: "#ef4444" }} />
                          目標價
                        </span>
                        <span className={`${tp.levelValue} ${tp.up}`}>{pick.targetPrice}</span>
                      </div>
                      <div className={tp.priceLevel}>
                        <span className={tp.levelLabel}>
                          <span className={tp.levelDot} style={{ background: "#a0aec0" }} />
                          進場價
                        </span>
                        <span className={tp.levelValue}>{pick.entryPrice}</span>
                      </div>
                      <div className={tp.priceLevel}>
                        <span className={tp.levelLabel}>
                          <span className={tp.levelDot} style={{ background: "#22c55e" }} />
                          停損位
                        </span>
                        <span className={`${tp.levelValue} ${tp.down}`}>{pick.stopLoss}</span>
                      </div>
                      <div className={tp.priceLevel}>
                        <span className={tp.levelLabel}>
                          <span className={tp.levelDot} style={{ background: "#22c55e" }} />
                          支撐位
                        </span>
                        <span className={`${tp.levelValue} ${tp.down}`}>
                          {pick.indicators.supportLevel}
                        </span>
                      </div>
                      <div className={tp.priceLevel}>
                        <span className={tp.levelLabel}>
                          <span className={tp.levelDot} style={{ background: "#a0aec0" }} />
                          20日高
                        </span>
                        <span className={tp.levelValue}>{pick.indicators.high20}</span>
                      </div>
                      <div className={tp.priceLevel}>
                        <span className={tp.levelLabel}>
                          <span className={tp.levelDot} style={{ background: "#a0aec0" }} />
                          20日低
                        </span>
                        <span className={tp.levelValue}>{pick.indicators.low20}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: 交易策略 + AI 評分 */}
            <div className={tp.row}>
              <div className={tp.section}>
                <div className={tp.sectionHeader}>
                  <span className={tp.sectionNum}>4</span>
                  交易策略
                </div>
                <div className={tp.sectionBody}>
                  <div className={tp.strategyBlock}>
                    <div className={`${tp.strategyTitle} ${directionClass}`}>{directionLabel}</div>
                    <div className={tp.strategyRow}>
                      <span className={tp.strategyKey}>進場：</span>
                      <span className={tp.strategyVal}>{pick.entryPrice}</span>
                    </div>
                    <div className={tp.strategyRow}>
                      <span className={tp.strategyKey}>停損：</span>
                      <span className={tp.strategyVal}>{pick.stopLoss}</span>
                    </div>
                    <div className={tp.strategyRow}>
                      <span className={tp.strategyKey}>目標：</span>
                      <span className={tp.strategyVal}>{pick.targetPrice}</span>
                    </div>
                    <div className={tp.strategyRow}>
                      <span className={tp.strategyKey}>時間：</span>
                      <span className={tp.strategyVal}>{pick.timeframe}</span>
                    </div>
                  </div>
                  <div className={tp.strategyBlock}>
                    <div className={tp.strategyRow}>
                      <span className={tp.strategyKey}>理由：</span>
                      <span className={tp.strategyVal}>{pick.reason}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={tp.section}>
                <div className={tp.sectionHeader}>
                  <span className={tp.sectionNum}>5</span>
                  AI 評分
                </div>
                <div className={tp.sectionBody}>
                  {SCORE_LABELS.map(({ key, label }) => (
                    <div key={key} className={tp.scoreRow}>
                      <span className={tp.scoreLabel}>{label}</span>
                      <div className={tp.scoreBar}>
                        <div
                          className={tp.scoreFill}
                          style={{
                            width: `${pick.scores[key]}%`,
                            background: getScoreBarColor(pick.scores[key]),
                          }}
                        />
                      </div>
                      <span className={`${tp.scoreNum} ${getScoreClass(pick.scores[key])}`}>
                        {pick.scores[key]}
                      </span>
                    </div>
                  ))}
                  <div className={tp.totalScore}>
                    <span className={`${tp.totalNum} ${getScoreClass(pick.scores.total)}`}>
                      {pick.scores.total}
                    </span>
                    <span className={tp.totalMax}>/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. 進場計畫（全寬） */}
            <div className={tp.section}>
              <div className={tp.sectionHeader}>
                <span className={tp.sectionNum}>6</span>
                進場計畫（範例）
              </div>
              <div style={{ padding: 0 }}>
                <table className={tp.planTable}>
                  <thead>
                    <tr>
                      <th>情境</th>
                      <th>進場條件</th>
                      <th>進場價位</th>
                      <th>停損</th>
                      <th>目標1</th>
                      <th>目標2</th>
                      <th>盈虧比</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span
                          className={`${tp.planDirection} ${pick.direction === "做多" ? tp.up : tp.down}`}
                        >
                          {pick.direction === "做多"
                            ? "多頭進場"
                            : pick.direction === "放空"
                              ? "空頭進場"
                              : "觀望"}
                        </span>
                      </td>
                      <td>{pick.signal}</td>
                      <td>{pick.entryPrice}</td>
                      <td className={tp.down}>{pick.stopLoss}</td>
                      <td className={tp.up}>{pick.targetPrice}</td>
                      <td>-</td>
                      <td>≥2:1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 3: 技術指標 + 風險管理 */}
            <div className={tp.row}>
              {pick.indicators && (
                <div className={tp.section}>
                  <div className={tp.sectionHeader}>
                    <span className={tp.sectionNum}>7</span>
                    技術指標
                  </div>
                  <div className={tp.sectionBody}>
                    <div className={tp.indicatorGrid}>
                      {[
                        { label: "RSI(14)", value: pick.indicators.rsi14.toString() },
                        {
                          label: "K / D",
                          value: `${pick.indicators.kValue} / ${pick.indicators.dValue}`,
                        },
                        {
                          label: "MACD",
                          value: `${pick.indicators.macdHistogram > 0 ? "+" : ""}${pick.indicators.macdHistogram}`,
                        },
                        { label: "量比", value: `${pick.indicators.volumeRatio}x` },
                        { label: "MA5", value: pick.indicators.ma5.toString() },
                        { label: "MA10", value: pick.indicators.ma10.toString() },
                        { label: "MA20", value: pick.indicators.ma20.toString() },
                        { label: "MA60", value: pick.indicators.ma60.toString() },
                      ].map((item) => (
                        <div key={item.label} className={tp.indicatorItem}>
                          <span className={tp.indLabel}>{item.label}</span>
                          <span className={tp.indValue}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className={tp.section}>
                <div className={tp.sectionHeader}>
                  <span className={tp.sectionNum}>8</span>
                  風險管理 & 執行紀律
                </div>
                <div className={tp.sectionBody}>
                  <ul className={tp.riskList}>
                    <li>單筆風險：不超過總資金 2%</li>
                    <li>停損嚴格執行，不攤平、不加碼</li>
                    <li>盈虧比建議 ≥ 1:2</li>
                  </ul>
                  <ul className={tp.disciplineList} style={{ marginTop: "0.75rem" }}>
                    <li>
                      <span className={tp.checkIcon}>
                        <Check size={9} />
                      </span>
                      進場前確認條件達成
                    </li>
                    <li>
                      <span className={tp.checkIcon}>
                        <Check size={9} />
                      </span>
                      嚴格執行停損停利
                    </li>
                    <li>
                      <span className={tp.checkIcon}>
                        <Check size={9} />
                      </span>
                      不預設立場，順勢操作
                    </li>
                    <li>
                      <span className={tp.checkIcon}>
                        <Check size={9} />
                      </span>
                      不因情緒影響紀律
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 9. 看多/看空因素（全寬） */}
            {(pick.bullishFactors.length > 0 || pick.bearishFactors.length > 0) && (
              <div className={tp.section}>
                <div className={tp.sectionHeader}>
                  <span className={tp.sectionNum}>9</span>
                  分析因素
                </div>
                <div className={tp.sectionBody}>
                  <div className={tp.row}>
                    {pick.bullishFactors.length > 0 && (
                      <div className={tp.factorSection}>
                        <h4 style={{ borderColor: "#ef4444", color: "#ef4444" }}>看多因素</h4>
                        <div className={tp.factorList}>
                          {pick.bullishFactors.map((f, i) => (
                            <div key={i} className={tp.factorItem}>
                              <span className={tp.factorDot} style={{ background: "#ef4444" }} />
                              <span
                                className={tp.factorBadge}
                                style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                              >
                                {f.category}
                              </span>
                              <span>{f.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {pick.bearishFactors.length > 0 && (
                      <div className={tp.factorSection}>
                        <h4 style={{ borderColor: "#22c55e", color: "#22c55e" }}>看空因素</h4>
                        <div className={tp.factorList}>
                          {pick.bearishFactors.map((f, i) => (
                            <div key={i} className={tp.factorItem}>
                              <span className={tp.factorDot} style={{ background: "#22c55e" }} />
                              <span
                                className={tp.factorBadge}
                                style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                              >
                                {f.category}
                              </span>
                              <span>{f.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 固定底部免責聲明 */}
          <div className={tp.disclaimer}>
            <span>⚠</span>
            核心原則：順勢操作，嚴設停損，控管風險，紀律執行。本分析由 AI 生成，僅供參考。
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const StockRankCard = React.memo(function StockRankCard({
  pick,
  rank,
}: {
  pick: TopPick;
  rank: number;
}) {
  const [open, setOpen] = useState(false);
  const dirConfig = getDirectionConfig(pick.direction);
  const medal = RANK_MEDALS[rank] ?? `${rank + 1}`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-border bg-card w-full p-4 flex items-center gap-4 text-left hover:shadow-md hover:border-primary/40 transition-all cursor-pointer"
      >
        <span className="text-2xl w-8 text-center shrink-0">
          {typeof medal === "string" && medal.length <= 2 ? (
            medal
          ) : (
            <span className="text-lg font-bold text-muted-foreground">{medal}</span>
          )}
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
  );
});

export default function AnalysisClient() {
  const { data: cachedResult } = useCachedAnalysis() as { data: AnalysisResult | null | undefined };
  const { data: watchlist = [] } = useWatchlist();
  const {
    isStreaming,
    statusText,
    result: streamResult,
    analyze,
    abort,
  } = useAnalyzeMarketStream();
  const loading = isStreaming;
  const result = (streamResult as AnalysisResult) ?? cachedResult;
  const [watchlistOnly, setWatchlistOnly] = useState(false);

  const handleAnalyze = useCallback(() => {
    const data =
      watchlistOnly && watchlist.length > 0
        ? { stockCodes: watchlist.map((w: any) => w.stockNo) }
        : {};
    analyze(data);
  }, [watchlistOnly, watchlist, analyze]);

  const sortedPicks = useMemo(() => {
    if (!result?.topPicks) return [];
    return [...result.topPicks].sort((a, b) => (b.scores?.total ?? 0) - (a.scores?.total ?? 0));
  }, [result?.topPicks]);

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <PageHeader
        title="AI 股票分析"
        subtitle="結合台股即時數據、技術指標與國際新聞，由 AI 多維度評分並產出進退場建議（每日快取一次）"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleAnalyze} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          {loading ? "AI 分析中..." : result ? "重新分析" : "開始分析"}
        </Button>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <Checkbox
            checked={watchlistOnly}
            onCheckedChange={(checked: boolean) => setWatchlistOnly(checked)}
          />
          <span>只分析我的自選股</span>
          {watchlist.length > 0 && <Badge variant="secondary">{watchlist.length} 檔</Badge>}
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
          <p className="text-sm">
            {statusText && !statusText.startsWith("AI 呼叫工具")
              ? statusText
              : "AI 正在擷取歷史資料、計算技術指標並進行多維度深度分析，請稍候..."}
          </p>
          <Button variant="outline" size="sm" onClick={abort}>
            取消
          </Button>
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
              <SectionCard
                icon={<BarChart3 className="size-5 text-violet-500" />}
                title="技術面展望"
              >
                <p className="text-sm leading-relaxed text-foreground">{result.technicalOutlook}</p>
              </SectionCard>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <SectionCard icon={<ShieldAlert className="size-5 text-amber-500" />} title="風險提示">
              <p className="text-sm leading-relaxed text-foreground">{result.risks}</p>
            </SectionCard>

            <SectionCard icon={<Newspaper className="size-5 text-blue-500" />} title="國際新聞影響">
              <p className="text-sm leading-relaxed text-foreground">{result.newsImpact}</p>
            </SectionCard>
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

          <p className="text-xs text-muted-foreground text-center px-4">
            以上內容由 AI
            根據技術指標自動生成，僅供參考，不構成任何投資建議。投資有風險，請審慎評估。
          </p>
        </div>
      )}
    </div>
  );
}
