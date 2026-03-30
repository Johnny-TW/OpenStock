# 後端架構文件（Backend）

## 技術棧

| 層級 | 技術 | 版本 |
|------|------|------|
| 框架 | NestJS | 11.0.1 |
| 語言 | TypeScript | 5.7.3 |
| ORM | Prisma Client | 6.16.3 |
| 資料庫 | PostgreSQL | Docker 容器 (port 5435) |
| HTTP 客戶端 | @nestjs/axios + axios | 4.0.1 / 1.13.5 |
| API 文件 | @nestjs/swagger + swagger-ui-express | 11.2.6 / 5.0.1 |
| 驗證 | class-validator + class-transformer | 0.15.1 / 0.5.1 |
| 測試 | Jest + supertest | 30.0.0 / 7.0.0 |
| 套件管理 | pnpm | — |

---

## 目錄結構

```
backend/
├── src/
│   ├── main.ts                 # 應用程式進入點
│   ├── app.module.ts           # 根模組
│   ├── app.controller.ts       # 根 Controller（健康檢查）
│   ├── app.service.ts          # 根 Service
│   │
│   ├── prisma/                 # Prisma 資料庫層
│   │   ├── prisma.module.ts    # @Global() 模組，全域匯出
│   │   └── prisma.service.ts   # PrismaClient 封裝（含生命週期）
│   │
│   ├── stock/                  # 股票資料模組
│   │   ├── stock.module.ts
│   │   ├── stock.controller.ts
│   │   ├── stock.service.ts
│   │   └── dto/stock.dto.ts
│   │
│   ├── portfolio/              # 持股管理模組
│   │   ├── portfolio.module.ts
│   │   ├── portfolio.controller.ts
│   │   ├── portfolio.service.ts
│   │   └── dto/portfolio.dto.ts
│   │
│   ├── watchlist/              # 自選股模組
│   │   ├── watchlist.module.ts
│   │   ├── watchlist.controller.ts
│   │   ├── watchlist.service.ts
│   │   └── dto/watchlist.dto.ts
│   │
│   └── generated/prisma/       # Prisma 自動生成的 Client
│
├── prisma/
│   ├── schema.prisma           # 資料庫 Schema 定義
│   └── migrations/             # 資料庫遷移紀錄
│
├── test/
│   ├── app.e2e-spec.ts         # E2E 測試
│   └── jest-e2e.json           # E2E 測試設定
│
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

---

## 進入點 main.ts

```
NestFactory.create(AppModule)
    │
    ├─ 全域 ValidationPipe
    │   ├─ transform: true（自動型別轉換）
    │   ├─ whitelist: true（過濾未定義欄位）
    │   └─ enableImplicitConversion: true
    │
    ├─ Swagger 設定
    │   ├─ 標題：EE39 StockSmart System OpenAPI
    │   ├─ 路徑：/api/docs（UI）、/api/docs-json（JSON）
    │   ├─ 開啟 search / filter 功能
    │   └─ 外部連結：TWSE OpenAPI 原始文件
    │
    ├─ CORS 白名單
    │   └─ localhost:3000 ~ 3004
    │
    └─ 監聽 port 3004（可透過 PORT 環境變數調整）
```

---

## 模組架構

```
AppModule
├── PrismaModule      # @Global() — 全域資料庫存取
├── StockModule       # 台灣證交所資料代理
├── PortfolioModule   # 持股 CRUD
└── WatchlistModule   # 自選股 CRUD
```

---

## 功能模組

### Stock 模組（證券交易 / 指數資料）

外部資料來源代理，不使用資料庫，直接從 TWSE API 取得即時資料。

| 端點 | 方法 | 說明 | 資料來源 |
|------|------|------|---------|
| `/stock/daily-all` | GET | 上市個股日成交資訊 | `exchangeReport/STOCK_DAY_ALL` |
| `/stock/valuation` | GET | 本益比、殖利率、股價淨值比 | `exchangeReport/BWIBBU_ALL` |
| `/stock/market-index` | GET | 大盤及類股指數收盤資訊 | OpenAPI `MI_INDEX` |
| `/stock/top-volume` | GET | 成交量前 20 名 | OpenAPI `MI_INDEX20` |
| `/stock/intraday` | GET | 盤中五秒累計成交資訊 | OpenAPI `MI_5MINS` |
| `/stock/index-history` | GET | 加權指數歷史 OHLC | OpenAPI `MI_5MINS_HIST` |

**架構特點**：
- 使用 `@nestjs/axios` 的 `HttpModule`（timeout: 10s, maxRedirects: 3）
- 回應格式統一包含 `data` 陣列 + `total` 筆數
- TWSE 舊版 API（stat/fields/data 結構）與 OpenAPI（JSON 陣列）兩種格式都有處理

### Portfolio 模組（持股管理）

| 端點 | 方法 | 說明 |
|------|------|------|
| `/portfolio?userId=` | GET | 取得使用者持股清單（按買入日期降序） |
| `/portfolio/:id?userId=` | GET | 取得單筆持股紀錄 |
| `/portfolio` | POST | 新增持股紀錄 |
| `/portfolio/:id?userId=` | PATCH | 更新持股紀錄 |
| `/portfolio/:id?userId=` | DELETE | 刪除持股紀錄 |

**CreatePortfolioDto**：

| 欄位 | 型別 | 驗證 | 說明 |
|------|------|------|------|
| userId | string | @IsString | 使用者 ID |
| stockNo | string | @IsString | 股票代號（如 2330） |
| stockName | string | @IsString | 股票名稱（如 台積電） |
| buyPrice | number | @IsNumber @Min(0) | 買入價格 |
| buyDate | string | @IsDateString | 買入日期 |
| shares | number | @IsNumber @Min(1) | 持有股數 |
| memo? | string | @IsOptional @IsString | 備註 |

**UpdatePortfolioDto**：繼承 `PartialType(CreatePortfolioDto)`，所有欄位可選。

### Watchlist 模組（自選股）

| 端點 | 方法 | 說明 |
|------|------|------|
| `/watchlist?userId=` | GET | 取得使用者自選股清單（按建立時間降序） |
| `/watchlist` | POST | 加入自選股（重複時回傳 409 Conflict） |
| `/watchlist/:id?userId=` | DELETE | 移除自選股 |

**CreateWatchlistDto**：

| 欄位 | 型別 | 說明 |
|------|------|------|
| userId | string | 使用者 ID |
| stockNo | string | 股票代號 |
| stockName | string | 股票名稱 |

---

## 資料庫 Schema（Prisma）

### Portfolio 模型

```
Portfolio
├── id          Int       @id @default(autoincrement())
├── userId      String    ← 使用者識別（Azure AD oid）
├── stockNo     String    ← 股票代號
├── stockName   String    ← 股票名稱
├── buyPrice    Float     ← 買入價格
├── buyDate     DateTime  ← 買入日期
├── shares      Int       ← 持有股數
├── memo        String?   ← 備註（可選）
├── createdAt   DateTime  @default(now())
└── updatedAt   DateTime  @updatedAt

索引：@@index([userId])
```

### Watchlist 模型

```
Watchlist
├── id          Int       @id @default(autoincrement())
├── userId      String
├── stockNo     String
├── stockName   String
└── createdAt   DateTime  @default(now())

唯一約束：@@unique([userId, stockNo])  ← 同一使用者不能重複加入相同股票
索引：@@index([userId])
```

### 資料庫連線

- Provider: PostgreSQL
- URL: `env("DATABASE_URL")`
- 開發環境：Docker 容器，port 5435 映射
- Binary Targets: `native`, `debian-openssl-1.1.x`, `debian-openssl-3.0.x`, `linux-musl`, `linux-musl-openssl-3.0.x`

---

## Prisma 模組

```
PrismaModule (@Global)
└── PrismaService extends PrismaClient
    ├── onModuleInit()    → $connect()
    └── onModuleDestroy() → $disconnect()
```

- 以 `@Global()` 註冊，所有模組皆可直接注入 `PrismaService`
- 各 Service 透過 `this.prisma.[model]` 操作資料庫

---

## 請求驗證

全域啟用 `ValidationPipe`：

```
ValidationPipe({
  transform: true,                          // 自動轉型
  transformOptions: { enableImplicitConversion: true },
  whitelist: true,                          // 過濾 DTO 未定義的欄位
})
```

DTO 使用 `class-validator` 裝飾器（`@IsString`, `@IsNumber`, `@Min`, `@IsDateString`, `@IsOptional`）進行驗證。

---

## API 文件（Swagger）

- UI 路徑：`http://localhost:3004/api/docs`
- JSON 路徑：`http://localhost:3004/api/docs-json`
- 功能：search、filter、tag 排序、operation 排序
- 分類標籤：`證券交易`、`指數`、`持股管理`、`自選股`
- 所有 DTO 使用 `@ApiProperty` 提供欄位描述與範例值

---

## 整體 API 呼叫流程

```
前端 (Next.js)
    │
    │ dispatch({ type: "GET_STOCK_DAILY_ALL" })
    ▼
Redux-Saga (fetchApi)
    │
    │ axios.get("/stock/daily-all")
    │ Header: Authorization: Bearer {自簽 JWT}
    ▼
後端 (NestJS) localhost:3004
    │
    │ Controller → Service
    ▼
    ┌──────────────────┬──────────────────┐
    │                  │                  │
  Stock 模組        Portfolio 模組    Watchlist 模組
    │                  │                  │
    ▼                  ▼                  ▼
  TWSE API          PostgreSQL        PostgreSQL
  (外部資料)        (Prisma ORM)      (Prisma ORM)
```

---

## CORS 設定

```typescript
origin: [
  'http://localhost:3000',  // Next.js 預設
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',  // 目前開發用
  'http://localhost:3004',  // Backend 本身
]
methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
credentials: true
```

---

## 腳本指令

```bash
pnpm dev              # 開發模式（watch mode）
pnpm build            # 建置正式版
pnpm start:prod       # 啟動正式版（node dist/main）
pnpm lint             # ESLint 檢查 + 自動修正
pnpm format           # Prettier 格式化
pnpm test             # 單元測試
pnpm test:e2e         # E2E 測試
pnpm test:cov         # 測試覆蓋率
```

---

## 環境變數

| 變數 | 說明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 連線字串 |
| `PORT` | 伺服器監聽埠（預設 3004） |
