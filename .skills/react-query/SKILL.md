---
name: react-query
description: "Use when: adding new API calls, server state management, React Query hooks, mutations, or data fetching patterns. Includes fetchAPI, api-client conventions, and query/mutation patterns."
---

# Skill: React Query 狀態管理

## 觸發條件
當需要新增 API 呼叫與伺服器狀態管理時使用。

## 規則

### 檔案對應
| 檔案 | 用途 |
|------|------|
| `src/hooks/use-stock-query.ts` | 股票行情、指數、排行榜、新聞 Hooks |
| `src/hooks/use-watchlist-query.ts` | 自選股 CRUD Hooks |
| `src/hooks/use-analysis-query.ts` | AI 分析 Hooks |
| `src/lib/api-client.ts` | axios 封裝（fetchAPI / postAPI / patchAPI / deleteAPI） |

### Query Hook 模板
```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api-client";
import type { <ResponseType> } from "@/type/stock";

export function use<Resource>() {
  return useQuery({
    queryKey: ["<module>", "<resource>"],
    queryFn: () => fetchAPI<<ResponseType>>("<module>/<resource>"),
    staleTime: 5 * 60 * 1000,
  });
}
```

### Mutation Hook 模板
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAPI, deleteAPI } from "@/lib/api-client";
import { toast } from "sonner";

export function useCreate<Resource>() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDto) => postAPI("<module>", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["<module>"] });
      toast.success("新增成功");
    },
    onError: () => toast.error("新增失敗"),
  });
}
```

### 元件中使用
```tsx
"use client";

import { use<Resource> } from "@/hooks/use-<module>-query";

export default function PageClient() {
  const { data, isLoading } = use<Resource>();

  if (isLoading || !data) return <Loading />;

  return <DataTable data={data.data} />;
}
```

### 長時間 API 呼叫
api-client.ts 已設定全域 timeout 為 300 秒（300000ms），足以涵蓋 AI 分析等長時間請求。
