"use client"

import { useMemo } from "react"
import Link from "next/link"
import { TrendingUp, ArrowRight } from "lucide-react"
import type { StockDailyDto } from "@/type/stock"
import styles from "./market-index-chart.module.scss"

const TOP_COUNT = 5

function parseNum(val: string): number {
  return parseFloat(val.replace(/,/g, "")) || 0
}

function formatVolume(val: string): string {
  const n = parseNum(val)
  if (n >= 1e8) return `${(n / 1e8).toFixed(2)}億`
  if (n >= 1e4) return `${Math.round(n / 1e3).toLocaleString()}張`
  return n.toLocaleString()
}

function formatValue(val: string): string {
  const n = parseNum(val)
  if (n >= 1e8) return `${(n / 1e8).toFixed(2)}億`
  if (n >= 1e4) return `${(n / 1e4).toFixed(0)}萬`
  return n.toLocaleString()
}

interface TopGainersProps {
  data: StockDailyDto[]
}

export function MarketIndexChart({ data }: TopGainersProps) {
  const topList = useMemo(() => {
    if (!data?.length) return []
    return data
      .map((row) => {
        const close = parseNum(row.closingPrice)
        const change = parseNum(row.change)
        const prev = close - change
        const pct = prev > 0 ? (change / prev) * 100 : 0
        return { ...row, changeNum: change, pct, closeNum: close }
      })
      .filter((r) => r.closeNum > 0 && r.pct > 0)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, TOP_COUNT)
  }, [data])

  if (topList.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <TrendingUp className={styles.icon} />
          <h2 className={styles.title}>漲幅排行 Top {TOP_COUNT}</h2>
        </div>
        <Link href="/stock/ranking" className={styles.moreLink}>
          更多排行 <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className={styles.list}>
        {topList.map((stock, idx) => (
          <div key={stock.code} className={styles.row}>
            <span className={styles.rank} data-rank={idx + 1}>{idx + 1}</span>
            <div className={styles.stockInfo}>
              <span className={styles.code}>{stock.code}</span>
              <span className={styles.name}>{stock.name}</span>
            </div>
            <div className={styles.priceInfo}>
              <span className={styles.close}>{stock.closingPrice}</span>
              <span className={styles.change}>
                ▲ {stock.changeNum.toFixed(2)} ({stock.pct.toFixed(2)}%)
              </span>
            </div>
            <div className={styles.volumeInfo}>
              <span className={styles.volume}>{formatVolume(stock.tradeVolume)}</span>
              <span className={styles.value}>{formatValue(stock.tradeValue)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
