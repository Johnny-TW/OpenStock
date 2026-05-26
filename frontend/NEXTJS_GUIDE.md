# Next.js 新手學習指南 — 以 StockSmart 專案為例

> 這份文件用這個專案的「真實程式碼」帶你走一遍 Next.js 15 的核心觀念，從零開始到能自己寫出完整的頁面。

---

## 目錄

1. [Next.js 是什麼？](#1-nextjs-是什麼)
2. [專案架構總覽](#2-專案架構總覽)
3. [常用指令](#3-常用指令)
4. [核心概念：App Router](#4-核心概念app-router)
5. [Server Component vs Client Component](#5-server-component-vs-client-component)
6. [頁面開發流程（完整範例）](#6-頁面開發流程完整範例)
7. [資料取得：React Query](#7-資料取得react-query)
8. [API 呼叫：api-client.ts](#8-api-呼叫api-clientts)
9. [樣式：SCSS Module + Tailwind](#9-樣式scss-module--tailwind)
10. [元件設計](#10-元件設計)
11. [Provider 架構](#11-provider-架構)
12. [認證流程](#12-認證流程)
13. [Middleware 路由保護](#13-middleware-路由保護)
14. [動態路由（個股詳情頁）](#14-動態路由個股詳情頁)
15. [常見模式速查](#15-常見模式速查)

---

## 1. Next.js 是什麼？

Next.js 是一個基於 React 的全端框架，由 Vercel 開發。它解決了純 React 做不到的事：

| 純 React（CRA / Vite） | Next.js |
|------------------------|---------|
| 只有前端 | 前端 + API Route（全端） |
| 手動設定路由（react-router） | **檔案即路由**（放檔案就有路由） |
| 全部 Client Side Rendering | **Server Component**（預設伺服器渲染）|
| 手動處理 SEO | 內建 SEO、Metadata |
| 手動設定 code splitting | 自動 code splitting |

**一句話總結**：Next.js 就是「約定大於配置」的 React — 你只需要把檔案放對位置，其他它幫你處理。

---

## 2. 專案架構總覽

```
frontend/
├── next.config.ts              ← Next.js 設定檔
├── package.json
├── tsconfig.json
├── public/                     ← 靜態資源（圖片、favicon）
│
└── src/
    ├── middleware.ts            ← 路由守衛（檢查登入狀態）
    │
    ├── app/                    ← App Router（頁面路由）
    │   ├── layout.tsx          ← 全域 Layout（Provider 們都在這）
    │   ├── page.tsx            ← 首頁 /（自動 redirect 到 /stock）
    │   │
    │   ├── login/              ← /login 登入頁
    │   │   └── page.tsx
    │   │
    │   ├── stock/              ← /stock 主要功能區
    │   │   ├── page.tsx              ← /stock 首頁
    │   │   ├── stock-client.tsx      ← 首頁的 Client Component
    │   │   │
    │   │   ├── valuation/            ← /stock/valuation
    │   │   │   ├── page.tsx
    │   │   │   └── valuation-client.tsx
    │   │   │
    │   │   ├── news/                 ← /stock/news
    │   │   │   ├── page.tsx
    │   │   │   ├── news-client.tsx
    │   │   │   └── page.module.scss
    │   │   │
    │   │   ├── heatmap/              ← /stock/heatmap
    │   │   ├── ranking/              ← /stock/ranking
    │   │   ├── analysis/             ← /stock/analysis
    │   │   ├── market-overview/      ← /stock/market-overview
    │   │   │
    │   │   └── [symbol]/             ← /stock/2330（動態路由）
    │   │       ├── page.tsx
    │   │       ├── stock-detail-client.tsx
    │   │       └── page.module.scss
    │   │
    │   └── api/                ← NextAuth API Route
    │       └── auth/
    │
    ├── components/             ← 共用元件
    │   ├── ui/                 ← shadcn/ui 基礎元件
    │   ├── commons/            ← 通用業務元件
    │   ├── charts/             ← 圖表元件
    │   ├── data-table/         ← 資料表格元件
    │   └── layouts/            ← 側邊欄、導覽列
    │
    ├── hooks/                  ← React Query 自訂 Hooks
    │   ├── use-stock-query.ts
    │   ├── use-watchlist-query.ts
    │   └── use-analysis-query.ts
    │
    ├── lib/                    ← 工具函式
    │   └── api-client.ts       ← axios 封裝（自動帶 JWT）
    │
    ├── providers/              ← Context Provider
    │   ├── SessionProvider.tsx
    │   ├── QueryProvider.tsx
    │   ├── AuthSync.tsx
    │   └── PermissionGuard.tsx
    │
    ├── type/                   ← TypeScript 型別定義
    ├── styles/                 ← 全域樣式
    └── server/                 ← NextAuth 設定
        └── auth.jsx
```

### 每個頁面的標準結構

```
stock/功能名稱/
├── page.tsx                ← 路由入口（通常只有一行：引入 Client Component）
├── 功能名稱-client.tsx     ← 頁面主體（"use client"，所有邏輯在這）
└── page.module.scss        ← 頁面專用樣式（選用）
```

---

## 3. 常用指令

```bash
# 安裝依賴
pnpm install

# 開發模式（hot reload）
pnpm dev          # 啟動在 http://localhost:3003

# 正式建置
pnpm build        # 產出 .next/ 資料夾

# 啟動正式版
pnpm start

# 型別檢查
pnpm exec tsc --noEmit

# Lint
pnpm lint

# 新增 shadcn/ui 元件
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add table
```

---

## 4. 核心概念：App Router

Next.js 15 使用 **App Router**，核心規則就一條：

> **資料夾結構 = URL 路由**

| 檔案路徑 | 對應的 URL |
|----------|-----------|
| `app/page.tsx` | `/` |
| `app/stock/page.tsx` | `/stock` |
| `app/stock/valuation/page.tsx` | `/stock/valuation` |
| `app/stock/news/page.tsx` | `/stock/news` |
| `app/stock/[symbol]/page.tsx` | `/stock/2330`、`/stock/2317`（動態） |
| `app/login/page.tsx` | `/login` |

### 特殊檔案名稱

| 檔案名稱 | 功能 |
|----------|------|
| `page.tsx` | 該路徑的頁面內容（**必須**有這個才算一個路由） |
| `layout.tsx` | 共用佈局（不會隨路由切換重新渲染） |
| `loading.tsx` | 載入中的 UI（Suspense fallback） |
| `error.tsx` | 錯誤邊界 |
| `not-found.tsx` | 404 頁面 |

### 本專案的路由結構

```
/                           → redirect 到 /stock
/login                      → 登入頁
/stock                      → 當日成交總覽（首頁）
/stock/market-overview      → 大盤總覽
/stock/valuation            → 本益比 / 殖利率
/stock/ranking              → 排行榜
/stock/heatmap              → 產業熱力圖
/stock/news                 → 財經新聞
/stock/analysis             → AI 分析
/stock/2330                 → 台積電個股詳情（動態路由）
```

---

## 5. Server Component vs Client Component

這是 Next.js 15 最重要的觀念：

| | Server Component（預設） | Client Component |
|---|---|---|
| 宣告方式 | 不需要加任何東西 | 檔案開頭加 `"use client"` |
| 執行在哪 | 伺服器端 | 瀏覽器端 |
| 能用 Hooks 嗎 | ❌ 不能 | ✅ 可以（useState, useEffect...） |
| 能用事件嗎 | ❌ 不能（onClick, onChange...） | ✅ 可以 |
| SEO | ✅ 有利（HTML 在伺服器產生） | ❌ 需要額外處理 |
| 適合做什麼 | 資料取得、版面結構 | 互動 UI、表單、圖表 |

### 本專案的做法

```tsx
// page.tsx — Server Component（不加 "use client"）
// 只負責路由入口，不放邏輯
import StockClient from "./stock-client";

export default function StockPage() {
  return <StockClient />;
}
```

```tsx
// stock-client.tsx — Client Component
"use client";  // ← 這行就是關鍵！

import { useState } from "react";  // 可以用 Hooks 了
import { useStockDailyAll } from "@/hooks/use-stock-query";

export default function StockClient() {
  const { data, isLoading } = useStockDailyAll();  // React Query Hook
  // ... 互動邏輯
}
```

**為什麼要分開？**

- `page.tsx` 是 Server Component，Next.js 可以在伺服器端預渲染
- 需要互動（useState、useEffect、onClick）的邏輯放在 `*-client.tsx`
- 這樣能同時享有 SSR 的 SEO 優勢和 Client 端的互動性

---

## 6. 頁面開發流程（完整範例）

假設你要新增一個「排行榜」頁面 `/stock/ranking`：

### 步驟 1：建立資料夾和檔案

```bash
mkdir -p src/app/stock/ranking
touch src/app/stock/ranking/page.tsx
touch src/app/stock/ranking/ranking-client.tsx
touch src/app/stock/ranking/page.module.scss   # 如果需要樣式
```

### 步驟 2：寫 page.tsx（路由入口）

```tsx
// src/app/stock/ranking/page.tsx
import RankingClient from "./ranking-client";

export default function RankingPage() {
  return <RankingClient />;
}
```

### 步驟 3：寫 Client Component（主要邏輯）

```tsx
// src/app/stock/ranking/ranking-client.tsx
"use client";

import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/commons/page-header/page-header";
import { useRevenueRanking } from "@/hooks/use-stock-query";

export default function RankingClient() {
  // 1. 用 React Query Hook 取得資料
  const { data: ranking, isLoading } = useRevenueRanking();

  // 2. Loading 狀態
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const list = ranking?.data ?? [];

  // 3. 渲染 UI
  return (
    <div className="space-y-4 p-4">
      <PageHeader title="排行榜" subtitle={`共 ${list.length} 檔`} />
      {/* 放你的表格或卡片 */}
    </div>
  );
}
```

### 步驟 4：確保有對應的 React Query Hook

```tsx
// src/hooks/use-stock-query.ts（已存在，新增一個 export）
export function useRevenueRanking() {
  return useQuery({
    queryKey: ["stock", "ranking", "revenue"],
    queryFn: () => fetchAPI<RevenueRankingResponse>("stock/ranking/revenue"),
    staleTime: 30 * 60 * 1000,  // 30 分鐘
  });
}
```

### 完成！

瀏覽器打開 `http://localhost:3003/stock/ranking` 就能看到了。

---

## 7. 資料取得：React Query

本專案使用 **TanStack React Query** 管理所有 API 資料。它幫你處理：

- ✅ 載入狀態（isLoading）
- ✅ 錯誤處理（isError）
- ✅ 自動快取（不重複請求）
- ✅ 背景重新取得（staleTime 過後自動刷新）
- ✅ 樂觀更新（mutation）

### 查詢（讀取資料）— useQuery

```tsx
// hooks/use-stock-query.ts

import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api-client";

export function useStockDailyAll() {
  return useQuery({
    queryKey: ["stock", "daily-all"],  // 快取的唯一 key
    queryFn: () => fetchAPI<StockDailyAllResponse>("stock/daily-all"),
    staleTime: 5 * 60 * 1000,  // 5 分鐘內不重新請求
  });
}
```

在元件中使用：

```tsx
const { data, isLoading, isError, error } = useStockDailyAll();
```

### 變異（寫入資料）— useMutation

```tsx
// hooks/use-watchlist-query.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAPI } from "@/lib/api-client";
import { toast } from "sonner";

export function useAddWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    // 呼叫 API
    mutationFn: (data: { stockNo: string; stockName: string }) =>
      postAPI("watchlist", data),

    // 成功後：讓 watchlist 快取失效 → 自動重新取得最新資料
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(`已加入自選股：${variables.stockName}`);
    },

    // 失敗時
    onError: () => {
      toast.error("加入自選股失敗");
    },
  });
}
```

在元件中使用：

```tsx
const addWatchlist = useAddWatchlist();

// 點擊按鈕時觸發
<button onClick={() => addWatchlist.mutate({ stockNo: "2330", stockName: "台積電" })}>
  加入自選
</button>
```

### React Query 資料流

```
元件 mount
    │
    ▼
useQuery("stock/daily-all")
    │
    ├── 快取中有且未過期？ → ✅ 直接回傳快取資料
    │
    └── 快取沒有或已過期？ → 🔄 呼叫 fetchAPI() → 存入快取 → 回傳
                                                         │
                              staleTime 過後 ─────────────┘（背景重新取得）
```

---

## 8. API 呼叫：api-client.ts

所有 API 請求都透過 `src/lib/api-client.ts`：

```tsx
// src/lib/api-client.ts

import axios from "axios";

let cachedToken: string | null = null;

// AuthSync 元件會呼叫這個，把 JWT 存起來
export function setAccessToken(token: string | null) {
  cachedToken = token;
}

// 建立 axios 實例
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST,  // http://localhost:3004
  timeout: 300000,
});

// 請求攔截器：自動帶上 Authorization header
api.interceptors.request.use((config) => {
  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
  }
  return config;
});

// 封裝的 HTTP 方法
export async function fetchAPI<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<{ success: boolean; data: T }>(path, { params });
  return data.data;  // 自動解包 { success, data } 只回傳 data
}

export async function postAPI<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await api.post<{ success: boolean; data: T }>(path, body);
  return data.data;
}

export async function patchAPI<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await api.patch<{ success: boolean; data: T }>(path, body);
  return data.data;
}

export async function deleteAPI<T>(path: string): Promise<T> {
  const { data } = await api.delete<{ success: boolean; data: T }>(path);
  return data.data;
}
```

**重點**：
- `baseURL` 指向後端 `http://localhost:3004`
- 每次請求自動帶 `Authorization: Bearer <JWT>`
- 回傳值自動解包，`fetchAPI<T>()` 直接回傳 `T` 型別的資料

---

## 9. 樣式：SCSS Module + Tailwind

本專案混用兩種樣式方案：

### SCSS Module（頁面級樣式）

```scss
/* page.module.scss */
.container {
  padding: 1rem;
}

.newsCard {
  display: flex;
  gap: 1rem;
  padding: 0.875rem;
  border-radius: 0.5rem;
  background: hsl(var(--card));

  &:hover {
    border-color: hsl(var(--primary));
  }
}
```

在元件中使用：

```tsx
import styles from "./page.module.scss";

export default function NewsClient() {
  return (
    <div className={styles.container}>
      <div className={styles.newsCard}>...</div>
    </div>
  );
}
```

**優點**：CSS 類名自動加 hash，不會跟其他檔案衝突。

### Tailwind CSS（通用/快速樣式）

```tsx
// 直接在 className 寫 Tailwind
<div className="flex h-[60vh] items-center justify-center">
  <span className="ml-2 text-muted-foreground">載入資料中...</span>
</div>
```

### 使用原則

| 場景 | 用什麼 |
|------|--------|
| 頁面佈局、複雜樣式 | SCSS Module |
| 簡單的 flex、spacing、color | Tailwind CSS |
| 元件庫（shadcn/ui） | Tailwind CSS |

---

## 10. 元件設計

### 元件存放位置

```
src/components/
├── ui/            ← shadcn/ui 元件（Button, Dialog, Table...）
│                     ⚠️ 不要手動修改這些，用 CLI 新增
├── commons/       ← 通用業務元件
│   ├── page-header/
│   ├── section-header/
│   ├── top-news/
│   └── market-index-chart/
├── charts/        ← 圖表元件
│   ├── lightweight-chart.tsx
│   └── stock-history-chart.tsx
├── data-table/    ← 資料表格
│   └── stock/data-table.tsx
└── layouts/       ← 佈局元件（側邊欄、導覽列）
```

### 元件範例 — PageHeader

```tsx
// src/components/commons/page-header/page-header.tsx
import type { ReactNode } from "react";
import styles from "./page-header.module.scss";

interface PageHeaderProps {
  title: string;
  subtitle: ReactNode;
  controls?: ReactNode;
}

export function PageHeader({ title, subtitle, controls }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>
          <span className={styles.titleBar} />
          {title}
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      {controls && <div className={styles.controls}>{controls}</div>}
    </div>
  );
}
```

**元件設計原則**：
1. 每個元件一個獨立檔案
2. 用 TypeScript `interface` 定義 props
3. 優先使用 shadcn/ui 已有的元件
4. 業務元件放 `commons/`，基礎元件用 `ui/`

---

## 11. Provider 架構

`layout.tsx` 裡的 Provider 是**由外往內**包裹整個應用：

```tsx
// src/app/layout.tsx
<body>
  <SessionProvider>          {/* 1. NextAuth Session */}
    <QueryProvider>          {/* 2. React Query */}
      <AuthSync />           {/* 3. 同步 JWT 到 api-client */}
      <DialogProvider>       {/* 4. Toast 通知 */}
        <PermissionGuard>    {/* 5. 權限檢查 */}
          <AuthLayout>       {/* 6. 側邊欄 + 導覽列 */}
            {children}       {/* ← 頁面內容渲染在這 */}
          </AuthLayout>
        </PermissionGuard>
      </DialogProvider>
    </QueryProvider>
  </SessionProvider>
</body>
```

| Provider | 職責 |
|----------|------|
| **SessionProvider** | 提供 `useSession()` Hook，管理登入狀態 |
| **QueryProvider** | 提供 React Query 的 `QueryClient`，管理 API 快取 |
| **AuthSync** | 監聽 session 變化，把 JWT 存到 `api-client` 模組 |
| **DialogProvider** | 提供 Toast 通知（sonner） |
| **PermissionGuard** | 未登入時導向 `/login` |
| **AuthLayout** | 共用佈局（側邊欄 + 頂部導覽列） |

---

## 12. 認證流程

```
使用者點擊登入
    ↓
Azure AD 登入頁（Microsoft）
    ↓
登入成功 → NextAuth 收到 OAuth Token
    ↓
session callback → 用 JWT_SECRET 自簽 JWT（3h）
    ↓
AuthSync 元件 → setAccessToken(jwt) 存到 api-client
    ↓
之後所有 API 請求自動帶 Authorization: Bearer <jwt>
    ↓
後端 AuthGuard 用同一把 JWT_SECRET 驗證
```

### 前端相關檔案

| 檔案 | 職責 |
|------|------|
| `src/server/auth.jsx` | NextAuth 設定（Azure AD Provider + JWT 簽發） |
| `src/providers/SessionProvider.tsx` | 包裹 `NextAuthSessionProvider` |
| `src/providers/AuthSync.tsx` | 同步 token 到 api-client |
| `src/lib/api-client.ts` | axios interceptor 自動帶 token |
| `src/middleware.ts` | 路由守衛（沒 session cookie 就導向 /login） |

---

## 13. Middleware 路由保護

```tsx
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公開頁面：直接放行
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) return NextResponse.next();

  // 檢查 session cookie 是否存在
  const baseName = process.env.SESSION_TOKEN_NAME ?? "next-auth.session-token";
  const hasSession = request.cookies.has(baseName);

  // 沒有 session → 導向登入頁
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// 設定 middleware 要攔截哪些路徑
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)"],
};
```

**Middleware 是什麼？** 它在每個請求到達頁面之前先執行，適合做認證檢查、重導向、i18n 等邏輯。

---

## 14. 動態路由（個股詳情頁）

用 `[symbol]` 資料夾名稱表示動態路由：

```
app/stock/[symbol]/
├── page.tsx                    ← /stock/2330、/stock/2317...
├── stock-detail-client.tsx
└── page.module.scss
```

### page.tsx — 從 URL 取得參數

```tsx
// app/stock/[symbol]/page.tsx
import StockDetailClient from "./stock-detail-client";

interface PageProps {
  params: Promise<{ symbol: string }>;  // Next.js 15 的 params 是 Promise
}

export default async function StockDetailPage({ params }: PageProps) {
  const { symbol } = await params;  // 取出 URL 中的 symbol（如 "2330"）
  return <StockDetailClient symbol={symbol} />;
}
```

### Client Component — 用 symbol 取資料

```tsx
// stock-detail-client.tsx
"use client";

import { useStockDetail, useStockHistory } from "@/hooks/use-stock-query";

export default function StockDetailClient({ symbol }: { symbol: string }) {
  const { data: detail } = useStockDetail(symbol);   // GET /stock/detail?symbol=2330
  const { data: history } = useStockHistory(symbol);  // GET /stock/history?symbol=2330

  return (
    <div>
      <h1>{detail?.name} ({symbol})</h1>
      <p>現價：{detail?.price}</p>
      {/* K 線圖、基本面資料... */}
    </div>
  );
}
```

---

## 15. 常見模式速查

### 新增一個頁面

```bash
# 1. 建資料夾
mkdir src/app/stock/my-feature

# 2. 建三個檔案
# page.tsx, my-feature-client.tsx, page.module.scss（選用）
```

### 新增一個 API Hook

```tsx
// 在 src/hooks/use-stock-query.ts 新增
export function useMyData() {
  return useQuery({
    queryKey: ["my", "data"],
    queryFn: () => fetchAPI<MyDataType>("stock/my-endpoint"),
    staleTime: 5 * 60 * 1000,
  });
}
```

### 新增一個共用元件

```bash
# 在 src/components/commons/ 下建立
touch src/components/commons/my-component.tsx
```

```tsx
interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

### 新增 shadcn/ui 元件

```bash
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add select
```

### 使用 Toast 通知

```tsx
import { toast } from "sonner";

toast.success("操作成功！");
toast.error("發生錯誤");
toast.info("提示訊息");
```

### 使用 Loading 狀態

```tsx
import { Loader2 } from "lucide-react";

if (isLoading) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">載入資料中...</span>
    </div>
  );
}
```

### @/ 路徑別名

```tsx
// tsconfig.json 裡設定了 @ = src/
import { fetchAPI } from "@/lib/api-client";        // = src/lib/api-client
import { PageHeader } from "@/components/commons/page-header/page-header";
import { useStockDailyAll } from "@/hooks/use-stock-query";
```

---

## 附錄：技術棧對照表

| 用途 | 技術 | 在哪裡用 |
|------|------|----------|
| 框架 | Next.js 15 | 整個前端 |
| UI 庫 | React 19 | 整個前端 |
| 語言 | TypeScript | 整個前端 |
| 元件庫 | shadcn/ui | `src/components/ui/` |
| 狀態管理 | TanStack React Query | `src/hooks/` |
| 表格 | TanStack React Table | `src/components/data-table/` |
| 表單 | react-hook-form | 持股管理等表單 |
| 圖表 | Recharts + Lightweight Charts | `src/components/charts/` |
| 熱力圖 | D3.js | 產業熱力圖 |
| 樣式 | SCSS Module + Tailwind CSS | 各頁面 |
| 認證 | NextAuth + Azure AD | `src/server/auth.jsx` |
| HTTP | axios | `src/lib/api-client.ts` |
| Toast | sonner | 全域 |
| Lint | Biome | 根目錄 `biome.json` |
| 測試 | Playwright | `e2e/` |
