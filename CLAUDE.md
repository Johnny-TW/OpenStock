# CLAUDE.md — EE39 StockSmart System 專案全域說明書

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
```

## 認證架構

Azure AD（Microsoft Entra ID）→ NextAuth → 前端自簽 JWT（3h）→ 後端 `AuthGuard` 驗證

- 前端在 `session callback` 用 `JWT_SECRET` 自簽 JWT
- 後端用相同的 `JWT_SECRET` 驗證（`@nestjs/jwt`）
- 呼叫 API 帶 `Authorization: Bearer <token>`
- 需認證的路由使用 `@UseGuards(AuthGuard)` 保護

## 資料庫

- PostgreSQL，Docker 化，開發環境 port 5435
- ORM：Prisma，schema 在 `backend/prisma/schema.prisma`
- 主要 Model：`Portfolio`（持股）、`Watchlist`（自選股）

## 外部 API

- **TWSE OpenAPI**：`https://openapi.twse.com.tw/v1` — 股票行情、指數、新聞
- **TWSE 報表**：`https://www.twse.com.tw/exchangeReport/` — 每日成交、估值
- **Anthropic API**：Claude 模型，用於 AI 股市分析

## Commit 規範

格式：`type(scope): 繁體中文描述`

類型：feat / fix / refactor / style / docs / test / perf / build / ci / chore / revert

- Subject 使用繁體中文，動詞開頭
- Body 說明元件/檔案名稱與原因
- 禁止 `update files`、`fix bug` 等模糊描述

## 環境變數

使用 `.env` 管理，禁止提交至版控。前後端各自的 `.env` 需包含：

- `JWT_SECRET`（前後端必須一致）
- `DATABASE_URL`（後端）
- `ANTHROPIC_API_KEY`（後端）
- `AZURE_AD_CLIENT_ID` / `AZURE_AD_TENANT_ID`（前端）
