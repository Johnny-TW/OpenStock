---
name: prisma-db
description: "Use when: modifying database schema, creating Prisma migrations, adding models, writing database queries. Includes createMany, upsert, error code handling (P2002, P2025)."
---

# Skill: Prisma 資料庫操作

## 觸發條件
當需要修改資料庫 schema 或進行 migration 時使用。

## 規則

### Schema 位置
`backend/prisma/schema.prisma`

### 新增 Model 流程
1. 在 `schema.prisma` 新增 model 定義
2. 執行 `cd backend && pnpm exec prisma migrate dev --name <migration-name>`
3. 執行 `pnpm exec prisma generate` 更新 client
4. 在對應 service 中使用 `this.prisma.<modelName>`

### 命名慣例
- Model 名稱：PascalCase（`DailyStockPrice`）
- 欄位名稱：camelCase（`closingPrice`）
- Migration 名稱：snake_case（`add_daily_stock_price`）
- 複合唯一索引：`@@unique([field1, field2])`

### 常用 Prisma 操作
```typescript
// 批次新增（跳過重複）
await this.prisma.model.createMany({ data: records, skipDuplicates: true });

// 條件查詢
await this.prisma.model.findMany({
  where: { userId, date: { gte: startDate } },
  orderBy: { date: 'desc' },
});

// Upsert
await this.prisma.model.upsert({
  where: { id },
  update: dto,
  create: { ...dto, userId },
});
```

### 錯誤處理
```typescript
import { Prisma } from '@prisma/client';

try {
  // ...
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') throw new ConflictException('資料已存在');
    if (error.code === 'P2025') throw new NotFoundException('找不到資料');
  }
  throw error;
}
```
