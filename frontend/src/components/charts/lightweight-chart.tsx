"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import type { StockHistoryResponse, StockHistoryPointDto } from "@/type/stock"
import styles from "./lightweight-chart.module.scss"

const PERIODS = [
  { key: "5d", label: "5日" },
  { key: "1m", label: "1月" },
  { key: "3m", label: "3月" },
  { key: "6m", label: "6月" },
  { key: "1y", label: "1年" },
  { key: "5y", label: "5年" },
  { key: "all", label: "全部" },
] as const

const INDICATORS = [
  { key: "ma", label: "MA" },
  { key: "bb", label: "布林" },
  { key: "rsi", label: "RSI" },
  { key: "macd", label: "MACD" },
  { key: "vol", label: "成交量" },
] as const

type IndicatorKey = (typeof INDICATORS)[number]["key"]

interface LightweightChartProps {
  symbol: string
  stockName?: string
}

interface OHLCInfo {
  open: number
  high: number
  low: number
  close: number
  change: number
  changePercent: number
}

function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = []
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]
    if (i >= period) sum -= values[i - period]
    out.push(i >= period - 1 ? sum / period : null)
  }
  return out
}

function stddev(values: number[], period: number, means: (number | null)[]): (number | null)[] {
  const out: (number | null)[] = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1 || means[i] == null) {
      out.push(null)
      continue
    }
    let sq = 0
    for (let j = i - period + 1; j <= i; j++) {
      sq += (values[j] - (means[i] as number)) ** 2
    }
    out.push(Math.sqrt(sq / period))
  }
  return out
}

function rsi(closes: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = []
  let gain = 0
  let loss = 0
  for (let i = 0; i < closes.length; i++) {
    if (i === 0) {
      out.push(null)
      continue
    }
    const diff = closes[i] - closes[i - 1]
    const g = diff > 0 ? diff : 0
    const l = diff < 0 ? -diff : 0
    if (i <= period) {
      gain += g
      loss += l
      if (i === period) {
        const avgG = gain / period
        const avgL = loss / period
        const rs = avgL === 0 ? 100 : avgG / avgL
        out.push(100 - 100 / (1 + rs))
      } else {
        out.push(null)
      }
    } else {
      gain = (gain * (period - 1) + g) / period
      loss = (loss * (period - 1) + l) / period
      const rs = loss === 0 ? 100 : gain / loss
      out.push(100 - 100 / (1 + rs))
    }
  }
  return out
}

function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = []
  const k = 2 / (period + 1)
  let prev: number | null = null
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(null)
      continue
    }
    if (prev === null) {
      let s = 0
      for (let j = 0; j < period; j++) s += values[j]
      prev = s / period
    } else {
      prev = values[i] * k + prev * (1 - k)
    }
    out.push(prev)
  }
  return out
}

function macd(closes: number[]) {
  const ema12 = ema(closes, 12)
  const ema26 = ema(closes, 26)
  const macdLine = closes.map((_, i) => {
    const a = ema12[i]
    const b = ema26[i]
    return a != null && b != null ? a - b : null
  })
  const macdValid = macdLine.map((v) => v ?? 0)
  const signalRaw = ema(macdValid, 9)
  const signal = macdLine.map((v, i) => (v == null ? null : signalRaw[i]))
  const hist = macdLine.map((v, i) =>
    v != null && signal[i] != null ? v - (signal[i] as number) : null,
  )
  return { macd: macdLine, signal, hist }
}

export function LightweightChart({ symbol, stockName }: LightweightChartProps) {
  const dispatch = useAppDispatch()
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const maSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const bbUpperRef = useRef<ISeriesApi<"Line"> | null>(null)
  const bbLowerRef = useRef<ISeriesApi<"Line"> | null>(null)
  const bbMidRef = useRef<ISeriesApi<"Line"> | null>(null)
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const macdLineRef = useRef<ISeriesApi<"Line"> | null>(null)
  const macdSignalRef = useRef<ISeriesApi<"Line"> | null>(null)
  const macdHistRef = useRef<ISeriesApi<"Histogram"> | null>(null)

  const [activePeriod, setActivePeriod] = useState("6m")
  const [activeIndicators, setActiveIndicators] = useState<Set<IndicatorKey>>(
    new Set<IndicatorKey>(["ma", "bb", "vol"]),
  )
  const [hover, setHover] = useState<OHLCInfo | null>(null)

  const historyData = useAppSelector(
    (state) => state.stock?.stockHistory
  ) as StockHistoryResponse | null

  useEffect(() => {
    dispatch({ type: "CLEAR_STOCK_HISTORY" })
    dispatch({ type: "GET_STOCK_HISTORY", symbol, period: activePeriod })
  }, [dispatch, symbol, activePeriod])

  useEffect(() => {
    return () => {
      dispatch({ type: "CLEAR_STOCK_HISTORY" })
    }
  }, [dispatch])

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "#131722" },
        textColor: "#d1d4dc",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, sans-serif",
        panes: {
          separatorColor: "#2a2e39",
          separatorHoverColor: "#434651",
        },
      },
      grid: {
        vertLines: { color: "#1e222d" },
        horzLines: { color: "#1e222d" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#758696", labelBackgroundColor: "#2a2e39" },
        horzLine: { color: "#758696", labelBackgroundColor: "#2a2e39" },
      },
      rightPriceScale: { borderColor: "#2a2e39" },
      timeScale: {
        borderColor: "#2a2e39",
        timeVisible: true,
        secondsVisible: false,
      },
      localization: { locale: "zh-TW" },
    })

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: "#ef4444",
      downColor: "#22c55e",
      borderUpColor: "#ef4444",
      borderDownColor: "#22c55e",
      wickUpColor: "#ef4444",
      wickDownColor: "#22c55e",
    })

    chartRef.current = chart
    candleSeriesRef.current = candle

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setHover(null)
        return
      }
      const c = param.seriesData.get(candle) as
        | { open: number; high: number; low: number; close: number }
        | undefined
      if (!c) {
        setHover(null)
        return
      }
      const change = c.close - c.open
      const changePercent = (change / c.open) * 100
      setHover({ ...c, change, changePercent })
    })

    return () => {
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
      maSeriesRef.current = null
      bbUpperRef.current = null
      bbLowerRef.current = null
      bbMidRef.current = null
      rsiSeriesRef.current = null
      macdLineRef.current = null
      macdSignalRef.current = null
      macdHistRef.current = null
    }
  }, [])

  const dataset = useMemo(() => {
    if (!historyData?.data || historyData.symbol !== symbol) return null
    const points: StockHistoryPointDto[] = historyData.data.filter(
      (d) => d.open && d.high && d.low && d.close,
    )
    if (!points.length) return null
    const times = points.map(
      (d) => (new Date(d.date).getTime() / 1000) as Time,
    )
    const closes = points.map((d) => d.close)
    const ma20 = sma(closes, 20)
    const std20 = stddev(closes, 20, ma20)
    const rsiArr = rsi(closes, 14)
    const macdRes = macd(closes)
    return { points, times, closes, ma20, std20, rsiArr, macdRes }
  }, [historyData, symbol])

  useEffect(() => {
    const chart = chartRef.current
    const candle = candleSeriesRef.current
    if (!chart || !candle || !dataset) return

    const { points, times, ma20, std20, rsiArr, macdRes } = dataset

    candle.setData(
      points.map((d, i) => ({
        time: times[i],
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })),
    )

    if (activeIndicators.has("vol")) {
      if (!volumeSeriesRef.current) {
        const v = chart.addSeries(HistogramSeries, {
          priceFormat: { type: "volume" },
          priceScaleId: "volume",
        })
        v.priceScale().applyOptions({
          scaleMargins: { top: 0.85, bottom: 0 },
        })
        volumeSeriesRef.current = v
      }
      volumeSeriesRef.current.setData(
        points.map((d, i) => ({
          time: times[i],
          value: d.volume,
          color:
            d.close >= d.open
              ? "rgba(239,68,68,0.5)"
              : "rgba(34,197,94,0.5)",
        })),
      )
    } else if (volumeSeriesRef.current) {
      chart.removeSeries(volumeSeriesRef.current)
      volumeSeriesRef.current = null
    }

    if (activeIndicators.has("ma")) {
      if (!maSeriesRef.current) {
        maSeriesRef.current = chart.addSeries(LineSeries, {
          color: "#fbbf24",
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        })
      }
      maSeriesRef.current.setData(
        ma20
          .map((v, i) => (v == null ? null : { time: times[i], value: v }))
          .filter(Boolean) as { time: Time; value: number }[],
      )
    } else if (maSeriesRef.current) {
      chart.removeSeries(maSeriesRef.current)
      maSeriesRef.current = null
    }

    if (activeIndicators.has("bb")) {
      const upper = ma20
        .map((m, i) =>
          m != null && std20[i] != null
            ? { time: times[i], value: m + 2 * (std20[i] as number) }
            : null,
        )
        .filter(Boolean) as { time: Time; value: number }[]
      const lower = ma20
        .map((m, i) =>
          m != null && std20[i] != null
            ? { time: times[i], value: m - 2 * (std20[i] as number) }
            : null,
        )
        .filter(Boolean) as { time: Time; value: number }[]
      const mid = ma20
        .map((v, i) => (v == null ? null : { time: times[i], value: v }))
        .filter(Boolean) as { time: Time; value: number }[]

      if (!bbUpperRef.current) {
        bbUpperRef.current = chart.addSeries(LineSeries, {
          color: "#06b6d4",
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        })
      }
      if (!bbLowerRef.current) {
        bbLowerRef.current = chart.addSeries(LineSeries, {
          color: "#06b6d4",
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        })
      }
      if (!bbMidRef.current) {
        bbMidRef.current = chart.addSeries(LineSeries, {
          color: "rgba(6,182,212,0.5)",
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        })
      }
      bbUpperRef.current.setData(upper)
      bbLowerRef.current.setData(lower)
      bbMidRef.current.setData(mid)
    } else {
      if (bbUpperRef.current) {
        chart.removeSeries(bbUpperRef.current)
        bbUpperRef.current = null
      }
      if (bbLowerRef.current) {
        chart.removeSeries(bbLowerRef.current)
        bbLowerRef.current = null
      }
      if (bbMidRef.current) {
        chart.removeSeries(bbMidRef.current)
        bbMidRef.current = null
      }
    }

    if (activeIndicators.has("rsi")) {
      if (!rsiSeriesRef.current) {
        rsiSeriesRef.current = chart.addSeries(
          LineSeries,
          {
            color: "#a855f7",
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: true,
          },
          1,
        )
      }
      rsiSeriesRef.current.setData(
        rsiArr
          .map((v, i) => (v == null ? null : { time: times[i], value: v }))
          .filter(Boolean) as { time: Time; value: number }[],
      )
    } else if (rsiSeriesRef.current) {
      chart.removeSeries(rsiSeriesRef.current)
      rsiSeriesRef.current = null
    }

    if (activeIndicators.has("macd")) {
      const paneIdx = activeIndicators.has("rsi") ? 2 : 1
      if (!macdLineRef.current) {
        macdLineRef.current = chart.addSeries(
          LineSeries,
          {
            color: "#3b82f6",
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: false,
          },
          paneIdx,
        )
      }
      if (!macdSignalRef.current) {
        macdSignalRef.current = chart.addSeries(
          LineSeries,
          {
            color: "#f97316",
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: false,
          },
          paneIdx,
        )
      }
      if (!macdHistRef.current) {
        macdHistRef.current = chart.addSeries(
          HistogramSeries,
          { priceLineVisible: false, lastValueVisible: false },
          paneIdx,
        )
      }
      macdLineRef.current.setData(
        macdRes.macd
          .map((v, i) => (v == null ? null : { time: times[i], value: v }))
          .filter(Boolean) as { time: Time; value: number }[],
      )
      macdSignalRef.current.setData(
        macdRes.signal
          .map((v, i) => (v == null ? null : { time: times[i], value: v }))
          .filter(Boolean) as { time: Time; value: number }[],
      )
      macdHistRef.current.setData(
        macdRes.hist
          .map((v, i) =>
            v == null
              ? null
              : {
                  time: times[i],
                  value: v,
                  color:
                    v >= 0 ? "rgba(239,68,68,0.6)" : "rgba(34,197,94,0.6)",
                },
          )
          .filter(Boolean) as { time: Time; value: number; color: string }[],
      )
    } else {
      if (macdLineRef.current) {
        chart.removeSeries(macdLineRef.current)
        macdLineRef.current = null
      }
      if (macdSignalRef.current) {
        chart.removeSeries(macdSignalRef.current)
        macdSignalRef.current = null
      }
      if (macdHistRef.current) {
        chart.removeSeries(macdHistRef.current)
        macdHistRef.current = null
      }
    }

    chart.timeScale().fitContent()
  }, [dataset, activeIndicators])

  const toggleIndicator = (key: IndicatorKey) => {
    setActiveIndicators((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleReload = () => {
    dispatch({ type: "CLEAR_STOCK_HISTORY" })
    dispatch({ type: "GET_STOCK_HISTORY", symbol, period: activePeriod })
  }

  const isLoading = !historyData || historyData.symbol !== symbol
  const isUp = hover ? hover.change >= 0 : true

  return (
    <div className={styles.container}>
      <div className={styles.toolbarRow}>
        <div className={styles.section}>
          <span className={styles.sectionLabel}>週期</span>
          <div className={styles.btnGroup}>
            {PERIODS.map((p) => (
              <button
                key={p.key}
                className={`${styles.btn} ${activePeriod === p.key ? styles.active : ""}`}
                onClick={() => setActivePeriod(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>指標</span>
          <div className={styles.btnGroup}>
            {INDICATORS.map((i) => (
              <button
                key={i.key}
                className={`${styles.btn} ${activeIndicators.has(i.key) ? styles.active : ""}`}
                onClick={() => toggleIndicator(i.key)}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>

        <button className={styles.reloadBtn} onClick={handleReload}>
          ↻ 重新載入
        </button>
      </div>

      <div className={styles.infoBar}>
        <span className={styles.stockTag}>
          {stockName ?? symbol} · {symbol}
        </span>
        {hover ? (
          <div className={styles.ohlc}>
            <span>
              開=
              <span className={isUp ? styles.upText : styles.downText}>
                {hover.open.toFixed(2)}
              </span>
            </span>
            <span>
              高=
              <span className={isUp ? styles.upText : styles.downText}>
                {hover.high.toFixed(2)}
              </span>
            </span>
            <span>
              低=
              <span className={isUp ? styles.upText : styles.downText}>
                {hover.low.toFixed(2)}
              </span>
            </span>
            <span>
              收=
              <span className={isUp ? styles.upText : styles.downText}>
                {hover.close.toFixed(2)}
              </span>
            </span>
            <span className={isUp ? styles.upText : styles.downText}>
              {hover.change >= 0 ? "+" : ""}
              {hover.change.toFixed(2)} ({hover.change >= 0 ? "+" : ""}
              {hover.changePercent.toFixed(2)}%)
            </span>
          </div>
        ) : (
          <span className={styles.hint}>移動滑鼠查看 K 棒詳情</span>
        )}
      </div>

      <div className={styles.chartArea}>
        {isLoading && <div className={styles.loadingMask}>載入中...</div>}
        <div ref={containerRef} className={styles.chart} />
      </div>
    </div>
  )
}
