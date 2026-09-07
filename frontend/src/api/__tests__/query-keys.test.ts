import { describe, expect, it } from "vitest";
import { analysisKeys, stockKeys, watchlistKeys } from "@/api/query-keys";
import type { StockDailyQuery } from "@/types/stock";

describe("stockKeys", () => {
  it("所有 key 都以 stock 為前綴，方便整批失效", () => {
    const keys = [
      stockKeys.valuation(),
      stockKeys.dailyAll(),
      stockKeys.topMovers(),
      stockKeys.news(),
      stockKeys.heatmap("1d"),
      stockKeys.marketIndex(),
      stockKeys.intraday(),
      stockKeys.indexHistory(),
      stockKeys.topVolume(),
      stockKeys.ranking("revenue"),
      stockKeys.detail("2330"),
      stockKeys.history("2330", "1y"),
    ];

    for (const key of keys) {
      expect(key[0]).toBe("stock");
    }
  });

  it("daily-all 底下的 key 共用同一層前綴", () => {
    expect(stockKeys.topMovers().slice(0, 2)).toEqual(stockKeys.dailyAll());
    expect(stockKeys.dailyByCodes(["2330"]).slice(0, 2)).toEqual(stockKeys.dailyAll());
  });

  it("參數不同會產生不同的 key", () => {
    expect(stockKeys.heatmap("1d")).not.toEqual(stockKeys.heatmap("1w"));
    expect(stockKeys.detail("2330")).not.toEqual(stockKeys.detail("2317"));
    expect(stockKeys.history("2330", "1y")).not.toEqual(stockKeys.history("2330", "5y"));
    expect(stockKeys.ranking("revenue")).not.toEqual(stockKeys.ranking("pe-ratio"));
  });

  it("相同參數會產生相等的 key", () => {
    expect(stockKeys.detail("2330")).toEqual(stockKeys.detail("2330"));
    expect(stockKeys.dailyByCodes(["2330", "2317"])).toEqual(
      stockKeys.dailyByCodes(["2330", "2317"]),
    );
  });

  it("分頁 key 帶入完整查詢條件", () => {
    const query: StockDailyQuery = {
      page: 1,
      pageSize: 20,
      search: "台積",
      industry: "半導體業",
      sortBy: "closingPrice",
      sortDir: "desc",
    };

    expect(stockKeys.dailyPaged(query)).toEqual(["stock", "daily-all", "paged", query]);
    expect(stockKeys.dailyPaged(query)).not.toEqual(stockKeys.dailyPaged({ ...query, page: 2 }));
  });
});

describe("watchlistKeys / analysisKeys", () => {
  it("watchlist 清單 key 落在 watchlist 命名空間", () => {
    expect(watchlistKeys.all).toEqual(["watchlist"]);
    expect(watchlistKeys.list()).toEqual(["watchlist"]);
  });

  it("analysis market key 落在 analysis 命名空間", () => {
    expect(analysisKeys.all).toEqual(["analysis"]);
    expect(analysisKeys.market()).toEqual(["analysis", "market"]);
  });
});
