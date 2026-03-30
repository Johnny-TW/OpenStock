新增前端頁面指令：

在 `frontend/src/app/stock/` 下建立新頁面資料夾，包含：

```
frontend/src/app/stock/<page-name>/
├── page.tsx            # 路由層，Server Component
├── content.tsx         # 邏輯層，Client Component（'use client'）
└── page.module.scss    # 頁面樣式
```

page.tsx 範例結構：
```tsx
import Content from './content';
export default function PageName() {
  return <Content />;
}
```

content.tsx 注意事項：
- 加上 `'use client'` 指令
- 使用 useImmer 管理變數
- 表單使用 react-hook-form
- API 呼叫透過 Redux dispatch
- UI 元件優先使用 shadcn/ui
