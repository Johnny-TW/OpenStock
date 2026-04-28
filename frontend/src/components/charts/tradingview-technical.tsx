"use client";

import { memo, useEffect, useRef } from "react";

interface TradingViewTechnicalProps {
  symbol: string;
  theme?: "light" | "dark";
  height?: number;
}

function getTradingViewSymbol(code: string): string {
  if (/^\d{4,6}$/.test(code)) return `TWSE:${code}`;
  return code;
}

export const TradingViewTechnical = memo(function TradingViewTechnical({
  symbol,
  theme = "dark",
  height = 425,
}: TradingViewTechnicalProps) {
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
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: "1D",
      width: "100%",
      isTransparent: true,
      height: "100%",
      symbol: getTradingViewSymbol(symbol),
      showIntervalTabs: true,
      displayMode: "single",
      locale: "zh_TW",
      colorTheme: theme,
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
