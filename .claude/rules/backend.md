# 後端開發規則

## 技術棧

- Node.js 20 + NestJS 11 + TypeScript
- ORM：Prisma（PostgreSQL + pgvector 擴充套件）
- 快取：@nestjs/cache-manager + Keyv + Redis（雙層快取）
- 驗證：class-validator + class-transformer
- JWT：@nestjs/jwt
- API 文檔：Swagger（路徑 `/api/docs`）
- Embedding：OpenAI `text-embedding-3-small`（RAG 新聞向量化）

## 模組結構

每個功能模組遵循：

```
module-name/
├── module-name.module.ts
├── module-name.controller.ts
├── module-name.service.ts
└── dto/
    └── module-name.dto.ts
```

## API 規範

- 路由遵循 RESTful 風格
- 基礎路徑：`/api`
- 需認證的路由加 `@UseGuards(AuthGuard)`
- userId 從 JWT token 的 `req.user` 取得，不從 query 帶入

## 驗證

- 全域 `ValidationPipe`：`whitelist: true, transform: true`
- DTO 使用 `@IsString()`, `@IsNumber()`, `@Min()` 等裝飾器
- Update DTO 用 `PartialType(CreateDto)`

## 錯誤處理

- 全域 `AllExceptionsFilter` 統一處理例外
- Prisma 錯誤對應：P2002（重複）、P2003（外鍵）、P2025（不存在）
- 統一回應格式：`{ success, data, timestamp }`

## 快取規範

- 全域 `CacheModule.registerAsync({ isGlobal: true })`，註冊於 `app.module.ts`
- 雙層架構：L1 記憶體（CacheableMemory，TTL 60s）、L2 Redis（`REDIS_HOST` 有值時啟用）
- 在 Service 注入：`@Inject(CACHE_MANAGER) private readonly cache: Cache`
- 適合快取的內容：TWSE OpenAPI 回應、計算昂貴的彙整資料
- 不要快取的內容：使用者個人資料（持股、自選股）等需即時一致的資料
- Key 命名建議：`<模組>:<操作>:<參數>`，例如 `stock:daily-all`、`stock:valuation:2330`
- 寫入時要設 TTL，避免無限堆積

## AI 分析模組（analysis）

端點：
- `GET  /analysis/market` — 取得今日快取分析結果，無快取回傳 null
- `POST /analysis/market` — 觸發 AI 分析，同步回傳完整結果
- `POST /analysis/market/stream` — 觸發 AI 分析，SSE 串流逐步回傳 `{ text }` / `{ result }` / `[DONE]`
- `POST /analysis/chat` — 個股 AI 對話，SSE 串流逐字回傳 `{ text }` / `[DONE]`

SSE 端點寫法：
- 注入 `@Res() res: Response`，手動設 `Content-Type: text/event-stream`
- 用 `for await...of` 消費 Service 回傳的 AsyncGenerator
- 每個 chunk 寫 `data: ${JSON.stringify(chunk)}\n\n`，結束寫 `data: [DONE]\n\n`
- 需在 `res.setHeader` 加 `X-Accel-Buffering: no` 防止 Nginx 緩衝

AI 功能特性：
- Prompt Caching：system prompt 標記 `cache_control: { type: 'ephemeral' }` 降低重複 token 費用
- 候選池：成交量 + 漲跌幅 + 法人買超混合，最多 50 檔
- 快照資料包含：`industry`、`revenueYoY`、相對強弱、新聞配對

## RAG 新聞向量搜尋（embedding）

模組位置：`backend/src/embedding/`（`EmbeddingService`）

流程：
1. `storeNewsEmbeddings()` — 每日第一次分析時，將新聞批次送 OpenAI 轉向量，存進 `NewsEmbedding` table（當天已存則跳過）
2. `findRelatedNews(code, name, industry)` — 分析每檔股票時，用 `<=>` cosine distance 取 top 5 語意相近新聞
3. 向量搜尋失敗時自動 fallback 到關鍵字配對，不影響主流程

pgvector 注意事項：
- Docker image 必須用 `pgvector/pgvector:pg15`，不可用 `postgres:15-alpine`
- migration 需先執行 `CREATE EXTENSION IF NOT EXISTS vector;`
- Prisma schema 用 `Unsupported("vector(1536)")` 宣告欄位
- 向量搜尋必須用 `$queryRaw`，不能用一般 Prisma query
- `EmbeddingModule` 需在使用方的 module `imports` 中引入並 `exports`

## 測試

- 使用 Jest
- 每個 service 都需要對應的 `.spec.ts`
- Mock PrismaService 進行隔離測試
