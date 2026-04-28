"use client";

import { memo, useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol: string;
  theme?: "light" | "dark";
  height?: number | string;
}

function getTradingViewSymbol(code: string): string {
  if (/^\d{4,6}$/.test(code)) return `TWSE:${code}`;
  return code;
}

export const TradingViewChart = memo(function TradingViewChart({
  symbol,
  theme = "dark",
  height = "100%",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    container.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: getTradingViewSymbol(symbol),
      interval: "D",
      timezone: "Asia/Taipei",
      theme,
      style: "1",
      locale: "zh_TW",
      allow_symbol_change: true,
      calendar: false,
      studies: ["STD;Bollinger_Bands"],
      support_host: "https://www.tradingview.com",
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol, theme]);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      style={{ height, width: "100%" }}
    />
  );
});
