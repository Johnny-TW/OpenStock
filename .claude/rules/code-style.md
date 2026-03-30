# 程式碼風格規則

## 通用

- 使用 TypeScript，確保類型安全
- 遵循 ESLint + Prettier 規則
- 不寫多餘的註解或說明文件
- 文案一律繁體中文

## 命名慣例

- 元件 / 類別：PascalCase（`StockService`, `DataTable`）
- 函式 / 變數：camelCase（`findAll`, `stockName`）
- 常數：UPPER_SNAKE_CASE（`TWSE_API_URL`）
- 檔案：kebab-case（`stock-service.ts`, `data-table.tsx`）
- CSS Module：camelCase（`styles.mainContent`）

## Git

- Commit 格式：`type(scope): 繁體中文描述`
- PR 前確保 lint 和 test 通過
- 禁止提交 `.env`、`node_modules`、`dist/`
