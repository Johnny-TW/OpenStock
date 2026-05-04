"use client";

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  ExternalLink,
  Loader2,
  PieChart,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LightweightChart } from "@/components/charts/lightweight-chart";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/commons/alert-dialog";
import { Button } from "@/components/commons/button";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import type { StockDetailDto } from "@/type/stock";
import styles from "./page.module.scss";

function formatNumber(num: number): string {
  if (!num) return "-";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e8) return `$${(num / 1e8).toFixed(2)}億`;
  if (num >= 1e4) return `$${(num / 1e4).toFixed(2)}萬`;
  return num.toLocaleString();
}

function formatVolume(num: number): string {
  if (!num) return "-";
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatExchange(symbol: string): string {
  if (/^\d{4,6}$/.test(symbol)) return "TWSE";
  return "NASDAQ";
}

function getTradingViewUrl(symbol: string): string {
  const tvSymbol = /^\d{4,6}$/.test(symbol) ? `TWSE:${symbol}` : symbol;
  return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`;
}

function formatTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
}

function formatPercent(val: number): string {
  if (!val) return "-";
  return `${(val * 100).toFixed(2)}%`;
}

function formatPrice(val: number): string {
  if (!val) return "-";
  return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatRatio(val: number): string {
  if (!val) return "-";
  return val.toFixed(2);
}

const RECOMMENDATION_MAP: Record<string, string> = {
  strongBuy: "強力買進",
  buy: "買進",
  hold: "持有",
  sell: "賣出",
  strongSell: "強力賣出",
  underperform: "表現落後",
  outperform: "表現優於",
};

interface StockDetailClientProps {
  symbol: string;
}

export default function StockDetailClient({ symbol }: StockDetailClientProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const stockDetail = useAppSelector(
    (state) => state.stock?.stockDetail,
  ) as StockDetailResponse | null;
  const stockDetailLoaded = useAppSelector((state) => state.stock?.stockDetailLoaded ?? false);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    setAlertOpen(false);
    dispatch({ type: "CLEAR_STOCK_DETAIL" });
    dispatch({ type: "GET_STOCK_DETAIL", symbol });
    return () => {
      dispatch({ type: "CLEAR_STOCK_DETAIL" });
    };
  }, [dispatch, symbol]);

  const rawDetail: StockDetailDto | null = stockDetail?.data ?? null;
  const detail: StockDetailDto | null = rawDetail && rawDetail.symbol === symbol ? rawDetail : null;
  const isUp = detail && detail.change > 0;
  const isDown = detail && detail.change < 0;
  const isNotFound = stockDetailLoaded && !detail;

  useEffect(() => {
    if (isNotFound) {
      setAlertOpen(true);
      dispatch({ type: "CLEAR_API_ERROR" });
    }
  }, [isNotFound, dispatch]);

  return (
    <div className={styles.detailPage}>
      <div className={styles.toolbar}>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft className="size-4" />
          返回
        </Button>
        <div className={styles.timestamp}>{formatTimestamp()}</div>
      </div>

      {isNotFound ? (
        <div className={styles.loading}>
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">查無此股票資料：{symbol}</span>
          <Button variant="outline" size="sm" onClick={() => router.back()} className="ml-4">
            返回
          </Button>
          <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>查無此股票資料</AlertDialogTitle>
                <AlertDialogDescription>
                  無法取得 {symbol} 的詳細資訊，請確認代號是否正確或稍後再試。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setAlertOpen(false)}>我知道了</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : !detail ? (
        <div className={styles.loading}>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">載入資料中...</span>
        </div>
      ) : (
        <div className={styles.mainLayout}>
          <div className={styles.leftCol}>
            <div className={styles.chartSection}>
              <div className={styles.chartHeader}>
                <div className={styles.stockTitle}>
                  <span className={styles.stockName}>{detail.name}</span>
                  {detail.longName && detail.longName !== detail.name && (
                    <span className={styles.longName}>{detail.longName}</span>
                  )}
                  <span className={styles.exchangeLabel}>{formatExchange(detail.symbol)}</span>
                  {detail.sector && <span className={styles.sectorBadge}>{detail.sector}</span>}
                  {detail.industry && (
                    <span className={styles.industryBadge}>{detail.industry}</span>
                  )}
                </div>

                <div className={styles.priceRow}>
                  <span className={styles.price}>
                    $
                    {detail.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span
                    className={`${styles.change} ${isUp ? styles.up : isDown ? styles.down : ""}`}
                  >
                    {detail.change >= 0 ? "+" : ""}
                    {detail.change.toFixed(2)} ({detail.changePercent >= 0 ? "+" : ""}
                    {detail.changePercent.toFixed(2)}%)
                    {isUp && <TrendingUp className="inline size-3.5 ml-1" />}
                    {isDown && <TrendingDown className="inline size-3.5 ml-1" />}
                  </span>
                </div>

                <div className={styles.quickStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>開盤</span>
                    <span className={styles.statValue}>{formatPrice(detail.open)}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>昨收</span>
                    <span className={styles.statValue}>{formatPrice(detail.previousClose)}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>最高</span>
                    <span className={`${styles.statValue} ${styles.up}`}>
                      {formatPrice(detail.high)}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>最低</span>
                    <span className={`${styles.statValue} ${styles.down}`}>
                      {formatPrice(detail.low)}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>成交量</span>
                    <span className={styles.statValue}>{formatVolume(detail.volume)}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>均量(3月)</span>
                    <span className={styles.statValue}>{formatVolume(detail.avgVolume)}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>市值</span>
                    <span className={styles.statValue}>{formatNumber(detail.marketCap)}</span>
                  </div>
                </div>
              </div>
              <div className={styles.chartBody}>
                <LightweightChart symbol={symbol} stockName={detail.name} />
              </div>
              <div className={styles.chartFooter}>
                <div className={styles.headerMeta}>即時數據 · {formatTimestamp()}</div>
                <a
                  href={getTradingViewUrl(symbol)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.tvLink}
                >
                  在 TradingView 開啟完整版
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.infoSection}>
              <div className={styles.sectionTitle}>基本面數據</div>
              <div className={styles.metricGrid}>
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>市值</span>
                  <span className={styles.metricValue}>{formatNumber(detail.marketCap)}</span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>本益比 P/E</span>
                  <span className={styles.metricValue}>
                    {detail.peRatio ? `${detail.peRatio.toFixed(1)}x` : "-"}
                  </span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>預估本益比</span>
                  <span className={styles.metricValue}>
                    {detail.forwardPE ? `${detail.forwardPE.toFixed(1)}x` : "-"}
                  </span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>EPS</span>
                  <span className={styles.metricValue}>{formatPrice(detail.eps)}</span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>殖息率</span>
                  <span className={styles.metricValue}>
                    {detail.dividendYield ? `${detail.dividendYield.toFixed(2)}%` : "-"}
                  </span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>市淨率 P/B</span>
                  <span className={styles.metricValue}>
                    {detail.pbRatio ? `${detail.pbRatio.toFixed(1)}x` : "-"}
                  </span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>ROE</span>
                  <span
                    className={`${styles.metricValue} ${detail.returnOnEquity > 0.15 ? styles.highlight : ""}`}
                  >
                    {formatPercent(detail.returnOnEquity)}
                  </span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>毛利率</span>
                  <span className={styles.metricValue}>{formatPercent(detail.grossMargins)}</span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>營收年增</span>
                  <span
                    className={`${styles.metricValue} ${detail.revenueGrowth > 0 ? styles.up : detail.revenueGrowth < 0 ? styles.down : ""}`}
                  >
                    {detail.revenueGrowth
                      ? `${detail.revenueGrowth > 0 ? "+" : ""}${(detail.revenueGrowth * 100).toFixed(1)}%`
                      : "-"}
                  </span>
                </div>
                <div className={styles.metricCell}>
                  <span className={styles.metricLabel}>Beta</span>
                  <span className={styles.metricValue}>{formatRatio(detail.beta)}</span>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <Building2 className="size-4" />
                財務健康
              </div>
              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span>ROA</span>
                  <span>{formatPercent(detail.returnOnAssets)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>營業利益率</span>
                  <span>{formatPercent(detail.operatingMargins)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>淨利率</span>
                  <span>{formatPercent(detail.profitMargins)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>盈餘成長率</span>
                  <span
                    className={
                      detail.earningsGrowth > 0
                        ? styles.up
                        : detail.earningsGrowth < 0
                          ? styles.down
                          : ""
                    }
                  >
                    {formatPercent(detail.earningsGrowth)}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span>負債權益比</span>
                  <span>{detail.debtToEquity ? `${detail.debtToEquity.toFixed(1)}%` : "-"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>流動比率</span>
                  <span>{formatRatio(detail.currentRatio)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>每股淨值</span>
                  <span>{formatPrice(detail.bookValue)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>在外流通股數</span>
                  <span>
                    {detail.sharesOutstanding ? formatVolume(detail.sharesOutstanding) : "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <PieChart className="size-4" />
                股利資訊
              </div>
              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span>殖利率</span>
                  <span className={detail.dividendYield > 0 ? styles.highlight : ""}>
                    {detail.dividendYield ? `${detail.dividendYield.toFixed(2)}%` : "-"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span>年化股利</span>
                  <span>{detail.dividendRate ? formatPrice(detail.dividendRate) : "-"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>配息率</span>
                  <span>{detail.payoutRatio ? formatPercent(detail.payoutRatio) : "-"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>除息日</span>
                  <span>{detail.exDividendDate || "-"}</span>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <Target className="size-4" />
                技術面 / 分析師
              </div>
              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span>52 週最高</span>
                  <span className={styles.up}>{formatPrice(detail.week52High)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>52 週最低</span>
                  <span className={styles.down}>{formatPrice(detail.week52Low)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>50 日均線</span>
                  <span>{formatPrice(detail.fiftyDayAvg)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>200 日均線</span>
                  <span>{formatPrice(detail.twoHundredDayAvg)}</span>
                </div>
                {detail.targetMeanPrice > 0 && (
                  <>
                    <div className={styles.divider} />
                    <div className={styles.infoRow}>
                      <span>分析師目標均價</span>
                      <span className={styles.highlight}>
                        {formatPrice(detail.targetMeanPrice)}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span>目標價區間</span>
                      <span>
                        {formatPrice(detail.targetLowPrice)} ~ {formatPrice(detail.targetHighPrice)}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span>分析師建議</span>
                      <span className={styles.recommendation}>
                        {RECOMMENDATION_MAP[detail.recommendationKey] ||
                          detail.recommendationKey ||
                          "-"}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span>分析師人數</span>
                      <span>{detail.numberOfAnalysts || "-"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StockDetailResponse {
  data: StockDetailDto;
}
