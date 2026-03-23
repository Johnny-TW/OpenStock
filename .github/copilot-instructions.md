---
applyTo: "**"
---

# Commit Message 規範

撰寫 commit message 時，請參照 [.github/COMMIT_CONVENTION.md](.github/COMMIT_CONVENTION.md) 的完整規則。

## 核心格式

```
<emoji> <type>(<scope>): <subject（繁體中文，動詞開頭，≤50字）>

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

# Frontend 開發規範

- 使用 React 19, Next 15 開發所有組件。
- 使用 pnpm 作為套件管理工具。
- 優先使用 scss 進行樣式設計。
- 主要元件使用 shadcn ui 庫。
- 遵循 ESLint 和 Prettier 規則，確保程式碼一致性。
- 優化效能：避免不必要的 re-render，使用 memoization。
- API 呼叫使用目前專案 Redux 用法。
- Cookie 需要儲存在路徑 /sut-mgmt 下。
- 新開發頁面都會在 /sut-mgmt 下建立資料夾。
- 每個新頁面都會有 page.jsx, content.jsx, page.module.scss 三個檔案。
- page.jsx 負責路由和頁面結構。
- content.jsx 負責頁面內容和邏輯。
- page.module.scss 負責頁面樣式。
- Component 檔案放在 src/components 資料夾下。
- 不要寫說明文件或註解，直接給出程式碼。
- 文案都要是繁體中文。
- 變數管理盡量使用 useImmer。
- 表單使用 react-hook-form。
- 新增的 component 盡量獨立檔案。
