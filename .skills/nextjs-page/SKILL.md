---
name: nextjs-page
description: "Use when: creating new pages under /stock, scaffolding Next.js page structure with page.tsx, client component, and SCSS module. Includes Redux-Saga integration and shadcn/ui conventions."
---

# Skill: Next.js 頁面開發

## 觸發條件
當需要在 `/stock` 下新增頁面時使用。

## 規則

### 檔案結構
每個頁面資料夾必須包含三個檔案：
```
src/app/stock/<page-name>/
├── page.tsx           # 路由入口，Server Component
├── <page-name>-client.tsx  # Client Component，頁面邏輯
└── page.module.scss   # 頁面樣式
```

### page.tsx 模板
```tsx
import PageClient from "./<page-name>-client"

export default function Page() {
  return <PageClient />
}
```

### Client Component 模板
```tsx
"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { PageHeader } from "@/components/commons/page-header"
import styles from "./page.module.scss"

export default function PageClient() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch({ type: "GET_<ACTION>", data: {} })
  }, [dispatch])

  return (
    <div className={styles.container}>
      <PageHeader title="頁面標題" subtitle="頁面描述" />
    </div>
  )
}
```

### 狀態管理
- Redux action type 命名：`GET_<RESOURCE>`、`SET_<RESOURCE>`
- Saga 檔案放 `src/redux/saga/<name>.jsx`
- Reducer 檔案放 `src/redux/reducer/<name>.jsx`
- API 常數放 `src/redux/api/API.jsx`

### 樣式規則
- 使用 SCSS Module（`.module.scss`）
- 變數用 CSS Custom Properties：`hsl(var(--primary))`
- 元件最外層 class 命名為 `.container`

### UI 元件
- 優先使用 `src/components/ui/` 下的 shadcn/ui 元件
- 共用元件放 `src/components/commons/`
- 文案一律繁體中文
