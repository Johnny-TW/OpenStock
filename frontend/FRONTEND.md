# 前端架構文件（Frontend）

## 技術棧

| 層級 | 技術 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 15.4.3 |
| UI 層 | React / React DOM | 19.1.0 |
| 狀態管理 | @reduxjs/toolkit + redux-saga | 2.11.2 / 1.4.2 |
| 認證 | next-auth (Azure AD) | 4.24.13 |
| HTTP 客戶端 | axios | 1.13.5 |
| UI 元件庫 | shadcn/ui (Radix UI) | new-york style |
| 樣式 | TailwindCSS v4 + SCSS | 4 / 1.97.3 |
| 表格 | @tanstack/react-table | 8.21.3 |
| 資料擷取 | @tanstack/react-query | 5.90.21 |
| 表單 | react-hook-form | 7.71.2 |
| 圖表 | recharts | 2.15.4 |
| 拖放 | @dnd-kit | 6.3.1+ |
| 圖標 | lucide-react / @tabler/icons-react | 0.575.0 / 3.37.1 |
| 語言 | TypeScript | 5 |
| 套件管理 | pnpm | — |

---

## 目錄結構

```
frontend/src/
├── app/                        # Next.js 15 App Router
│   ├── layout.tsx              # 根 Layout（Provider 巢狀結構）
│   ├── page.tsx                # 首頁
│   ├── api/
│   │   └── me/photo/route.ts   # API Route：從 MS Graph 取使用者大頭照
│   ├── auth/                   # OAuth callback 路由
│   ├── login/                  # 登入頁面
│   └── stock/                  # 股票功能頁面群組
│       ├── page.tsx
│       ├── stock-client.tsx
│       ├── valuation/          # 估值分析
│       ├── market-index/       # 大盤指數
│       ├── top-volume/         # 成交量排行
│       ├── intraday/           # 盤中即時
│       └── index-history/      # 指數歷史
│
├── components/
│   ├── commons/                # shadcn/ui 基礎元件（button, card, dialog…）
│   ├── data-table/             # TanStack React Table 封裝
│   │   └── stock/data-table.tsx
│   ├── layouts/                # 版面元件
│   │   ├── Header.tsx          # 麵包屑導覽
│   │   ├── Footer.tsx          # 頁尾
│   │   └── sidebar/            # 側邊欄（NavMain, NavUser, TeamSwitcher）
│   └── views/                  # 頁面專屬 View 元件（預留）
│
├── redux/
│   ├── store.jsx               # Redux Store + Saga middleware
│   ├── types.ts                # RootState / AppDispatch 型別
│   ├── reducer/                # auth, stock, api reducers
│   ├── saga/                   # fetchApi 核心 saga + stock watchers
│   └── api/                    # API 路徑常數 + axios 封裝
│
├── providers/
│   ├── SessionProvider.tsx     # next-auth session wrapper
│   ├── ReduxProvider.tsx       # Redux Provider
│   ├── QueryProvider.tsx       # React Query（staleTime: 60s）
│   ├── AuthSync.tsx            # 同步 next-auth session → Redux
│   ├── PermissionGuard.tsx     # 路由權限守衛
│   └── LoginHandler.tsx        # login() / logout() 函式
│
├── server/auth.jsx             # Azure AD + next-auth 核心設定
├── hooks/                      # 自訂 Hooks（useAppDispatch, useRouter, useIsMobile）
├── api/stock.ts                # Next.js server fetch（revalidate: 60s）
├── config/constants.ts         # 業務常數（SUCCESS: 1, ERROR: 0）
├── constants/azure.ts          # Azure AD 登出 URL
├── styles/                     # globals.css (Tailwind) + main.scss (SCSS)
├── type/stock.ts               # TypeScript 型別定義
├── utils/                      # apiResponse, withApiHandler, import
├── lib/utils.ts                # cn()（clsx + tailwind-merge）
├── images/                     # 靜態圖片資源
└── middleware.ts               # Next.js Edge Middleware（目前 pass-through）
```

---

## 頁面檔案慣例

每個新頁面遵循固定三檔結構：

```
src/app/[feature]/
├── page.tsx            # 路由進入點，最小化 wrapper
├── content.tsx         # Client Component，含業務邏輯
└── page.module.scss    # 頁面專屬樣式
```

範例：`/stock/page.tsx` → import `StockClient` → dispatch `GET_STOCK_DAILY_ALL` → 渲染 `<StockDataTable />`

---

## Provider 巢狀順序

```
SessionProvider (next-auth)
  → QueryProvider (React Query)
    → ReduxProvider (Redux)
      → AuthSync (session → Redux 同步)
        → DialogProvider (全域對話框)
          → PermissionGuard (路由保護)
            → SidebarProvider
              → [ Sidebar + Header + Main + Footer ]
```

---

## 認證流程：Azure AD + JWT

### 系統中的三種 Token

| Token | 發行者 | 用途 | 壽命 |
|-------|--------|------|------|
| Azure AD Access Token | Microsoft | 呼叫 MS Graph API（大頭照等） | ~1 小時 |
| Session Cookie (JWT) | next-auth（SECRET 簽章） | 瀏覽器 cookie，標識登入狀態 | 隨 session |
| 自簽 JWT | App Server（JWT_SECRET 簽章） | 前端呼叫 Backend API 用 | 3 小時 |

### 完整流程

```
使用者點擊登入（Azure AD）
    │
    ▼
① Azure AD OAuth 2.0 授權碼流程
   scope: "openid profile email User.Read"
   Microsoft 回傳 authorization code
   next-auth 用 code 換取 id_token + access_token
    │
    ▼
② jwt callback（auth.jsx）- 每次 session 存取時觸發
   首次登入時：
   ├─ 儲存 Azure AD access_token → token.accessToken
   ├─ 解碼 access_token 取出使用者資訊
   │  （email, name, oid, sub, iss）
   └─ 組成 token.userProfile
    │
    ▼
③ encode（auth.jsx）
   jwt.sign(整個 token 物件, SECRET)
   → 存入瀏覽器 cookie（名稱 = SESSION_TOKEN_NAME）
   cookie 內容 = { accessToken: "Azure AD token", userProfile: {...} }
    │
    ▼
    ┌──────────────────┬───────────────────┐
    │                  │                   │
    ▼                  ▼                   ▼
路線 A              路線 B              路線 C
/api/me/photo       session callback    AuthSync
│                   │                   │
│                   ▼                   ▼
│                ④ 用 JWT_SECRET       ⑤ 監聽 session
│                  自簽新 JWT            同步到 Redux
│                  （含 user 資訊）       dispatch AUTH_RESULT
│                  expiresIn: 3h        │
│                   │                   ▼
│                   ▼                Redux saga 送 API 時
│               session.accessToken   附帶 Authorization:
│               = 自簽 JWT            Bearer {自簽 JWT}
│                                      │
▼                                      ▼
從 cookie 取出                      Backend 用 JWT_SECRET
Azure AD token                      驗證 → 取得 user
呼叫 Graph API
/me/photo/$value
回傳使用者大頭照
```

### 重要環境變數

| 變數 | 用途 |
|------|------|
| `AZURE_AD_CLIENT_ID` | Azure AD App 註冊的 Client ID |
| `AZURE_AD_CLIENT_SECRET` | Azure AD Client Secret |
| `AZURE_AD_TENANT_ID` | Azure AD Tenant ID |
| `SECRET` | next-auth 加密 session cookie 用 |
| `JWT_SECRET` | 自簽 JWT 給 Backend API 驗證用 |
| `SESSION_TOKEN_NAME` | Cookie 名稱 |
| `NEXT_PUBLIC_API_HOST` | Backend API 基礎 URL |
| `NEXT_PUBLIC_AZURE_LOGOUT_URL` | Azure AD 登出重導向 URL |

---

## 狀態管理：Redux + Redux-Saga

### Reducer 一覽

| Reducer | State | 對應 Actions |
|---------|-------|-------------|
| auth | `session`, `token`, `user` | `AUTH_RESULT`, `LOGOUT` |
| stock | `dailyAll`, `valuation`, `marketIndex`, `topVolume`, `intraday`, `indexHistory` | `SET_STOCK_*` |
| api | `loading`, `loadingStack`, `error`, `success`, `deleted` | `SET_LOADING`, `SET_API_ERROR`, `SET_API_SUCCESS` |

### API 呼叫流程

```
元件 dispatch({ type: "GET_STOCK_DAILY_ALL" })
    ↓ (Redux-Saga 攔截)
fetchApi({ method: GET, path: "stock/daily-all", reducer: "SET_STOCK_DAILY_ALL" })
    ↓ (apiService.jsx / axios)
axios.get("stock/daily-all", { headers: { Authorization: Bearer {token} } })
    ↓
Reducer: SET_STOCK_DAILY_ALL → 更新 state.stock.dailyAll
```

### 錯誤處理策略

| HTTP 狀態碼 | 處理方式 |
|------------|---------|
| 401 | 觸發重新登入 |
| 502 / 400 | 清除 cookie + 重新載入頁面 |
| 其他 | 顯示錯誤訊息 |

---

## 樣式系統

- **TailwindCSS v4**：主要樣式方案，透過 `@tailwindcss/postcss` 整合
- **SCSS**：`main.scss` 載入 `_variables`, `_layout`, `_globals` 三支子檔
- **shadcn/ui**：`components.json` 設定 new-york style、lucide 圖標、neutral 底色
- **字體**：Geist Sans（預設）/ Geist Mono（程式碼）+ Material Icons
- **響應式**：`useIsMobile()` hook 偵測 768px 斷點

---

## 關鍵設定

### tsconfig.json 路徑別名

```json
{
  "@/*": ["./src/*"],
  "@components/*": ["./src/components/*"],
  "@config/*": ["./src/config/*"],
  "@redux/*": ["./src/redux/*"],
  "@providers/*": ["./src/providers/*"],
  "@hooks/*": ["./src/hooks/*"],
  "@server/*": ["./src/server/*"],
  "@styles/*": ["./src/styles/*"],
  "@type/*": ["./src/type/*"],
  "@utils/*": ["./src/utils/*"]
}
```

### 腳本指令

```bash
pnpm dev        # 開發伺服器
pnpm build      # 正式建置
pnpm start      # 啟動正式版
pnpm lint       # ESLint 檢查
pnpm prettier   # 程式碼格式化
```
