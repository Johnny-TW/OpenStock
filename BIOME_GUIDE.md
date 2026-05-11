# Biome 程式碼品質工具指南

## 概覽

本專案使用 [Biome](https://biomejs.dev/) 作為統一的 Linter + Formatter，取代 ESLint + Prettier 組合。
配置檔位於根目錄 `biome.json`，前後端共用。

## 指令速查

| 指令 | 說明 | 執行位置 |
|------|------|----------|
| `pnpm lint` | 檢查全部（lint + format） | 根目錄 |
| `pnpm lint:fix` | 自動修復全部問題 | 根目錄 |
| `pnpm format` | 僅格式化（自動寫入） | 根目錄 |
| `npx biome check --write .` | 等同 lint:fix | 任意位置 |
| `npx biome ci .` | CI 用（不寫入，有錯回傳非零） | CI 環境 |
| `npx biome explain <rule>` | 查看某條規則的詳細說明 | 任意位置 |

後端也有獨立指令（在 `backend/` 目錄下）：

```bash
cd backend
pnpm lint          # biome check src/ test/
pnpm lint:fix      # biome check --write src/ test/
pnpm format        # biome format --write src/ test/
```

## 自動化流程（Git Hook）

```
git commit
    │
    ▼
┌─────────────────────────────────────────┐
│  pre-commit hook（Husky）               │
│  執行 pnpm lint-staged                  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ lint-staged 規則：               │    │
│  │ frontend/**/*.{js,ts,jsx,tsx}   │    │
│  │ backend/**/*.{ts,js}            │    │
│  │ → biome check --write           │    │
│  │   --no-errors-on-unmatched      │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  commit-msg hook（Husky）               │
│  執行 pnpm commitlint --edit $1        │
│  驗證 commit message 格式              │
└─────────────────────────────────────────┘
    │
    ▼
  commit 成功 ✓
```

**流程說明：**

1. 執行 `git commit` 時，Husky 觸發 `pre-commit` hook
2. `lint-staged` 僅對暫存區（staged）的檔案執行 Biome 檢查
3. Biome 自動修復可修復的問題（`--write`），並將修正後的檔案重新加入暫存區
4. 若仍有無法自動修復的錯誤，commit 被阻擋
5. 通過 lint 後，`commit-msg` hook 驗證 commit message 格式（commitlint）
6. 全部通過才允許 commit

## 配置重點

### 格式化設定

| 設定 | 值 |
|------|-----|
| 縮排風格 | 空格（space） |
| 縮排寬度 | 2 |
| 行寬上限 | 100 字元 |
| 引號（後端） | 單引號 `'` |
| 引號（前端） | 雙引號 `"` |
| 尾隨逗號 | 全部加（trailingCommas: all） |
| JSON 尾隨逗號 | 不加 |

### 前後端差異（overrides）

```json
{
  "overrides": [
    {
      "includes": ["frontend/**"],
      "javascript": { "formatter": { "quoteStyle": "double" } }
    }
  ]
}
```

### 忽略的目錄

- `dist`、`.next`、`coverage`、`playwright-report`、`test-results`
- `backend/src/generated`（Prisma 自動產生）

### 關閉的規則（與原因）

| 規則 | 原因 |
|------|------|
| `noExplicitAny` | 漸進式 TypeScript 遷移中 |
| `noNonNullAssertion` | 部分場景需要 `!` 斷言 |
| `useImportType` | 避免強制改寫現有 import |
| `noForEach` | 允許使用 forEach |
| 多數 a11y 規則 | 內部工具，暫不強制無障礙 |

## VS Code 整合

安裝 [Biome VS Code 擴充套件](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) 後，儲存時自動格式化：

```jsonc
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit"
  }
}
```

## 常見問題

### Q: 為什麼 commit 被擋住？

執行 `pnpm lint` 查看錯誤，再用 `pnpm lint:fix` 自動修復。若仍有錯誤需手動處理。

### Q: 如何暫時跳過 hook？

```bash
git commit --no-verify -m "type(scope): 描述"
```

> ⚠️ 僅限緊急情況，PR 前仍須確保 lint 通過。

### Q: 如何查看某條規則的說明？

```bash
npx biome explain lint/correctness/noUnusedImports
```
