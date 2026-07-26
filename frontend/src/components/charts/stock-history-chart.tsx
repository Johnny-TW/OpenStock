"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStockHistory } from "@/hooks/use-stock-query";
import type { StockHistoryPointDto, StockHistoryResponse } from "@/type/stock";
import styles from "./stock-history-chart.module.scss";

const PERIODS = [
  { key: "1d", label: "1天" },
  { key: "5d", label: "5天" },
  { key: "1m", label: "1月" },
  { key: "3m", label: "3月" },
  { key: "6m", label: "6月" },
  { key: "1y", label: "1年" },
  { key: "5y", label: "5年" },
  { key: "all", label: "全部" },
] as const;

interface StockHistoryChartProps {
  symbol: string;
}

function formatDate(dateStr: string, period: string): string {
  const d = new Date(dateStr);
  if (period === "1d" || period === "5d") {
    return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }
  if (period === "1m" || period === "3m" || period === "6m") {
    return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
  }
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

function CustomTooltip({ active, payload, label, period }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as StockHistoryPointDto;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>{formatDate(d.date, period)}</p>
      <div className={styles.tooltipGrid}>
        <span>開</span>
        <span className={styles.tooltipVal}>{d.open}</span>
        <span>高</span>
        <span className={styles.tooltipVal}>{d.high}</span>
        <span>低</span>
        <span className={styles.tooltipVal}>{d.low}</span>
        <span>收</span>
        <span className={styles.tooltipVal}>{d.close}</span>
        <span>量</span>
        <span className={styles.tooltipVal}>{(d.volume / 1000).toFixed(0)}K</span>
      </div>
    </div>
  );
}

export function StockHistoryChart({ symbol }: StockHistoryChartProps) {
  const [activePeriod, setActivePeriod] = useState("1m");
  const { data: historyData } = useStockHistory(symbol, activePeriod) as {
    data: StockHistoryResponse | undefined;
  };

  const chartData = useMemo(() => {
    if (!historyData?.data) return [];
    return historyData.data.map((d) => ({
      ...d,
      displayDate: formatDate(d.date, activePeriod),
    }));
  }, [historyData, activePeriod]);

  const priceChange = useMemo(() => {
    if (chartData.length < 2) return { value: 0, percent: 0 };
    const first = chartData[0].close;
    const last = chartData[chartData.length - 1].close;
    const value = last - first;
    const percent = (value / first) * 100;
    return { value: Math.round(value * 100) / 100, percent: Math.round(percent * 100) / 100 };
  }, [chartData]);

  const isPositive = priceChange.value >= 0;
  const strokeColor = isPositive ? "#ef4444" : "#22c55e";
  const _fillColor = isPositive ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)";

  const [minPrice, maxPrice] = useMemo(() => {
    if (!chartData.length) return [0, 0];
    const prices = chartData.map((d) => d.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.05 || 1;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.chartTitle}>歷史走勢</span>
          {chartData.length > 0 && (
            <span className={`${styles.changeTag} ${isPositive ? styles.up : styles.down}`}>
              {isPositive ? "+" : ""}
              {priceChange.value} ({isPositive ? "+" : ""}
              {priceChange.percent}%)
            </span>
          )}
        </div>
        <div className={styles.periodToggle}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              className={`${styles.periodBtn} ${activePeriod === p.key ? styles.active : ""}`}
              onClick={() => setActivePeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!chartData.length ? (
        <div className={styles.loading}>載入中...</div>
      ) : (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(v) => v.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip period={activePeriod} />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#gradient-${symbol})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="displayDate" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip period={activePeriod} />} />
              <Bar
                dataKey="volume"
                fill="var(--muted-foreground)"
                opacity={0.3}
                radius={[1, 1, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
