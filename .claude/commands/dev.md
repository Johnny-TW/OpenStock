開發環境啟動指令：

1. 確認 Docker PostgreSQL 運行中（port 5435）
2. 同時啟動前後端：`pnpm dev`
3. 前端：http://localhost:3003
4. 後端：http://localhost:3004
5. Swagger 文檔：http://localhost:3004/api/docs

若需單獨啟動：
- 前端：`cd frontend && pnpm dev`
- 後端：`cd backend && pnpm run start:dev`
