# 後端開發規則

## 技術棧

- Node.js 20 + NestJS 11 + TypeScript
- ORM：Prisma（PostgreSQL）
- 快取：@nestjs/cache-manager + Keyv + Redis（雙層快取）
- 驗證：class-validator + class-transformer
- JWT：@nestjs/jwt
- API 文檔：Swagger（路徑 `/api/docs`）

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

## 測試

- 使用 Jest
- 每個 service 都需要對應的 `.spec.ts`
- Mock PrismaService 進行隔離測試
