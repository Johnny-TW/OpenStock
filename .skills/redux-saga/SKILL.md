---
name: redux-saga
description: "Use when: adding new API calls, Redux state management, saga workers, reducers, or dispatch patterns. Includes fetchApi, timeout configuration, and API constant conventions."
---

# Skill: Redux-Saga 狀態管理

## 觸發條件
當需要新增 API 呼叫與狀態管理時使用。

## 規則

### 檔案對應
| 檔案 | 用途 |
|------|------|
| `src/redux/api/API.jsx` | API 路徑常數 |
| `src/redux/saga/<name>.jsx` | 副作用處理（API 呼叫） |
| `src/redux/reducer/<name>.jsx` | 狀態更新 |
| `src/redux/types.ts` | RootState 型別定義 |

### API 常數
```javascript
// src/redux/api/API.jsx
export const API_<RESOURCE> = "<backend-path>"
```

### Saga 模板
```javascript
import { takeLatest } from "redux-saga/effects"
import { API_METHOD } from "../api/apiService"
import { API_<RESOURCE> } from "../api/API"
import { fetchApi } from "."

function* get<Resource>(action) {
  yield fetchApi({
    method: API_METHOD.GET,
    path: API_<RESOURCE>,
    reducer: "SET_<RESOURCE>",
    params: action.data ? { params: action.data } : {},
  })
}

function* create<Resource>(action) {
  yield fetchApi({
    method: API_METHOD.POST,
    path: API_<RESOURCE>,
    reducer: "SET_<RESOURCE>",
    data: action.data,
  })
}

export default function* <resource>Saga() {
  yield takeLatest("GET_<RESOURCE>", get<Resource>)
  yield takeLatest("CREATE_<RESOURCE>", create<Resource>)
}
```

### Reducer 模板
```javascript
const initialState = { data: null }

const <resource>Reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_<RESOURCE>":
      return { ...state, data: action.data }
    default:
      return state
  }
}

export default <resource>Reducer
```

### 長時間 API 呼叫
超過 60 秒的請求（如 AI 分析），在 saga 中加 `timeout`:
```javascript
yield fetchApi({ ..., timeout: 180000 })
```

### Dispatch 模式
```tsx
// Component 中使用
const dispatch = useAppDispatch()
const data = useAppSelector((state) => state.<resource>.data)

useEffect(() => {
  dispatch({ type: "GET_<RESOURCE>", data: params })
}, [dispatch])
```
