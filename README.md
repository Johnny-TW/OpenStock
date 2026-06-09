# SS01 StockSmart System — 台灣股市智慧分析平台

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-e0234e?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169e1?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-dc382d?logo=redis)](https://redis.io/)

> 🪧 **這是一個個人 side project**，純粹用來觀看台股、整理行情，並透過 AI 技術幫助自己理解股票波動、新聞與市場脈動。**非商業用途、不對外營利**。

全端 Monorepo 架構的台灣股市分析平台，資料以 **TWSE 證交所 OpenAPI** 為主要來源，整合即時行情、產業熱力圖、AI 智慧選股、自選股管理等功能。

---

## 專案性質與免責聲明

- 🎯 **定位**：個人興趣導向的 side project，用於學習技術與觀察台股，**不作任何商業營利用途**。
- 📡 **資料來源**：股票行情主要透過 **TWSE 證交所 OpenAPI** 公開資料撈取，僅供個人研究與觀看。
- 🤖 **AI 分析**：利用 AI 技術輔助理解股票波動、新聞與市場趨勢，**分析結果僅供參考**。
- ⚠️ **投資風險**：本專案所有內容（含 AI 分析、排行、估值等）**皆非投資建議**，不構成任何買賣依據，投資決策請自行評估、風險自負。

---

## 目錄

- [專案性質與免責聲明](#專案性質與免責聲明)
- [專案架構](#專案架構)
- [技術棧](#技術棧)
- [功能總覽](#功能總覽)
- [快速開始](#快速開始)
- [環境變數](#環境變數)
- [常用指令](#常用指令)
- [資料庫](#資料庫)
- [API 文件](#api-文件)
- [資料來源與撈取流程](#資料來源與撈取流程)
- [快取策略](#快取策略)
- [認證架構](#認證架構)
- [前端頁面路由](#前端頁面路由)
- [前端元件架構](#前端元件架構)
- [部署](#部署)
- [程式碼品質](#程式碼品質)
- [Commit 規範](#commit-規範)

---

## 專案架構

```
nextjs-course-main/
├── frontend/                # Next.js 15 前端應用
│   ├── src/
│   │   ├── app/             # App Router 頁面
│   │   │   ├── stock/       # 主要功能頁面
│   │   │   ├── login/       # 登入頁
│   │   │   └── api/         # NextAuth API Route
│   │   ├── components/      # 共用元件
│   │   │   ├── charts/      # K 線圖、TradingView 圖表
│   │   │   ├── commons/     # 通用 UI 元件
│   │   │   ├── data-table/  # 資料表格（TanStack Table）
│   │   │   └── ui/          # shadcn/ui 元件
│   │   ├── hooks/           # React Query 自訂 Hooks
│   │   ├── lib/             # API Client、工具函式
│   │   ├── providers/       # Context Providers
│   │   └── type/            # TypeScript 型別定義
│   ├── Dockerfile
│   └── package.json
├── backend/                 # NestJS 11 後端 API
│   ├── src/
│   │   ├── stock/           # 股票行情模組（TWSE 資料撈取）
│   │   ├── portfolio/       # 持股管理模組
│   │   ├── watchlist/       # 自選股模組
│   │   ├── analysis/        # AI 分析模組（Claude）
│   │   ├── auth/            # JWT 驗證守衛
│   │   ├── prisma/          # Prisma ORM 模組
│   │   ├── filters/         # 全域例外處理
│   │   └── interceptors/    # 統一回應格式攔截器
│   ├── prisma/
│   │   └── schema.prisma    # 資料庫 Schema
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # 開發環境（PostgreSQL + Redis）
├── docker-compose.qas.yml   # 測試環境
├── docker-compose.prd.yml   # 正式環境
├── biome.json               # Biome Lint & Format 設定
└── package.json             # 根目錄 Monorepo 腳本
```

---

## 技術棧

### 前端

| 技術 | 說明 |
|------|------|
| **Next.js 15** | App Router、Server Components |
| **React 19** | 最新版 React |
| **TypeScript** | 全面型別安全 |
| **TanStack React Query** | 伺服器狀態管理、資料快取 |
| **TanStack React Table** | 高效能資料表格 |
| **shadcn/ui** | 基於 Radix UI 的元件庫 |
| **SCSS + Tailwind CSS** | 混合樣式方案 |
| **Recharts + Lightweight Charts** | 資料視覺化、K 線圖 |
| **D3.js** | 產業熱力圖 Treemap |
| **react-hook-form** | 表單管理 |
| **sonner** | Toast 通知 |
| **NextAuth** | Azure AD 第三方登入 |
| **Playwright** | E2E 測試 |

### 後端

| 技術 | 說明 |
|------|------|
| **NestJS 11** | 企業級 Node.js 框架 |
| **TypeScript** | 全面型別安全 |
| **Prisma** | 型別安全的 ORM（PostgreSQL） |
| **PostgreSQL 15** | 主要資料庫 |
| **Redis 7** | 分散式快取（L2） |
| **cache-manager + Keyv** | 雙層快取（L1 記憶體 + L2 Redis） |
| **@nestjs/jwt** | JWT Token 驗證 |
| **Swagger** | 自動產生 API 文件 |
| **Anthropic Claude** | AI 股市分析引擎 |
| **Yahoo Finance** | 個股基本面與歷史價格 |
| **Jest** | 單元測試 |

---

## 功能總覽

| 功能 | 說明 |
|------|------|
| 📊 **當日成交總覽** | 全部上市股票即時成交量、開高低收、漲跌資訊 |
| 📈 **大盤總覽** | 加權指數走勢圖、盤中即時成交、成交量排行 |
| 💰 **本益比/殖利率** | 全市場估值指標一覽表 |
| 🏆 **排行榜** | 營收、毛利率、殖利率、本益比排行 |
| 🗺️ **產業熱力圖** | D3 Treemap 視覺化產業漲跌分布 |
| 📰 **財經新聞** | 整合台股、美股、國際財經、證交所公告 |
| 🤖 **AI 智慧選股** | Claude AI 分析市場數據，推薦投資標的 |
| ❤️ **自選股管理** | 收藏股票、自訂分組、即時追蹤 |
| 📁 **持股管理** | 記錄買入價、張數、備忘錄 |
| 🔍 **個股詳情** | K 線圖、基本面資料、歷史價格 |

---

## 快速開始

### 前置需求

- **Node.js** >= 20
- **pnpm** >= 9
- **Docker** & **Docker Compose**（用於 PostgreSQL 和 Redis）

### 1. 安裝相依套件

```bash
# 根目錄安裝
pnpm install

# 前後端各自安裝
pnpm install:all
```

### 2. 啟動基礎設施

```bash
# 啟動 PostgreSQL（port 5435）+ Redis（port 6379）
docker compose up -d
```

### 3. 設定環境變數

```bash
# 後端
cp backend/.env.example backend/.env
# 前端
cp frontend/.env.example frontend/.env.local
```

> 詳細說明請參考 [環境變數](#環境變數) 章節。

### 4. 初始化資料庫

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 5. 啟動開發伺服器

```bash
# 同時啟動前後端（根目錄執行）
pnpm dev

# 或分別啟動
pnpm dev:frontend   # http://localhost:3003
pnpm dev:backend    # http://localhost:3004
```

---

## 環境變數

### 後端 `backend/.env`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/stocksmart?schema=public
JWT_SECRET=your-jwt-secret-here
ANTHROPIC_API_KEY=your-anthropic-api-key
PORT=3004

# Redis（選填，未設定則自動降級為僅記憶體快取）
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 前端 `frontend/.env.local`

```env
NEXT_PUBLIC_API_HOST=http://localhost:3004
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=your-nextauth-secret-here
JWT_SECRET=your-jwt-secret-here

# Azure AD（Microsoft Entra ID）
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id
```

> ⚠️ 前後端的 `JWT_SECRET` 必須保持一致。

---

## 常用指令

```bash
# ── 開發 ──
pnpm dev                              # 同時啟動前後端
pnpm dev:frontend                     # 僅前端（port 3003）
pnpm dev:backend                      # 僅後端（port 3004）

# ── 建置 ──
pnpm build:frontend                   # Next.js 建置
pnpm build:backend                    # NestJS 建置

# ── 測試 ──
cd backend && pnpm test               # 後端單元測試
cd backend && pnpm test:cov           # 測試覆蓋率
cd backend && pnpm test:e2e           # E2E 測試
cd frontend && pnpm test:e2e          # Playwright E2E

# ── 程式碼品質 ──
pnpm lint                             # Biome 全專案檢查
pnpm lint:fix                         # 自動修復
pnpm format                           # 格式化

# ── 資料庫 ──
cd backend && npx prisma migrate dev  # 建立新 Migration
cd backend && npx prisma studio       # 開啟 Prisma Studio GUI
cd backend && npx prisma generate     # 重新產生 Prisma Client
```

---

## 資料庫

使用 PostgreSQL 15，透過 Prisma ORM 管理。Schema 定義在 `backend/prisma/schema.prisma`。

### 資料模型

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Portfolio      │  │   Watchlist      │  │ AnalysisCache   │  │ DailyStockPrice │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ userId          │  │ userId          │  │ date (Unique)   │  │ date            │
│ stockNo         │  │ stockNo         │  │ result (JSON)   │  │ code            │
│ stockName       │  │ stockName       │  │ createdAt       │  │ name            │
│ buyPrice        │  │ groupName       │  └─────────────────┘  │ closingPrice    │
│ buyDate         │  │ createdAt       │                       │ change          │
│ shares          │  │                 │                       │ tradeVolume     │
│ memo            │  │ @@unique        │                       │ industry        │
│ createdAt       │  │  (userId,       │                       │ createdAt       │
│ updatedAt       │  │   stockNo)      │                       │                 │
└─────────────────┘  └─────────────────┘                       │ @@unique        │
                                                               │  (date, code)   │
                                                               └─────────────────┘
```

- **Portfolio**：使用者持股紀錄（買入價、張數、備忘錄）
- **Watchlist**：自選股收藏（支援自訂群組分類）
- **AnalysisCache**：AI 分析結果快取（每日一份）
- **DailyStockPrice**：每日收盤價歷史（用於熱力圖計算跨期間漲跌幅）

---

## API 文件

後端啟動後可存取 Swagger 文件：**http://localhost:3004/api/docs**

所有 API 回應格式統一為：

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-05-11T02:00:00.000Z"
}
```

### 股票行情 API — `GET /stock/*`

| 端點 | 說明 | 資料來源 |
|------|------|----------|
| `GET /stock/daily-all` | 全部上市股票當日成交資訊 | TWSE `STOCK_DAY_ALL` |
| `GET /stock/valuation` | 本益比、殖利率、股價淨值比 | TWSE `BWIBBU_ALL` |
| `GET /stock/market-index` | 大盤及各類股指數 | TWSE `MI_INDEX` |
| `GET /stock/top-volume` | 成交量前 20 名 | TWSE `MI_INDEX20` |
| `GET /stock/intraday` | 盤中五秒累計成交 | TWSE `MI_5MINS` |
| `GET /stock/index-history` | 加權指數歷史資料 | TWSE `MI_5MINS_HIST` |
| `GET /stock/detail?symbol=2330` | 個股基本面詳細資料 | Yahoo Finance |
| `GET /stock/history?symbol=2330&period=1m` | 個股歷史 OHLCV | Yahoo Finance |

### 排行榜 API — `GET /stock/ranking/*`

| 端點 | 說明 | 資料來源 |
|------|------|----------|
| `GET /stock/ranking/revenue` | 營收排行（營業利益、EPS） | TWSE `t187ap14_L` |
| `GET /stock/ranking/gross-margin` | 毛利率排行 | TWSE `t187ap06_L_ci` |
| `GET /stock/ranking/dividend-yield` | 殖利率排行 | TWSE `BWIBBU_ALL` |
| `GET /stock/ranking/pe-ratio` | 本益比排行（由低到高） | TWSE `BWIBBU_ALL` |

### 新聞 API — `GET /stock/news/*`

| 端點 | 說明 | 資料來源 |
|------|------|----------|
| `GET /stock/news` | 證交所新聞公告 | TWSE `newsList` |
| `GET /stock/news/all` | 全部新聞整合 | Yahoo RSS + Google RSS + TWSE |

### 熱力圖 API — `GET /stock/heatmap`

| 端點 | 說明 |
|------|------|
| `GET /stock/heatmap?period=1d` | 產業漲跌 Treemap（支援 `1d` / `1w` / `1m` / `3m` / `1y`） |
| `POST /stock/heatmap/save-daily` | 手動觸發儲存當日收盤資料 |

### 持股管理 API — `CRUD /portfolio` 🔒

| 端點 | 說明 |
|------|------|
| `GET /portfolio` | 取得持股清單 |
| `GET /portfolio/:id` | 取得單筆持股 |
| `POST /portfolio` | 新增持股紀錄 |
| `PATCH /portfolio/:id` | 更新持股紀錄 |
| `DELETE /portfolio/:id` | 刪除持股紀錄 |

### 自選股 API — `CRUD /watchlist` 🔒

| 端點 | 說明 |
|------|------|
| `GET /watchlist` | 取得自選股清單 |
| `POST /watchlist` | 加入自選股 |
| `PATCH /watchlist/:id/group` | 更新自選股群組 |
| `DELETE /watchlist/:id` | 移除自選股 |

### AI 分析 API — `/analysis` 🔒

| 端點 | 說明 |
|------|------|
| `GET /analysis/market` | 取得今日快取的 AI 分析結果 |
| `POST /analysis/market` | 觸發 AI 分析台股市場 |

> 🔒 標記的 API 需在 Header 帶入 `Authorization: Bearer <JWT Token>`

---

## 資料來源與撈取流程

後端作為 TWSE 與 Yahoo Finance 的二次封裝層，統一處理資料取得、格式轉換、快取與錯誤處理。

### 資料流架構

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   前端        │────▶│   後端 API   │────▶│  TWSE / Yahoo │────▶│  回應資料     │
│  React Query │◀────│  NestJS      │◀────│  外部 API     │◀────│  JSON / RSS  │
└──────────────┘     └──────┬───────┘     └──────────────┘     └──────────────┘
                            │
                    ┌───────▼───────┐
                    │   快取層       │
                    │ L1: 記憶體     │
                    │ L2: Redis     │
                    └───────────────┘
```

### TWSE 資料撈取

後端 `StockService` 負責所有 TWSE 資料撈取：

```typescript
// 1. 後端 Service 向 TWSE API 發送請求
const { data } = await firstValueFrom(
  this.httpService.get<TwseResponse>('https://www.twse.com.tw/exchangeReport/STOCK_DAY_ALL?response=json')
);

// 2. 轉換為統一格式
const stocks = data.data.map((row) => ({
  code: row[0],        // 證券代號
  name: row[1],        // 證券名稱
  tradeVolume: row[2], // 成交股數
  closingPrice: row[7],// 收盤價
  change: row[8],      // 漲跌價差
  // ...
}));

// 3. 存入快取，避免頻繁請求 TWSE
await this.cacheManager.set('stock:daily-all', result, 5 * 60 * 1000);
```

### 前端資料消費

前端透過 React Query Hooks 取得後端 API 資料：

```typescript
// hooks/use-stock-query.ts
export function useStockDailyAll() {
  return useQuery({
    queryKey: ["stock", "daily-all"],
    queryFn: () => fetchAPI<StockDailyAllResponse>("stock/daily-all"),
    staleTime: 5 * 60 * 1000,
  });
}

// 頁面元件
const { data: dailyAll, isLoading } = useStockDailyAll();
const stockList = dailyAll?.data ?? [];
```

### 外部資料來源

| 來源 | 說明 | 端點範例 |
|------|------|----------|
| **TWSE 報表** | 日成交、估值、指數 | `www.twse.com.tw/exchangeReport/*` |
| **TWSE OpenAPI** | 排行榜、產業分類、新聞 | `openapi.twse.com.tw/v1/*` |
| **Yahoo Finance** | 個股基本面、歷史價格 | `yahoo-finance2` npm 套件 |
| **Yahoo RSS** | 台股即時新聞 | `tw.stock.yahoo.com/rss` |
| **Google News RSS** | 美股、國際財經新聞 | `news.google.com/rss` |
| **Anthropic Claude** | AI 股市分析 | `@anthropic-ai/sdk` |

---

## 快取策略

採用雙層快取架構，降低外部 API 請求次數：

| 層級 | 實作 | TTL | 說明 |
|------|------|-----|------|
| **L1** | CacheableMemory | 60s | Node 程序內記憶體快取，LRU 5000 |
| **L2** | Redis 7 | 依 API 而異 | 跨實例共享，僅 `REDIS_HOST` 有值時啟用 |

### 各 API 快取 TTL

| 資料類型 | TTL | 說明 |
|----------|-----|------|
| 日成交 | 5 分鐘 | 盤中更新頻繁 |
| 估值 | 10 分鐘 | 每日變動一次 |
| 即時成交 | 1 分鐘 | 盤中即時數據 |
| 新聞 | 10 分鐘 | RSS 更新頻率適中 |
| 排行榜 | 30 分鐘 | 每季更新 |
| 熱力圖 | 5 分鐘 | 涉及跨期間計算 |
| 個股詳情 | 3 分鐘 | Yahoo Finance 個股查詢 |
| 歷史價格 | 5 分鐘 | 歷史資料穩定 |
| 產業對照表 | 30 分鐘 | 不常變動 |

---

## 認證架構

```
┌──────────┐    OAuth    ┌───────────┐   Session   ┌──────────┐
│ Azure AD │◀──────────▶│  NextAuth  │────────────▶│  前端     │
│(Entra ID)│            │ (Session   │             │ 自簽 JWT │
└──────────┘            │  Callback) │             │ (3h TTL) │
                        └───────────┘             └────┬─────┘
                                                       │
                                            Authorization: Bearer
                                                       │
                                                       ▼
                                                ┌──────────┐
                                                │  後端     │
                                                │ AuthGuard │
                                                │ JWT 驗證  │
                                                └──────────┘
```

1. 使用者透過 **Azure AD** 登入，NextAuth 取得 OAuth Token
2. 前端在 Session Callback 用 `JWT_SECRET` **自簽 JWT**（有效期 3 小時）
3. 前端 `AuthSync` 元件將 Token 快取至 `api-client` 模組
4. 呼叫後端 API 時自動帶入 `Authorization: Bearer <token>`
5. 後端 `AuthGuard` 用相同的 `JWT_SECRET` 驗證 Token

---

## 前端頁面路由

| 路由 | 頁面 | 說明 |
|------|------|------|
| `/stock` | 首頁 | 全部股票成交總覽、自選股 |
| `/stock/market-overview` | 大盤總覽 | 指數走勢、成交量排行 |
| `/stock/valuation` | 本益比/殖利率 | 估值指標表格 |
| `/stock/ranking` | 排行榜 | 營收、毛利率、殖利率、本益比 |
| `/stock/heatmap` | 熱力圖 | D3 Treemap 產業漲跌分布 |
| `/stock/news` | 新聞 | 台股、美股、國際財經 |
| `/stock/analysis` | AI 分析 | Claude AI 智慧選股 |
| `/stock/[symbol]` | 個股詳情 | K 線圖、基本面資料 |
| `/login` | 登入 | Azure AD 第三方登入 |

---

## 前端元件架構

```
src/components/
├── charts/
│   ├── lightweight-chart.tsx        # TradingView Lightweight Charts K 線圖
│   ├── stock-history-chart.tsx      # 個股歷史走勢圖
│   ├── tradingview-chart.tsx        # TradingView 嵌入圖表
│   └── tradingview-technical.tsx    # TradingView 技術分析
├── commons/
│   ├── market-index-chart/          # 大盤走勢迷你圖
│   ├── page-header/                 # 頁面標題
│   ├── section-header/              # 區塊標題
│   ├── top-news/                    # 首頁新聞摘要
│   ├── dialog-provider.tsx          # Toaster 通知
│   └── theme-toggle.tsx             # 深色/淺色主題切換
├── data-table/
│   └── stock/data-table.tsx         # 股票資料表格（搜尋、排序、分頁、自選股）
├── layouts/                         # 側邊欄、導覽列
└── ui/                              # shadcn/ui 基礎元件
```

### 前端 Hooks

```
src/hooks/
├── use-stock-query.ts      # 股票行情、指數、排行榜、新聞 Hooks
├── use-watchlist-query.ts  # 自選股 CRUD Hooks（含 Toast 回饋）
└── use-analysis-query.ts   # AI 分析 Hooks
```

---

## 部署

### Docker Compose 部署（推薦）

專案提供三套 Docker Compose 配置：

| 檔案 | 環境 | 用途 |
|------|------|------|
| `docker-compose.yml` | 開發 | 僅啟動 PostgreSQL + Redis |
| `docker-compose.qas.yml` | 測試 | 全服務（含前後端容器） |
| `docker-compose.prd.yml` | 正式 | 全服務（正式環境設定） |

#### 開發環境

```bash
docker compose up -d
pnpm dev
```

#### 測試環境

```bash
docker compose -f docker-compose.qas.yml --env-file .env.qas up -d
```

| 服務 | 外部 Port |
|------|-----------|
| Frontend | 4000 |
| Backend | 4004 |
| PostgreSQL | 5436 |

#### 正式環境

```bash
docker compose -f docker-compose.prd.yml --env-file .env.prd up -d
```

| 服務 | 外部 Port |
|------|-----------|
| Frontend | 3010 |
| Backend | 3014 |
| PostgreSQL | 5437 |

### Dockerfile 建置流程

前後端各採用 **3 階段建置**，最小化產出映像檔：

```
Stage 1: deps     → pnpm install + prisma generate
Stage 2: builder  → pnpm build（Next.js standalone / NestJS dist）
Stage 3: runner   → 非 root 使用者執行，僅複製必要產出
```

---

## 程式碼品質

| 工具 | 用途 |
|------|------|
| **Biome** | Lint + Format（取代 ESLint + Prettier） |
| **Husky** | Git Hook（commit 前自動執行檢查） |
| **lint-staged** | 僅對暫存檔案執行 `biome check --write` |
| **commitlint** | 檢查 Commit Message 格式 |
| **Jest** | 後端單元測試 |
| **Playwright** | 前端 E2E 測試 |

---

## Commit 規範

格式：`type(scope): 繁體中文描述`

| Emoji | Type | 時機 |
|-------|------|------|
| ✨ | feat | 新功能 |
| 🔧 | fix | 修 Bug |
| ♻️ | refactor | 重構 |
| 🎨 | style | 樣式調整 |
| 📝 | docs | 文件 |
| 🧪 | test | 測試 |
| 🚀 | perf | 效能優化 |
| 🏗️ | build | 建置/依賴 |

---

## License

個人 side project，僅供學習與非商業用途使用。所有股市資料版權歸 TWSE 證交所等原始來源所有，本專案不對資料正確性負責，亦不作任何商業營利。
