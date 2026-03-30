建置與部署指令：

## 前端建置
```bash
cd frontend && pnpm build
```

## 後端建置
```bash
cd backend && pnpm run build
```

## 後端正式環境啟動
```bash
cd backend && pnpm run start:prod
```

## Prisma 資料庫操作
```bash
# 產生 Prisma Client
cd backend && npx prisma generate

# 執行 migration
cd backend && npx prisma migrate dev

# 開啟 Prisma Studio（GUI）
cd backend && npx prisma studio

# 重設資料庫
cd backend && npx prisma migrate reset
```
