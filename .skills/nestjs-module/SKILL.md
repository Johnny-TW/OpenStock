---
name: nestjs-module
description: "Use when: creating new NestJS backend modules, API endpoints, controllers, services, DTOs. Includes Prisma integration, AuthGuard, Swagger decorators, and error handling patterns."
---

# Skill: NestJS 模組開發

## 觸發條件
當需要新增後端 API 模組時使用。

## 規則

### 檔案結構
```
src/<module-name>/
├── <module-name>.module.ts
├── <module-name>.controller.ts
├── <module-name>.service.ts
├── <module-name>.service.spec.ts
└── dto/
    └── <module-name>.dto.ts
```

### Module 模板
```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { <Name>Controller } from './<name>.controller';
import { <Name>Service } from './<name>.service';

@Module({
  imports: [PrismaModule],
  controllers: [<Name>Controller],
  providers: [<Name>Service],
  exports: [<Name>Service],
})
export class <Name>Module {}
```

### Controller 規範
- 裝飾器順序：`@ApiTags` → `@Controller` → `@UseGuards`（如需認證）
- 路由遵循 RESTful：`GET /`、`POST /`、`GET /:id`、`PATCH /:id`、`DELETE /:id`
- 需認證路由加 `@UseGuards(AuthGuard)`
- userId 從 `req.user.userId` 取得，不從 query 帶入

### DTO 規範
```typescript
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class Create<Name>Dto {
  @ApiProperty({ description: '欄位描述' })
  @IsString()
  field: string;
}

export class Update<Name>Dto extends PartialType(Create<Name>Dto) {}
```

### Service 規範
- 注入 `PrismaService` 存取資料庫
- Prisma 錯誤對應：P2002（重複 → 409）、P2025（不存在 → 404）
- 外部 API 使用 `HttpService`（`@nestjs/axios`）

### 測試規範
- 每個 service 必須有 `.spec.ts`
- Mock `PrismaService` 進行隔離測試
- 測試檔案與被測檔案放同一目錄
