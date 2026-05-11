# NestJS 新手學習指南 — 以 StockSmart 專案為例

> 這份文件用這個專案的「真實程式碼」帶你走一遍 NestJS 的核心觀念，讓你從零開始到能自己寫出完整的 CRUD API。

---

## 目錄

1. [NestJS 是什麼？](#1-nestjs-是什麼)
2. [專案架構總覽](#2-專案架構總覽)
3. [常用 CLI 指令](#3-常用-cli-指令)
4. [核心概念：Module → Controller → Service](#4-核心概念module--controller--service)
5. [完整 CRUD 教學](#5-完整-crud-教學)
6. [DTO 與資料驗證](#6-dto-與資料驗證)
7. [連線資料庫（Prisma + PostgreSQL）](#7-連線資料庫prisma--postgresql)
8. [全域管線 Pipe、Filter、Interceptor](#8-全域管線-pipefilterinterceptor)
9. [Azure AD 登入 + JWT 驗證](#9-azure-ad-登入--jwt-驗證)
10. [Swagger API 文件](#10-swagger-api-文件)
11. [測試](#11-測試)
12. [附錄：常用指令速查表](#12-附錄常用指令速查表)

---

## 1. NestJS 是什麼？

NestJS 是一個 Node.js 後端框架，用 TypeScript 寫，架構受 Angular 啟發。它用「模組化」的方式組織程式碼，每個功能都是一個獨立模組。

核心概念只有三個：

| 角色 | 職責 | 比喻 |
|------|------|------|
| **Module** | 把相關的 Controller 和 Service 組裝在一起 | 部門 |
| **Controller** | 接收 HTTP 請求，決定呼叫哪個 Service | 櫃檯 |
| **Service** | 處理商業邏輯、操作資料庫 | 辦事員 |

```
HTTP 請求 → Controller（接收）→ Service（處理）→ 回傳結果
```

---

## 2. 專案架構總覽

```
backend/
├── prisma/
│   └── schema.prisma          ← 資料庫 schema 定義
├── src/
│   ├── main.ts                ← 程式進入點（啟動伺服器）
│   ├── app.module.ts          ← 根模組（組裝所有子模組）
│   ├── app.controller.ts      ← 根 Controller
│   ├── app.service.ts         ← 根 Service
│   │
│   ├── prisma/                ← 資料庫連線模組
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── auth/                  ← JWT 驗證
│   │   ├── auth.guard.ts
│   │   ├── jwt-payload.interface.ts
│   │   └── user-payload.interface.ts
│   │
│   ├── portfolio/             ← 持股管理（完整 CRUD 範例）
│   │   ├── portfolio.module.ts
│   │   ├── portfolio.controller.ts
│   │   ├── portfolio.service.ts
│   │   └── dto/portfolio.dto.ts
│   │
│   ├── watchlist/             ← 自選股（另一個 CRUD 範例）
│   │   ├── watchlist.module.ts
│   │   ├── watchlist.controller.ts
│   │   ├── watchlist.service.ts
│   │   └── dto/watchlist.dto.ts
│   │
│   ├── stock/                 ← 股票資料（外部 API 串接）
│   ├── analysis/              ← AI 分析
│   ├── filters/               ← 全域例外過濾器
│   └── interceptors/          ← 全域回應攔截器
│
├── test/                      ← E2E 測試
├── package.json
└── tsconfig.json
```

**每個功能模組的固定結構：**

```
模組名稱/
├── 模組名稱.module.ts       ← 模組定義
├── 模組名稱.controller.ts   ← 路由處理
├── 模組名稱.service.ts      ← 商業邏輯
└── dto/
    └── 模組名稱.dto.ts      ← 請求資料驗證
```

---

## 3. 常用 CLI 指令

### 安裝與啟動

```bash
# 安裝 NestJS CLI（全域）
pnpm add -g @nestjs/cli

# 建立新專案
nest new my-project

# 啟動開發模式（自動重啟）
pnpm run start:dev

# 建置正式版
pnpm run build

# 啟動正式版
pnpm run start:prod
```

### 產生程式碼（最常用！）

```bash
# 產生完整模組（含 module + controller + service）
nest g resource portfolio
# → 會問你要不要產生 CRUD，選 Yes 就會自動生成完整的 CRUD 骨架

# 單獨產生各種檔案
nest g module portfolio       # 只產生 module
nest g controller portfolio   # 只產生 controller
nest g service portfolio      # 只產生 service

# 產生 Guard / Filter / Interceptor / Pipe
nest g guard auth/auth        # 產生 Guard
nest g filter filters/all-exceptions  # 產生 Filter
nest g interceptor interceptors/response  # 產生 Interceptor

# 加上 --no-spec 避免產生測試檔
nest g service stock --no-spec
```

### 資料庫（Prisma）

```bash
# 修改 schema.prisma 後，建立 migration
npx prisma migrate dev --name add_watchlist

# 重置資料庫（危險！會清除所有資料）
npx prisma migrate reset

# 產生 Prisma Client
npx prisma generate

# 開啟 Prisma Studio（GUI 管理資料）
npx prisma studio
```

### 測試

```bash
pnpm test                # 執行單元測試
pnpm test:watch          # 監聽模式
pnpm test:cov            # 測試覆蓋率
pnpm test:e2e            # E2E 測試
```

---

## 4. 核心概念：Module → Controller → Service

### 4.1 程式進入點 — main.ts

```typescript
// src/main.ts — 整個應用程式的起點

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 1. 用根模組 AppModule 建立應用程式
  const app = await NestFactory.create(AppModule);

  // 2. 全域啟用驗證管線（自動驗證 DTO）
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,     // 自動轉型（字串 → 數字）
      whitelist: true,      // 自動移除 DTO 沒定義的欄位
    }),
  );

  // 3. 設定 CORS（允許前端跨域存取）
  app.enableCors({
    origin: ['http://localhost:3003'],  // 只允許前端的網址
    credentials: true,
  });

  // 4. 啟動伺服器
  await app.listen(3004);
}
void bootstrap();
```

### 4.2 根模組 — app.module.ts

```typescript
// src/app.module.ts — 根模組，負責組裝所有子模組

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { WatchlistModule } from './watchlist/watchlist.module';

@Module({
  imports: [
    // JWT 全域註冊，所有模組都能用
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3h' },
    }),
    PrismaModule,         // 資料庫
    PortfolioModule,      // 持股管理
    WatchlistModule,      // 自選股
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**重點：** `imports` 就像插插頭一樣，把子模組插進來就能用了。

### 4.3 最簡單的 Controller + Service

```typescript
// src/app.controller.ts — 最基本的 Controller 範例

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()  // 路由前綴：無（預設 /）
export class AppController {
  // 「依賴注入」：NestJS 會自動把 AppService 的實例塞進來
  constructor(private readonly appService: AppService) {}

  @Get()  // GET /
  getHello(): string {
    return this.appService.getHello();
  }
}
```

```typescript
// src/app.service.ts — 最基本的 Service 範例

import { Injectable } from '@nestjs/common';

@Injectable()  // 告訴 NestJS：這個 class 可以被注入
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

**依賴注入（DI）小解說：**
- `@Injectable()` = 「我可以被別人注入」
- `constructor(private readonly xxxService: XxxService)` = 「幫我自動注入」
- 你不需要自己 `new XxxService()`，NestJS 會幫你處理

---

## 5. 完整 CRUD 教學

以「持股管理 Portfolio」為例，這是一個典型的 CRUD 模組。

### 5.1 Module（模組定義）

```typescript
// src/portfolio/portfolio.module.ts

import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

@Module({
  controllers: [PortfolioController],  // 註冊 Controller
  providers: [PortfolioService],       // 註冊 Service
  // 注意：不需要 import PrismaModule，因為它是 @Global() 的
})
export class PortfolioModule {}
```

### 5.2 Controller（路由定義：CRUD 五條路由）

```typescript
// src/portfolio/portfolio.controller.ts

import {
  Controller,
  Get, Post, Patch, Delete,  // HTTP 方法裝飾器
  Body,                       // 取得請求 body
  Param,                      // 取得路由參數 :id
  Query,                      // 取得查詢參數 ?userId=xxx
  ParseIntPipe,               // 自動把字串轉成數字
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto/portfolio.dto';

@Controller('portfolio')  // 路由前綴：/portfolio
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  // ═══════════════════════════════════════
  // [R] 讀取全部 — GET /portfolio?userId=xxx
  // ═══════════════════════════════════════
  @Get()
  findAll(@Query('userId') userId: string) {
    return this.portfolioService.findAll(userId);
  }

  // ═══════════════════════════════════════
  // [R] 讀取單筆 — GET /portfolio/1?userId=xxx
  // ═══════════════════════════════════════
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,  // :id 自動轉數字
    @Query('userId') userId: string,
  ) {
    return this.portfolioService.findOne(id, userId);
  }

  // ═══════════════════════════════════════
  // [C] 新增 — POST /portfolio
  //     Body: { userId, stockNo, stockName, buyPrice, buyDate, shares }
  // ═══════════════════════════════════════
  @Post()
  create(@Body() dto: CreatePortfolioDto) {
    return this.portfolioService.create(dto);
  }

  // ═══════════════════════════════════════
  // [U] 更新 — PATCH /portfolio/1?userId=xxx
  //     Body: { buyPrice?, shares?, ... }（部分更新）
  // ═══════════════════════════════════════
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
    @Body() dto: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(id, userId, dto);
  }

  // ═══════════════════════════════════════
  // [D] 刪除 — DELETE /portfolio/1?userId=xxx
  // ═══════════════════════════════════════
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
  ) {
    return this.portfolioService.remove(id, userId);
  }
}
```

**HTTP 方法與裝飾器對照表：**

| CRUD | HTTP 方法 | 裝飾器 | 路由範例 | 說明 |
|------|----------|--------|---------|------|
| Create | POST | `@Post()` | `POST /portfolio` | 新增 |
| Read | GET | `@Get()` | `GET /portfolio` | 查詢全部 |
| Read | GET | `@Get(':id')` | `GET /portfolio/1` | 查詢單筆 |
| Update | PATCH | `@Patch(':id')` | `PATCH /portfolio/1` | 部分更新 |
| Delete | DELETE | `@Delete(':id')` | `DELETE /portfolio/1` | 刪除 |

**取得請求資料的裝飾器：**

| 裝飾器 | 來源 | 範例 |
|--------|------|------|
| `@Body()` | 請求 body | `@Body() dto: CreateDto` |
| `@Param('id')` | 路由參數 `/portfolio/:id` | `@Param('id') id: string` |
| `@Query('userId')` | 查詢字串 `?userId=xxx` | `@Query('userId') userId: string` |
| `@Headers('authorization')` | 請求標頭 | `@Headers('authorization') auth: string` |

### 5.3 Service（商業邏輯 + 資料庫操作）

```typescript
// src/portfolio/portfolio.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto/portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  // ── 查詢全部 ──
  async findAll(userId: string) {
    return this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { buyDate: 'desc' },
    });
  }

  // ── 查詢單筆 ──
  async findOne(id: number, userId: string) {
    const item = await this.prisma.portfolio.findFirst({
      where: { id, userId },
    });
    if (!item) throw new NotFoundException('找不到該持股紀錄');
    return item;
  }

  // ── 新增 ──
  async create(dto: CreatePortfolioDto) {
    return this.prisma.portfolio.create({
      data: {
        ...dto,
        buyDate: new Date(dto.buyDate),  // 字串轉日期
      },
    });
  }

  // ── 更新 ──
  async update(id: number, userId: string, dto: UpdatePortfolioDto) {
    await this.findOne(id, userId);  // 先確認存在
    const { buyDate, ...rest } = dto;
    return this.prisma.portfolio.update({
      where: { id },
      data: {
        ...rest,
        ...(buyDate && { buyDate: new Date(buyDate) }),
      },
    });
  }

  // ── 刪除 ──
  async remove(id: number, userId: string) {
    await this.findOne(id, userId);  // 先確認存在
    return this.prisma.portfolio.delete({ where: { id } });
  }
}
```

**重點整理：**
- Service 接收 Controller 傳來的參數，負責和資料庫互動
- 找不到資料就丟 `NotFoundException`，NestJS 會自動回傳 404
- Prisma 的語法很直覺：`findMany`、`findFirst`、`create`、`update`、`delete`

---

## 6. DTO 與資料驗證

DTO（Data Transfer Object）用來定義「請求 body 長什麼樣子」，搭配 `class-validator` 自動驗證。

```typescript
// src/portfolio/dto/portfolio.dto.ts

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

// ── 新增用的 DTO ──
export class CreatePortfolioDto {
  @ApiProperty({ description: '使用者 ID' })
  @IsString()                    // 必須是字串
  userId: string;

  @ApiProperty({ description: '股票代號', example: '2330' })
  @IsString()
  stockNo: string;

  @ApiProperty({ description: '股票名稱', example: '台積電' })
  @IsString()
  stockName: string;

  @ApiProperty({ description: '買入價格', example: 950.0 })
  @IsNumber()                    // 必須是數字
  @Min(0)                        // 最小值 0
  buyPrice: number;

  @ApiProperty({ description: '買入日期', example: '2024-01-15' })
  @IsDateString()               // 必須是日期格式字串
  buyDate: string;

  @ApiProperty({ description: '持有股數', example: 100 })
  @IsNumber()
  @Min(1)                        // 最小 1 股
  shares: number;

  @ApiPropertyOptional({ description: '備註' })
  @IsOptional()                  // 可選欄位
  @IsString()
  memo?: string;
}

// ── 更新用的 DTO（所有欄位變成可選）──
export class UpdatePortfolioDto extends PartialType(CreatePortfolioDto) {}
//                                       ↑ 用 PartialType 把所有欄位變 optional
```

**常用驗證裝飾器：**

| 裝飾器 | 用途 | 範例 |
|--------|------|------|
| `@IsString()` | 必須是字串 | 名稱、代號 |
| `@IsNumber()` | 必須是數字 | 價格、數量 |
| `@IsDateString()` | 必須是日期格式 | 2024-01-15 |
| `@IsOptional()` | 可選欄位 | 備註 |
| `@Min(0)` | 數字最小值 | 價格 ≥ 0 |
| `@Max(100)` | 數字最大值 | 百分比 ≤ 100 |
| `@IsEmail()` | 必須是 email | 信箱 |
| `@IsArray()` | 必須是陣列 | 標籤列表 |
| `@IsEnum(MyEnum)` | 必須是列舉值 | 狀態 |
| `@MinLength(1)` | 字串最短長度 | 名稱至少 1 字 |

**驗證失敗時 NestJS 會自動回傳 400：**
```json
{
  "statusCode": 400,
  "message": ["buyPrice must not be less than 0", "shares must be a number"],
  "error": "Bad Request"
}
```

---

## 7. 連線資料庫（Prisma + PostgreSQL）

### 7.1 啟動 PostgreSQL（Docker）

```bash
# 在專案根目錄啟動 PostgreSQL
docker compose up -d
```

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    container_name: postgres-stocksmart
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: stocksmart
    ports:
      - "5435:5432"          # 主機 5435 → 容器 5432
    volumes:
      - pgdata:/var/lib/postgresql/data
```

### 7.2 設定資料庫連線

```env
# backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/stocksmart?schema=public"
```

### 7.3 定義 Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")   // 從 .env 讀取
}

// 定義 Portfolio 資料表
model Portfolio {
  id        Int      @id @default(autoincrement())  // 主鍵，自動遞增
  userId    String                                   // 使用者 ID
  stockNo   String                                   // 股票代號
  stockName String                                   // 股票名稱
  buyPrice  Float                                    // 買入價格
  buyDate   DateTime                                 // 買入日期
  shares    Int                                      // 持有股數
  memo      String?                                  // 備註（可為 null）
  createdAt DateTime @default(now())                 // 建立時間
  updatedAt DateTime @updatedAt                      // 更新時間（自動）

  @@index([userId])  // 為 userId 建立索引（加速查詢）
}

// 定義 Watchlist 資料表
model Watchlist {
  id        Int      @id @default(autoincrement())
  userId    String
  stockNo   String
  stockName String
  groupName String   @default("未分類")              // 預設值
  createdAt DateTime @default(now())

  @@unique([userId, stockNo])  // 複合唯一鍵（同使用者不能重複加同一股票）
  @@index([userId])
}
```

### 7.4 執行 Migration

```bash
# 建立 migration 並套用到資料庫
npx prisma migrate dev --name init

# 如果只修改 schema 想重新產生 client
npx prisma generate
```

### 7.5 PrismaService（封裝給 NestJS 用）

```typescript
// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient            // 繼承 PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();         // 應用啟動時連線
  }

  async onModuleDestroy() {
    await this.$disconnect();      // 應用關閉時斷線
  }
}
```

```typescript
// src/prisma/prisma.module.ts

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()   // ← 全域模組！任何模組都能直接注入使用，不需要再 import
@Module({
  providers: [PrismaService],
  exports: [PrismaService],     // 記得 export 才能讓其他模組用
})
export class PrismaModule {}
```

### 7.6 Prisma 常用查詢語法

```typescript
// 查詢全部（加條件 + 排序）
this.prisma.portfolio.findMany({
  where: { userId },
  orderBy: { buyDate: 'desc' },
});

// 查詢單筆（用主鍵）
this.prisma.portfolio.findUnique({
  where: { id: 1 },
});

// 查詢單筆（用複合條件）
this.prisma.portfolio.findFirst({
  where: { id, userId },
});

// 新增
this.prisma.portfolio.create({
  data: { userId, stockNo, stockName, buyPrice, buyDate, shares },
});

// 更新
this.prisma.portfolio.update({
  where: { id },
  data: { buyPrice: 1000, shares: 200 },
});

// 刪除
this.prisma.portfolio.delete({
  where: { id },
});

// 查詢是否已存在（用唯一鍵）
this.prisma.watchlist.findUnique({
  where: { userId_stockNo: { userId, stockNo } },
});
```

---

## 8. 全域管線：Pipe、Filter、Interceptor

NestJS 的請求生命週期：

```
請求進來 → Pipe（驗證/轉型）→ Controller → Service → Interceptor（包裝回應）
                                                         ↓
         ← Filter（捕捉錯誤）← ← ← ← ← ← ← ← ←  發生例外時
```

### 8.1 ValidationPipe（全域驗證管線）

在 `main.ts` 全域啟用：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,                              // 自動轉型
    transformOptions: { enableImplicitConversion: true },
    whitelist: true,                              // 移除未定義的欄位
  }),
);
```

效果：DTO 裡沒定義的欄位會被自動過濾掉，有定義的欄位會自動驗證。

### 8.2 AllExceptionsFilter（全域例外過濾器）

統一處理所有錯誤，讓回應格式一致：

```typescript
// src/filters/all-exceptions.filter.ts

@Catch()  // 捕捉所有種類的例外
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 判斷例外類型，對應不同回應
    if (exception instanceof HttpException) {
      // NestJS 內建例外（404、400、401...）
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Prisma 資料庫錯誤
      switch (exception.code) {
        case 'P2002': // 資料重複（違反唯一性）
        case 'P2003': // 外鍵約束違反
        case 'P2025': // 找不到記錄
      }
    }

    // 統一回傳格式
    response.status(status).json({
      success: false,
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### 8.3 ResponseInterceptor（全域回應攔截器）

把所有成功回應包裝成統一格式：

```typescript
// src/interceptors/response.interceptor.ts

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => ({
        success: true,          // ← 統一包一個 success
        data,                   // ← 原始回傳的資料放在 data 裡
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

**效果：所有 API 回應都會長這樣**

```json
// 成功
{
  "success": true,
  "data": { "id": 1, "stockNo": "2330", "stockName": "台積電" },
  "timestamp": "2026-04-14T08:00:00.000Z"
}

// 失敗
{
  "success": false,
  "statusCode": 404,
  "code": "HTTP_404",
  "message": "找不到該持股紀錄",
  "timestamp": "2026-04-14T08:00:00.000Z",
  "path": "/portfolio/999"
}
```

### 8.4 在 main.ts 註冊

```typescript
// src/main.ts
app.useGlobalFilters(new AllExceptionsFilter());
app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());
app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
```

---

## 9. Azure AD 登入 + JWT 驗證

### 整體流程圖

```
┌─────────┐     ①登入     ┌──────────┐    ②取得 token     ┌──────────┐
│  使用者  │ ──────────→   │ Azure AD │  ──────────────→   │  前端     │
└─────────┘               └──────────┘                    └────┬─────┘
                                                               │
                                           ③ 前端用 JWT_SECRET  │
                                              自簽一個 JWT      │
                                                               │
                    ⑤ 驗證 JWT                ④ 帶 JWT         │
┌──────────┐    ←──────────────     ┌──────────┐ ←─────────────┘
│ AuthGuard│                        │  後端 API │
└──────────┘    ──────────────→     └──────────┘
                   ⑥ 放行/拒絕
```

### 9.1 前端：Azure AD 設定（NextAuth）

```javascript
// frontend/src/server/auth.jsx

import AzureAdProvider from "next-auth/providers/azure-ad"
import jwt from "jsonwebtoken"

export const authOptions = {
  providers: [
    AzureAdProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: { scope: "openid profile email User.Read" },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // ② 登入成功後，從 Azure AD 的 token 取出使用者資訊
    async jwt({ token, account, profile }) {
      if (account) {
        const decoded = jwt.decode(account.access_token)
        token.userProfile = {
          email: profile?.email ?? decoded?.upn,
          name: profile?.name ?? decoded?.name,
          oid: profile?.oid ?? decoded?.oid,
          sub: profile?.sub ?? decoded?.sub,
          iss: decoded?.iss,
        }
      }
      return token
    },

    // ③ 用 JWT_SECRET 自簽一個給後端的 JWT（有效期 3 小時）
    async session({ session, token }) {
      session.user = token.userProfile
      session.accessToken = jwt.sign(
        session.user,
        process.env.JWT_SECRET,  // ← 前後端必須用同一個 secret
        { expiresIn: "3h" }
      )
      return session
    },
  },
}
```

### 9.2 前端：呼叫 API 時帶 Token

```typescript
// 前端 api-client.ts 的 axios 攔截器自動附帶 Token
import { fetchAPI } from "@/lib/api-client";

// React Query Hook 呼叫範例
const { data } = useQuery({
  queryKey: ["stock", "daily-all"],
  queryFn: () => fetchAPI("stock/daily-all"),
  // axios 攔截器會自動加上 Authorization: Bearer {cachedToken}
});
```

### 9.3 後端：AuthGuard（JWT 驗證守衛）

```typescript
// src/auth/auth.guard.ts

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      // ④ 從 Header 取出 token
      const authHeader = request.headers.authorization;
      if (!authHeader) throw new UnauthorizedException();

      const token = authHeader.split(' ')[1];  // "Bearer xxxxx" → "xxxxx"
      if (!token) throw new UnauthorizedException();

      // ⑤ 用同一個 JWT_SECRET 驗證 token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // ⑥ 把使用者資訊塞進 request.user，後續 Controller 可以使用
      request.user = payload;
      return true;    // 放行
    } catch {
      throw new UnauthorizedException();  // 拒絕
    }
  }
}
```

### 9.4 後端：在 Controller 加上守衛

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Controller('portfolio')
export class PortfolioController {

  // 這個路由需要登入才能存取
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Req() req: Request) {
    // 從 JWT 取得 userId，而不是從 query 帶入
    const userId = req.user.email;
    return this.portfolioService.findAll(userId);
  }
}
```

### 9.5 擴充 Express Request 型別

```typescript
// src/types/express.d.ts

import { UserPayload } from 'src/auth/user-payload.interface';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;  // 讓 TypeScript 知道 req.user 的型別
    }
  }
}
```

```typescript
// src/auth/user-payload.interface.ts

export interface UserPayload {
  email: string;
  name: string;
  enName: string;
  sub: string;
  iss: string;
  oid: string;
  exp: number;
  iat: number;
}
```

### 9.6 環境變數設定

```env
# backend/.env
JWT_SECRET=你的密鑰字串     # ← 前後端必須一致！

# frontend/.env
JWT_SECRET=你的密鑰字串     # ← 同上
AZURE_AD_CLIENT_ID=xxx
AZURE_AD_CLIENT_SECRET=xxx
AZURE_AD_TENANT_ID=xxx
```

---

## 10. Swagger API 文件

NestJS 內建 Swagger 支援，自動從程式碼產生 API 文件。

### 設定（在 main.ts）

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('EE39 StockSmart System OpenAPI')
  .setDescription('台灣證券交易所 API')
  .setVersion('1.0')
  .addServer('http://localhost:3004', '本機開發')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);  // 路徑：/api/docs
```

### 在 Controller 加上文件裝飾器

```typescript
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('持股管理')              // Swagger 分組標籤
@Controller('portfolio')
export class PortfolioController {

  @ApiOperation({ summary: '取得我的持股清單' })   // API 說明
  @ApiQuery({ name: 'userId', description: '使用者 ID' }) // 參數說明
  @Get()
  findAll(@Query('userId') userId: string) { ... }
}
```

啟動後打開 `http://localhost:3004/api/docs` 就能看到漂亮的 API 文件了！

---

## 11. 測試

### 單元測試範例（Mock PrismaService）

```typescript
// src/portfolio/portfolio.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let prisma: PrismaService;

  // 建立測試模組，用 mock 取代真正的 PrismaService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: PrismaService,
          useValue: {
            portfolio: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('findAll 應該回傳該使用者的所有持股', async () => {
    const mockData = [{ id: 1, userId: 'user1', stockNo: '2330' }];
    jest.spyOn(prisma.portfolio, 'findMany').mockResolvedValue(mockData as any);

    const result = await service.findAll('user1');
    expect(result).toEqual(mockData);
    expect(prisma.portfolio.findMany).toHaveBeenCalledWith({
      where: { userId: 'user1' },
      orderBy: { buyDate: 'desc' },
    });
  });
});
```

---

## 12. 附錄：常用指令速查表

### NestJS CLI

| 指令 | 說明 |
|------|------|
| `nest new <name>` | 建立新專案 |
| `nest g resource <name>` | 產生完整 CRUD 模組（最推薦！） |
| `nest g module <name>` | 產生模組 |
| `nest g controller <name>` | 產生控制器 |
| `nest g service <name>` | 產生服務 |
| `nest g guard <name>` | 產生守衛 |
| `nest g filter <name>` | 產生過濾器 |
| `nest g interceptor <name>` | 產生攔截器 |
| `nest g pipe <name>` | 產生管線 |
| `nest build` | 建置專案 |
| `nest start --watch` | 開發模式（含 hot reload） |

### Prisma

| 指令 | 說明 |
|------|------|
| `npx prisma init` | 初始化 Prisma |
| `npx prisma migrate dev --name <name>` | 建立並套用 migration |
| `npx prisma migrate reset` | 重置資料庫 |
| `npx prisma generate` | 重新產生 Client |
| `npx prisma studio` | 開啟 GUI 管理介面 |
| `npx prisma db push` | 直接同步 schema（不建 migration） |

### 常用裝飾器

| 裝飾器 | 用途 |
|--------|------|
| `@Module()` | 定義模組 |
| `@Controller('path')` | 定義控制器與路由前綴 |
| `@Injectable()` | 標記可注入的服務 |
| `@Global()` | 標記為全域模組 |
| `@Get()` / `@Post()` / `@Patch()` / `@Delete()` | HTTP 方法 |
| `@Body()` / `@Param()` / `@Query()` / `@Headers()` | 取得請求資料 |
| `@UseGuards(AuthGuard)` | 套用守衛 |
| `@Catch()` | 捕捉例外 |
| `@ApiTags()` / `@ApiOperation()` | Swagger 文件 |

---

> 💡 **學習建議**：先從 `nest g resource` 產生一個新模組開始練習，搭配 Swagger 測試 API，是最快的上手方式！
