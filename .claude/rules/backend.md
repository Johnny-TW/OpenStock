# 後端開發規則

## 技術棧

- Node.js 20 + NestJS 11 + TypeScript
- ORM：Prisma（PostgreSQL）
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

## 測試

- 使用 Jest
- 每個 service 都需要對應的 `.spec.ts`
- Mock PrismaService 進行隔離測試
