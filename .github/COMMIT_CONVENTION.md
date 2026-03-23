# Commit Message Convention

> 本專案採用 **Emoji + Conventional Commits** 格式，AI agent 撰寫 commit 時請嚴格遵守以下規範。

---

## 格式結構

```
<emoji> <type>(<scope>): <subject>

- <detail 1>
- <detail 2>
- ...

<footer>（選填）
```

### 各欄位說明

| 欄位 | 必填 | 說明 |
|------|------|------|
| `emoji` | ✅ | 對應 type 的 emoji，見下表 |
| `type` | ✅ | commit 類型關鍵字，英文小寫 |
| `scope` | ⬜ | 影響範圍，如 `frontend`、`backend`、`ci`、元件名稱 |
| `subject` | ✅ | 簡短標題，繁體中文，不超過 50 字，不加句號 |
| `body` | ⬜ | 用 `- ` 列點說明具體變更，每點一行 |
| `footer` | ⬜ | 影響範圍統計、breaking change、issue 關聯 |

---

## Type 與 Emoji 對照表

| Emoji | Type | 使用時機 |
|-------|------|----------|
| ✨ | `feat` | 新增功能 |
| 🔧 | `fix` | 修復 bug、設定錯誤、路徑錯誤 |
| ♻️ | `refactor` | 重構，不新增功能也不修 bug |
| 🎨 | `style` | 調整 UI 樣式、CSS、排版（不影響邏輯） |
| 📝 | `docs` | 文件新增或修改 |
| 🧪 | `test` | 新增或修正測試 |
| 🚀 | `perf` | 效能優化 |
| 🏗️ | `build` | 建置系統、依賴套件變更（如 package.json） |
| 🤖 | `ci` | CI/CD 設定（GitHub Actions、Dockerfile 等） |
| 🔥 | `chore` | 雜項維護，如刪除不用的檔案、更新工具設定 |
| ⏪ | `revert` | 還原先前的 commit |

---

## Subject 撰寫規則

- 使用**繁體中文**
- 動詞開頭：修正、新增、移除、優化、更新、重構、調整
- 不超過 **50 個字**
- 結尾不加句號（`。`）
- 禁止使用 `update`、`fix bug`、`change` 等過於模糊的描述

---

## Body（列點說明）格式

```
- <動詞> <元件/檔案/模組> <具體做了什麼>
```

**範例：**
- 新增 `frontend/eslint.config.mjs`（flat config），安裝 eslint@9 + eslint-config-next@15 解決 CI lint 失敗
- 修正 `backend/src/main.ts` no-floating-promises 警告，改用 `void bootstrap()`
- 移除 `dialog-provider.tsx` 全域半透明 Loading 遮罩，保留表格內 loading 動畫
- 更新 `middleware.ts` matcher 為排除靜態資源的 regex 模式

### 列點規則
- 每點以 `- ` 開頭
- 說明**技術細節**：元件名稱、改動原因、對應方案
- 跨多個檔案時，每個檔案建議獨立一點
- 若涉及套件版本，請標示版本號（如 `eslint@9`）

---

## Footer（選填）格式

```
影響 N 個檔案，涵蓋 <模組1>、<模組2>、<模組3>
```

或關聯 issue：
```
Closes #123
Related: #456
```

---

## 完整範例

### 範例一（fix，多檔案修正）

```
🔧 fix: 修復前端建置錯誤與 ESLint 設定，優化 loading 體驗

- 新增 frontend/eslint.config.mjs（flat config），安裝 eslint@9 + eslint-config-next@15 解決 CI lint 失敗
- 修正 backend/src/main.ts no-floating-promises 警告，改用 void bootstrap()
- 修正 Sidebar.tsx import 路徑錯誤，nav-user.tsx → NavUser.tsx、nav-projects.tsx → NavProjects.tsx
- 移除 dialog-provider.tsx 全域半透明 Loading 遮罩，保留表格內 loading 動畫
- 修正 stock-client.tsx loading 判斷邏輯，確保先顯示 loading 再渲染資料
- 更新 middleware.ts matcher 為排除靜態資源的 regex 模式

影響 10 個檔案，涵蓋 ESLint 設定、Sidebar 元件、Stock 頁面、Middleware
```

### 範例二（feat，有 scope）

```
✨ feat(stock): 新增個股歷史走勢圖表頁面

- 新增 index-history-client.tsx，使用 Recharts 渲染 K 線圖
- 串接 /api/stock/history 端點，支援日/週/月切換
- 新增 useStockHistory hook 封裝資料請求邏輯

影響 4 個檔案，涵蓋 Stock 頁面、API 路由、Hooks
```

### 範例三（ci，CI 設定）

```
🤖 ci: 新增 GitHub Actions CI 流程，支援前後端分離偵測

- 新增 detect-changes job，使用 dorny/paths-filter 偵測異動範圍
- 前端僅在 frontend/** 有變更時觸發 lint 與 build
- 後端僅在 backend/** 有變更時觸發 lint 與 build
- 設定 concurrency 避免同一 branch 重複執行
```

### 範例四（refactor，帶 scope）

```
♻️ refactor(api): 統一 API 回應格式，抽離 withApiHandler 工具函式

- 新增 utils/withApiHandler.ts，統一包裝 try/catch 與 HTTP 狀態碼
- 重構 stock.ts、auth route 改用 withApiHandler
- 移除各 API 路由中重複的錯誤處理邏輯
```

---

## AI 撰寫 Commit 的檢查清單

在輸出 commit message 前，請確認：

- [ ] Emoji 與 type 是否對應正確
- [ ] Subject 是否為繁體中文且不超過 50 字
- [ ] Subject 是否以動詞開頭
- [ ] Body 列點是否說明了**檔案名稱**與**具體變更原因**
- [ ] 是否有遺漏重要的異動檔案
- [ ] 若影響多個模組，footer 是否有統計說明

---

## 不符合規範的範例（反例）

```
# ❌ 錯誤：沒有 emoji、描述過於模糊
fix: update files

# ❌ 錯誤：英文 subject、缺少細節
🔧 fix: fix loading bug

# ❌ 錯誤：沒有列點說明、subject 過長
✨ feat: 新增了一個股票頁面並且修改了 API 接口以及調整了 Loading 狀態的顯示邏輯還有移除了舊的元件
```
