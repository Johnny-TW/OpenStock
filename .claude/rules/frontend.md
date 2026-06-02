# 前端開發規則

## 技術棧

- React 19 + Next.js 15 + TypeScript
- 樣式：SCSS 優先，Tailwind CSS 輔助
- UI 元件庫：shadcn/ui
- 狀態管理：TanStack React Query
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

- 使用 React Query Hooks（`use-stock-query.ts`、`use-watchlist-query.ts`、`use-analysis-query.ts`）
- 底層透過 `api-client.ts` 的 `fetchAPI` / `postAPI` / `patchAPI` / `deleteAPI` 呼叫後端
- 呼叫後端 API 時帶 `Authorization: Bearer <token>`
- Token 由 `AuthSync.tsx` 呼叫 `setAccessToken()` 注入至 `api-client` 模組快取，不直接存 Redux

## SSE 串流

- `useAnalyzeMarketStream`：AI 市場分析串流，直接用 `fetch` + `ReadableStream` 解析 SSE，不走 React Query
- `useStockChat`：個股 AI 對話串流，維護 `messages` 狀態，逐字更新最後一則 assistant 訊息
- SSE 端點需手動帶 `Authorization` header（無法用 axios interceptor）
- 使用 `AbortController` 中斷串流，避免元件 unmount 後繼續寫入 state

## 通知

- 全域通知使用 `sonner` 的 `toast`（`toast.success` / `toast.error`）
- `Toaster` 掛載在 `layout.tsx`，取代原有 Redux AlertDialog
