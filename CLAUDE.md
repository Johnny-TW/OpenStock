# CLAUDE.md — SS01 StockSmart System 專案全域說明書

## 語言與風格

- 所有回覆使用**繁體中文**
- 使用溫柔、友善的語氣
- 技術解說以簡單明瞭的方式逐步說明
- 程式碼中的文案一律使用繁體中文
- 不要寫說明文件或註解，直接給出程式碼

## 專案概覽

台灣股市智慧分析平台（StockSmart），Monorepo 結構，前後端分離：

- **前端**：`frontend/` — Next.js 15 + React 19 + TypeScript
- **後端**：`backend/` — NestJS 11 + Prisma + PostgreSQL
- **套件管理**：pnpm
- **開發埠**：前端 3003、後端 3004

## 常用指令

```bash
# 同時啟動前後端
pnpm dev

# 僅啟動前端 / 後端
pnpm dev:frontend
pnpm dev:backend

# 前端
cd frontend && pnpm dev          # 開發
cd frontend && pnpm build        # 建置
cd frontend && pnpm lint         # Lint

# 後端
cd backend && pnpm run start:dev # 開發（watch mode）
cd backend && pnpm test          # 執行測試
cd backend && pnpm test:cov      # 測試覆蓋率
cd backend && pnpm test:e2e      # E2E 測試
cd backend && pnpm lint          # Lint

# Biome（根目錄執行）
pnpm lint                        # 檢查全部（lint + format）
pnpm lint:fix                    # 自動修復
pnpm format                      # 格式化
npx biome check --write .        # 等同 lint:fix
npx biome ci .                   # CI 用（不寫入，有錯回傳非零）
npx biome explain <rule>         # 查看規則說明
```

## 認證架構

Azure AD（Microsoft Entra ID）→ NextAuth → 前端自簽 JWT（3h）→ 後端 `AuthGuard` 驗證

- 前端在 `session callback` 用 `JWT_SECRET` 自簽 JWT
- 後端用相同的 `JWT_SECRET` 驗證（`@nestjs/jwt`）
- 呼叫 API 帶 `Authorization: Bearer <token>`
- 需認證的路由使用 `@UseGuards(AuthGuard)` 保護
- Token 由 `AuthSync.tsx` 在 session 取得後呼叫 `setAccessToken()` 注入至 `api-client` 模組快取，所有 axios 請求自動帶入

## 資料庫

- PostgreSQL（pgvector/pgvector:pg15），Docker 化，開發環境 port 5435
- ORM：Prisma，schema 在 `backend/prisma/schema.prisma`
- 主要 Model：`Portfolio`（持股）、`Watchlist`（自選股）、`NewsEmbedding`（新聞向量）
- 啟用 `pgvector` 擴充套件，支援 1536 維向量相似度搜尋（`<=>` cosine distance）

## 快取（Redis）

- Redis 7（alpine），Docker 化，開發環境 port 6379
- 雙層快取（two-tier cache）：
  - L1 — `CacheableMemory`（Node 程序內記憶體，TTL 60s、LRU 5000）
  - L2 — Redis（跨實例共享，僅在 `REDIS_HOST` 環境變數有值時啟用）
- 套件：`@nestjs/cache-manager` + `cache-manager` + `@keyv/redis` + `keyv` + `cacheable`
- 註冊位置：`backend/src/app.module.ts`（`CacheModule.registerAsync({ isGlobal: true })`）
- 使用方式：在 Service 注入 `@Inject(CACHE_MANAGER) private cache: Cache`
- 啟動：根目錄執行 `docker compose up -d` 會同時啟動 Postgres 與 Redis

## 前端架構

- 狀態管理：**TanStack React Query**（已完全移除 Redux / Redux-Saga）
- API 呼叫層：`src/lib/api-client.ts`（axios 封裝，`fetchAPI` / `postAPI` / `patchAPI` / `deleteAPI`）
- React Query Hooks：`use-stock-query.ts`、`use-watchlist-query.ts`、`use-analysis-query.ts`
- SSE 串流（AI 分析、AI 對話）直接用 `fetch` + `ReadableStream`，不走 axios
- 通知：`sonner` toast（`Toaster` 掛在 `layout.tsx`）

## 外部 API

- **TWSE OpenAPI**：`https://openapi.twse.com.tw/v1` — 股票行情、指數、新聞
- **TWSE 報表**：`https://www.twse.com.tw/exchangeReport/` — 每日成交、估值
- **Anthropic API**：Claude 模型，用於 AI 股市分析
  - `POST /analysis/market/stream` — SSE 串流市場分析
  - `POST /analysis/market` — 同步市場分析
  - `POST /analysis/chat` — 個股 AI 對話（SSE 串流）
  - 啟用 Prompt Caching（system prompt 標記 `cache_control: ephemeral`）降低費用
- **OpenAI Embeddings API**：`text-embedding-3-small`（1536 維），用於新聞向量化（RAG）
  - 新聞每日第一次分析時批次轉向量存入 `NewsEmbedding` table
  - 分析個股時用向量相似度取代關鍵字配對，找出語意相關新聞

## Commit 規範

格式：`type(scope): 繁體中文描述`

類型：feat / fix / refactor / style / docs / test / perf / build / ci / chore / revert

- Subject 使用繁體中文，動詞開頭
- Body 說明元件/檔案名稱與原因
- 禁止 `update files`、`fix bug` 等模糊描述

## 程式碼品質

- **Linter / Formatter**：Biome（取代 ESLint + Prettier）
- 配置檔：根目錄 `biome.json`，前後端共用
- lint-staged：commit 前自動執行 `biome check --write`
- 後端 single quote、前端 double quote

## 環境變數

使用 `.env` 管理，禁止提交至版控。前後端各自的 `.env` 需包含：

- `JWT_SECRET`（前後端必須一致）
- `DATABASE_URL`（後端）
- `ANTHROPIC_API_KEY`（後端）
- `OPENAI_API_KEY`（後端，用於 Embedding API / RAG）
- `REDIS_HOST` / `REDIS_PORT`（後端，未設定時自動降級為僅記憶體快取）
- `AZURE_AD_CLIENT_ID` / `AZURE_AD_TENANT_ID`（前端）
