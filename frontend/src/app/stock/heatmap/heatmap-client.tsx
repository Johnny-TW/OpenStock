"use client"

import { useEffect, useMemo, useCallback, useState, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import * as d3 from "d3"
import { Info, X } from "lucide-react"
import type { HeatmapIndustryDto, HeatmapStockDto } from "@/type/stock"
import { PageHeader } from "@/components/commons/page-header"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import styles from "./page.module.scss"

const getColor = (changePercent: number): string => {
  if (changePercent >= 7) return "#b91c1c"
  if (changePercent >= 4) return "#dc2626"
  if (changePercent >= 2) return "#ef4444"
  if (changePercent >= 0.5) return "#f87171"
  if (changePercent > -0.5) return "#6b7280"
  if (changePercent > -2) return "#4ade80"
  if (changePercent > -4) return "#22c55e"
  if (changePercent > -7) return "#16a34a"
  return "#15803d"
}

const getTextColor = (changePercent: number): string => {
  const absVal = Math.abs(changePercent)
  if (absVal >= 2) return "#ffffff"
  if (absVal >= 0.5) return "#f8fafc"
  return "#e2e8f0"
}

interface StockNode {
  name: string
  code: string
  changePercent: number
  closingPrice: number
  change: string
  tradeVolume: number
  value: number
}

interface IndustryNode {
  name: string
  children: StockNode[]
}

interface HierarchyData {
  name: string
  children: IndustryNode[]
}

type TreemapNode = d3.HierarchyRectangularNode<HierarchyData | IndustryNode | StockNode>

type ViewMode = "all" | "industry"

function D3Treemap({
  data,
  onStockHover,
  onStockLeave,
}: {
  data: HierarchyData
  onStockHover: (stock: StockNode, event: React.MouseEvent) => void
  onStockLeave: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 600 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      if (width > 0) setDimensions({ width, height: 600 })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const root = useMemo((): TreemapNode | null => {
    if (dimensions.width === 0) return null
    const hierarchy = d3
      .hierarchy<HierarchyData | IndustryNode | StockNode>(data)
      .sum((d) => ("value" in d ? (d as StockNode).value : 0))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    return d3.treemap<HierarchyData | IndustryNode | StockNode>()
      .tile(d3.treemapSquarify)
      .size([dimensions.width, dimensions.height])
      .paddingTop(22)
      .paddingRight(1)
      .paddingBottom(1)
      .paddingLeft(1)
      .paddingInner(2)
      .round(true)(hierarchy)
  }, [data, dimensions])

  const leaves = useMemo((): TreemapNode[] => root?.leaves() ?? [], [root])
  const groups = useMemo((): TreemapNode[] => {
    if (!root) return []
    return root.children ?? []
  }, [root])

  if (dimensions.width === 0) {
    return <div ref={containerRef} style={{ width: "100%", height: 600 }} />
  }

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{ maxWidth: "100%", height: "auto", font: "10px sans-serif" }}
      >
        {groups.map((group) => {
          const d = group.data as IndustryNode
          return (
            <g key={d.name}>
              <rect
                x={group.x0}
                y={group.y0}
                width={group.x1! - group.x0!}
                height={group.y1! - group.y0!}
                fill="#ffffff"
                rx={3}
              />
              <clipPath id={`clip-group-${d.name}`}>
                <rect
                  x={group.x0}
                  y={group.y0}
                  width={group.x1! - group.x0!}
                  height={18}
                />
              </clipPath>
              <text
                clipPath={`url(#clip-group-${d.name})`}
                x={group.x0! + 4}
                y={group.y0! + 14}
                fill="#94a3b8"
                fontSize={11}
                fontWeight={600}
              >
                {d.name}
              </text>
            </g>
          )
        })}
        {leaves.map((leaf) => {
          const d = leaf.data as StockNode
          const x = leaf.x0 ?? 0
          const y = leaf.y0 ?? 0
          const w = (leaf.x1 ?? 0) - x
          const h = (leaf.y1 ?? 0) - y
          if (w < 2 || h < 2) return null
          const color = getColor(d.changePercent)
          const textColor = getTextColor(d.changePercent)
          const showName = w > 40 && h > 22
          const showPercent = w > 35 && h > 36
          const showCode = w > 50 && h > 50
          const fontSize = Math.min(14, Math.max(9, Math.floor(w / 6)))
          const uid = `${d.code}-${d.name}`

          return (
            <g
              key={uid}
              onMouseEnter={(e) => onStockHover(d, e)}
              onMouseLeave={onStockLeave}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={color}
                rx={2}
              />
              {showName && (
                <>
                  <clipPath id={`clip-${uid}`}>
                    <rect x={x} y={y} width={w} height={h} />
                  </clipPath>
                  <text
                    clipPath={`url(#clip-${uid})`}
                    x={x + w / 2}
                    y={y + h / 2 - (showPercent ? (showCode ? 12 : 6) : 0)}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={fontSize}
                    fontWeight="bold"
                  >
                    {d.name}
                  </text>
                </>
              )}
              {showCode && (
                <text
                  clipPath={`url(#clip-${uid})`}
                  x={x + w / 2}
                  y={y + h / 2}
                  textAnchor="middle"
                  fill={textColor}
                  fontSize={Math.max(8, fontSize - 3)}
                  opacity={0.7}
                >
                  {d.code}
                </text>
              )}
              {showPercent && (
                <text
                  clipPath={`url(#clip-${uid})`}
                  x={x + w / 2}
                  y={y + h / 2 + (showCode ? 14 : fontSize - 2)}
                  textAnchor="middle"
                  fill={textColor}
                  fontSize={Math.max(9, fontSize - 2)}
                >
                  {d.changePercent > 0 ? "+" : ""}
                  {d.changePercent.toFixed(2)}%
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function HeatmapClient() {
  const dispatch = useAppDispatch()
  const heatmapData = useAppSelector((state) => state.heatmap?.data)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("all")
  const [topN, setTopN] = useState(15)
  const [tooltip, setTooltip] = useState<{
    stock: StockNode
    x: number
    y: number
  } | null>(null)
  const [infoOpen, setInfoOpen] = useState(false)
  const [period, setPeriod] = useState("1d")

  useEffect(() => {
    dispatch({ type: "GET_HEATMAP", data: period })
  }, [dispatch, period])

  const industries: HeatmapIndustryDto[] = useMemo(() => {
    if (!heatmapData?.data) return []
    return heatmapData.data
  }, [heatmapData])

  const hierarchyData: HierarchyData | null = useMemo(() => {
    if (viewMode === "industry" && selectedIndustry) {
      const industry = industries.find((i) => i.industry === selectedIndustry)
      if (!industry) return null
      return {
        name: "root",
        children: [
          {
            name: industry.industry,
            children: industry.stocks.map((s) => ({
              name: s.name,
              code: s.code,
              changePercent: s.changePercent,
              closingPrice: s.closingPrice,
              change: s.change,
              tradeVolume: s.tradeVolume,
              value: Math.max(s.tradeVolume, 1),
            })),
          },
        ],
      }
    }

    const topIndustries = industries.slice(0, topN)
    if (topIndustries.length === 0) return null

    return {
      name: "root",
      children: topIndustries.map((ind) => ({
        name: ind.industry,
        children: ind.stocks.slice(0, 10).map((s) => ({
          name: s.name,
          code: s.code,
          changePercent: s.changePercent,
          closingPrice: s.closingPrice,
          change: s.change,
          tradeVolume: s.tradeVolume,
          value: Math.max(s.tradeVolume, 1),
        })),
      })),
    }
  }, [industries, viewMode, selectedIndustry, topN])

  const handleStockHover = useCallback(
    (stock: StockNode, event: React.MouseEvent) => {
      setTooltip({ stock, x: event.clientX, y: event.clientY })
    },
    []
  )

  const handleStockLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  const handleIndustryClick = useCallback((industry: string) => {
    setSelectedIndustry(industry)
    setViewMode("industry")
  }, [])

  const handleBackToAll = useCallback(() => {
    setSelectedIndustry(null)
    setViewMode("all")
  }, [])

  const periodOptions = [
    { value: "1d", label: "1日" },
    { value: "1w", label: "1週" },
    { value: "1m", label: "1月" },
    { value: "3m", label: "3月" },
    { value: "1y", label: "1年" },
  ]

  const date = heatmapData?.date ?? ""

  return (
    <div className={styles.container}>
      <PageHeader
        title="產業漲跌熱力圖"
        subtitle={<>依個股成交量決定區塊大小，顏色反映漲跌幅度{date && <span>（資料日期：{date}）</span>}</>}
        controls={
          <div className={styles.controlsRow}>
            <div className={styles.periodToggle}>
              {periodOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.periodBtn} ${period === opt.value ? styles.periodBtnActive : ""}`}
                  onClick={() => setPeriod(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              className={styles.infoBtn}
              onClick={() => setInfoOpen(true)}
              title="查看說明"
            >
              <Info size={16} />
              說明
            </button>
            <select
              className={styles.select}
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
            >
              <option value={10}>前 10 大產業</option>
              <option value={15}>前 15 大產業</option>
              <option value={20}>前 20 大產業</option>
              <option value={30}>全部產業</option>
            </select>
          </div>
        }
      />

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className={styles.infoDialog}>
          <DialogHeader>
            <DialogTitle>市場熱力圖 — 頁面說明</DialogTitle>
          </DialogHeader>
          <p className={styles.infoIntro}>
            本圖表讓您一眼看穿全台股產業當前的資金流向與熱度，透過色塊大小與顏色深淺，快速識別領漲或領跌的關鍵題材。
          </p>
          <ul className={styles.infoList}>
            <li>
              <strong>漲跌視覺化</strong>
              <span>紅色代表上漲，綠色代表下跌，顏色越深強度越高。</span>
            </li>
            <li>
              <strong>成交量權重</strong>
              <span>區塊大小代表該產業下所有個股的加權成交量，成交越活躍區塊越大。</span>
            </li>
            <li>
              <strong>產業鑽取</strong>
              <span>點擊下方產業卡片，可放大檢視該產業內的個股分布。</span>
            </li>
            <li>
              <strong>個股資訊</strong>
              <span>滑鼠移至色塊上，可查看該個股的收盤價、漲跌幅與成交量。</span>
            </li>
          </ul>
          <p className={styles.infoNote}>
            資料來源：臺灣證券交易所 OpenAPI，僅供參考，不構成投資建議。
          </p>
        </DialogContent>
      </Dialog>

      {viewMode === "industry" && selectedIndustry && (
        <div className={styles.breadcrumb}>
          <button onClick={handleBackToAll} className={styles.breadcrumbBtn}>
            全部產業
          </button>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{selectedIndustry}</span>
        </div>
      )}

      <div className={styles.treemapWrapper}>
        {hierarchyData ? (
          <D3Treemap
            data={hierarchyData}
            onStockHover={handleStockHover}
            onStockLeave={handleStockLeave}
          />
        ) : (
          <div className={styles.loading}>載入中...</div>
        )}
      </div>

      {tooltip && (
        <div
          className={styles.tooltip}
          style={{
            position: "fixed",
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          <p className={styles.tooltipTitle}>
            {tooltip.stock.name} ({tooltip.stock.code})
          </p>
          <p className={styles.tooltipRow}>
            收盤價：<span>{tooltip.stock.closingPrice}</span>
          </p>
          <p className={styles.tooltipRow}>
            漲跌：
            <span className={tooltip.stock.changePercent >= 0 ? styles.up : styles.down}>
              {tooltip.stock.change}
            </span>
          </p>
          <p className={styles.tooltipRow}>
            漲跌幅：
            <span className={tooltip.stock.changePercent >= 0 ? styles.up : styles.down}>
              {tooltip.stock.changePercent > 0 ? "+" : ""}
              {tooltip.stock.changePercent.toFixed(2)}%
            </span>
          </p>
          <p className={styles.tooltipRow}>
            成交量：<span>{tooltip.stock.tradeVolume.toLocaleString()} 張</span>
          </p>
        </div>
      )}

      <div className={styles.legend}>
        <span>跌</span>
        <div className={styles.legendBars}>
          <div className={styles.legendBar} style={{ backgroundColor: "#15803d" }} />
          <div className={styles.legendBar} style={{ backgroundColor: "#16a34a" }} />
          <div className={styles.legendBar} style={{ backgroundColor: "#22c55e" }} />
          <div className={styles.legendBar} style={{ backgroundColor: "#4ade80" }} />
          <div className={styles.legendBar} style={{ backgroundColor: "#6b7280" }} />
          <div className={styles.legendBar} style={{ backgroundColor: "#f87171" }} />
          <div className={styles.legendBar} style={{ backgroundColor: "#ef4444" }} />
          <div className={styles.legendBar} style={{ backgroundColor: "#dc2626" }} />
          <div className={styles.legendBar} style={{ backgroundColor: "#b91c1c" }} />
        </div>
        <span>漲</span>
      </div>

      <div className={styles.industryGrid}>
        <div className={styles.industryGridHeader}>
          <span className={styles.titleBar} />
          <h2>產業分類總覽</h2>
        </div>
        <div className={styles.industryCards}>
          {industries.map((ind) => (
            <button
              key={ind.industry}
              className={`${styles.industryCard} ${selectedIndustry === ind.industry ? styles.industryCardActive : ""}`}
              onClick={() => handleIndustryClick(ind.industry)}
            >
              <span className={styles.industryName}>{ind.industry}</span>
              <span
                className={`${styles.industryChange} ${ind.avgChangePercent >= 0 ? styles.up : styles.down}`}
              >
                {ind.avgChangePercent > 0 ? "+" : ""}
                {ind.avgChangePercent.toFixed(2)}%
              </span>
              <span className={styles.industryCount}>
                {ind.stocks.length} 檔
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.attribution}>
        資料來源：
        <a
          href="https://openapi.twse.com.tw"
          target="_blank"
          rel="noopener noreferrer"
        >
          臺灣證券交易所 OpenAPI
        </a>
        ，僅供參考，不構成投資建議。
      </div>
    </div>
  )
}
