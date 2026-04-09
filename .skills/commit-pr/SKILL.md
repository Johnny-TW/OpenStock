---
name: commit-pr
description: "Use when: committing code changes, creating pull requests, generating commit messages. Follows emoji + conventional commits format with Traditional Chinese subjects and structured PR body."
---

# Skill: 自動生成 Commit 與 PR

## 觸發條件
當完成一組功能變更，需要提交 commit 或建立 PR 時使用。

## Commit 生成流程

### Step 1: 分析變更
```bash
git diff --stat
git diff --name-only
```

### Step 2: 判斷 Type
根據變更內容自動判斷：
| 變更類型 | Type | Emoji |
|---------|------|-------|
| 新增功能 / 新頁面 / 新 API | feat | ✨ |
| 修 bug、路徑、設定錯誤 | fix | 🔧 |
| 重構不影響功能 | refactor | ♻️ |
| 純 CSS / SCSS 調整 | style | 🎨 |
| 新增測試 | test | 🧪 |
| CI/CD 設定 | ci | 🤖 |
| 依賴、建置 | build | 🏗️ |
| 雜項 | chore | 🔥 |

### Step 3: 生成 Commit Message
格式：
```
<emoji> <type>(<scope>): <繁體中文描述>

- <檔案/模組> <具體變更說明>
- <檔案/模組> <具體變更說明>

影響 N 個檔案，涵蓋 <模組列表>
```

規則：
- Subject 使用繁體中文，動詞開頭（新增、修正、優化、移除...）
- Body 每點說明具體檔案與原因
- 禁止模糊描述（update files, fix bug）
- Scope 範例：frontend, backend, ci, heatmap, analysis

### Step 4: 執行提交
```bash
git add -A
git commit -m "<message>"
```

## PR 生成流程

### PR 標題
同 commit subject 格式：`<emoji> <type>(<scope>): <描述>`

### PR Body 模板
```markdown
## 變更摘要
簡述本次 PR 的目標與變更內容。

## 變更清單
- [ ] 項目一
- [ ] 項目二

## 影響範圍
- 前端：是/否
- 後端：是/否
- 資料庫：是/否

## 測試
- [ ] 單元測試通過
- [ ] 手動測試通過
- [ ] CI 通過

## 截圖（若有 UI 變更）
```

## 範例

### 單一功能 Commit
```
✨ feat(heatmap): 新增產業篩選多選下拉式選單

- heatmap-client.tsx 新增 IndustryFilter 元件，支援搜尋與多選
- page.module.scss 新增篩選下拉選單相關樣式
- 熱力圖與產業卡片會跟隨篩選結果即時更新

影響 2 個檔案，涵蓋 heatmap
```

### 跨模組 Commit
```
🔧 fix(frontend): 修正 AI 分析逾時問題

- apiService.jsx call() 支援自訂 timeout 參數
- saga/index.jsx fetchApi 傳遞 timeout 給 call()
- saga/analysis.jsx analyzeMarket 設定 180 秒 timeout

影響 3 個檔案，涵蓋 redux
```
