---
name: unit-test
description: "Use when: writing unit tests for NestJS services, mocking PrismaService or HttpService, running Jest test suites. Includes test templates, naming conventions, and coverage commands."
---

# Skill: 單元測試撰寫

## 觸發條件
當需要為後端 service 撰寫單元測試時使用。

## 規則

### 測試框架
- Jest（NestJS 內建）
- 測試檔案與被測檔案放同一目錄：`<name>.service.spec.ts`

### Mock PrismaService
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { <Name>Service } from './<name>.service';
import { PrismaService } from '../prisma/prisma.service';

describe('<Name>Service', () => {
  let service: <Name>Service;
  let prisma: PrismaService;

  const mockPrisma = {
    <model>: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        <Name>Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(<Name>Service);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Mock HttpService（外部 API）
```typescript
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

const mockHttpService = {
  get: jest.fn().mockReturnValue(of({ data: mockResponse })),
};

// 在 module providers 中：
{ provide: HttpService, useValue: mockHttpService }
```

### 測試命名
```typescript
describe('方法名稱', () => {
  it('should 預期行為 when 條件', () => {});
  it('should throw NotFoundException when 資料不存在', () => {});
});
```

### 執行測試
```bash
cd backend
pnpm test                    # 全部測試
pnpm test -- --watch         # 監看模式
pnpm test -- <name>.spec     # 單一檔案
pnpm test:cov                # 覆蓋率報告
```
