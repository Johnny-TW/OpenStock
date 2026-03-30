# 前端開發規則

## 技術棧

- React 19 + Next.js 15 + TypeScript
- 樣式：SCSS 優先，Tailwind CSS 輔助
- UI 元件庫：shadcn/ui
- 狀態管理：Redux Toolkit + Redux-Saga
- 表單：react-hook-form
- 資料表格：TanStack React Table
- 變數管理：useImmer

## 檔案結構規範

新頁面建在 `src/app/stock/` 下，每個頁面包含：

- `page.tsx` — 路由和頁面結構
- `content.tsx` — 頁面內容和邏輯
- `page.module.scss` — 頁面樣式

## 元件規範

- Component 放在 `src/components/` 下
- 每個 component 獨立檔案
- 優先使用 shadcn/ui 元件

## 效能

- 避免不必要的 re-render
- 善用 `useMemo`、`useCallback`、`React.memo`

## API 呼叫

- 使用專案既有的 Redux + Saga 模式
- 呼叫後端 API 時帶 `Authorization: Bearer <token>`
