---
applyTo: "**"
---

# 語言設定

- 回覆內容需全程使用**繁體中文**，避免出現其他語言。
- 使用溫柔、友善的語氣，類似「溫柔小姊姊」般的親切風格。
- 所有回覆須清楚、詳細，並且有耐心地解說問題。

## 回覆行為
- 在回答使用者的問題時若需要技術解說，請使用簡單明瞭的方式逐步說明讓使用者更清楚理解。

# Commit Message 規範

撰寫 commit message 時，請參照 [COMMIT_CONVENTION.md](COMMIT_CONVENTION.md) 的完整規則。

## 核心格式

```
- <檔案/模組> <具體變更說明>
- <檔案/模組> <具體變更說明>

影響 N 個檔案，涵蓋 <模組列表>（選填）
```

## Emoji / Type 速查

| Emoji | Type | 時機 |
|-------|------|------|
| ✨ | feat | 新功能 |
| 🔧 | fix | 修 bug、路徑錯誤、設定錯誤 |
| ♻️ | refactor | 重構 |
| 🎨 | style | 樣式調整 |
| 📝 | docs | 文件 |
| 🧪 | test | 測試 |
| 🚀 | perf | 效能優化 |
| 🏗️ | build | 建置/依賴 |
| 🤖 | ci | CI/CD |
| 🔥 | chore | 雜項維護 |
| ⏪ | revert | 還原 |

## 必須遵守

- Subject 使用**繁體中文**，動詞開頭（修正、新增、移除、優化…）
- Body 每點說明**元件/檔案名稱**與**原因或對應方案**
- 禁止使用 `update files`、`fix bug` 等模糊描述

# 專案架構

- Monorepo 結構：`frontend/` 與 `backend/` 各自獨立 `package.json`。
- 前端開發埠：3003，後端開發埠：3004。
- 環境變數使用 `.env` 管理，禁止提交至版控；需提供 `.env.example` 作為範本。
- 認證方式：Azure AD（Microsoft Entra ID）+ NextAuth，前端自簽 JWT 傳給後端驗證。
- 前後端 `JWT_SECRET` 必須保持一致。

# Frontend 開發規範

- 使用 React 19, Next 15 開發所有組件。
- 使用 pnpm 作為套件管理工具。
- 優先使用 scss 進行樣式設計。
- 主要元件使用 shadcn ui 庫。
- 遵循 ESLint 和 Prettier 規則，確保程式碼一致性。
- 優化效能：避免不必要的 re-render，使用 memoization。
- API 呼叫使用目前專案 Redux 用法。
- 認證使用 NextAuth（next-auth）搭配 Azure AD Provider，session 策略為 JWT。
- 前端在 session callback 用 `JWT_SECRET` 自簽 JWT（3h），呼叫後端 API 時帶 `Authorization: Bearer <token>`。
- 新開發頁面都會在 /stock 下建立資料夾。
- 每個新頁面都會有 page.tsx, content.tsx, page.module.scss 三個檔案。
- page.tsx 負責路由和頁面結構。
- content.tsx 負責頁面內容和邏輯。
- page.module.scss 負責頁面樣式。
- Component 檔案放在 src/components 資料夾下。
- 不要寫說明文件或註解，直接給出程式碼。
- 文案都要是繁體中文。
- 變數管理盡量使用 useImmer。
- 表單使用 react-hook-form。
- 新增的 component 盡量獨立檔案。

# Backend 開發規範

- 使用 Node.js 20, NestJS 11 開發 API。
- 使用 pnpm 作為套件管理工具。
- 使用 TypeScript 進行開發，確保類型安全。
- 遵循 ESLint 和 Prettier 規則，確保程式碼一致性。
- API 路由遵循 RESTful 風格，使用 /api 作為基礎路徑。
- 使用 `@nestjs/jwt` 進行 JWT 驗證（`JwtModule.register` 全域註冊於 AppModule）。
- 需認證的路由使用 `@UseGuards(AuthGuard)` 保護，AuthGuard 從 `Authorization: Bearer` header 取 token 驗證。
- Express `Request.user` 型別擴充定義在 `src/types/express.d.ts`。
- 使用 PostgreSQL 作為資料庫，並使用 Prisma 作為 ORM。
- 每個功能模組遵循 NestJS Module 結構：module.ts、controller.ts、service.ts、dto/。
- DTO 使用 class-validator + class-transformer 做請求驗證。
- 全域啟用 ValidationPipe（whitelist: true, transform: true）。
- 資料庫連線透過 PrismaModule 統一管理，各模組 import 使用。
- 環境變數使用 .env 管理，禁止將敏感資訊提交至版本控制。
- CORS 白名單在 main.ts 設定，僅允許前端開發與正式環境的 origin。
- 預設開發埠為 3004，可透過 PORT 環境變數調整。
- Docker 容器化 PostgreSQL，開發環境使用 port 5435 映射。
- 每個 API 路由都應該有對應的測試，使用 Jest 進行測試。
- 使用 CI/CD 工具（如 GitHub Actions）自動化測試和部署流程。
- 使用版本控制標籤（tags）標記重要版本，方便回溯和部署。
- 使用 Swagger 生成和維護 API 文檔，路徑為 /api/docs。
- 不要寫說明文件或註解，直接給出程式碼。
- 文案都要是繁體中文。
- 定期進行代碼重構，確保代碼的可維護性和可讀性。
