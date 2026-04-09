---
name: git-worktree
description: "Use when: developing multiple features in parallel, creating isolated work environments with git worktree. Includes setup, port management, merging, and multi-agent coordination."
---

# Skill: Git Worktree 多 Agent 並行開發

## 觸發條件
當需要同時開發多個獨立功能，且希望隔離工作環境時使用。

## 概念
Git Worktree 允許在同一個 repository 中同時 checkout 多個分支到不同目錄，
每個 worktree 都是獨立的工作環境，適合指揮多個 AI Agent 並行開發。

## 使用流程

### 建立 Worktree
```bash
# 從 develop 分支建立新 worktree
git worktree add ../stocksmart-feat-xxx feat/xxx

# 列出所有 worktree
git worktree list
```

### 目錄結構
```
Desktop/
├── nextjs-course-main/          # 主工作目錄（develop）
├── stocksmart-feat-filter/      # Agent A: 產業篩選功能
└── stocksmart-feat-export/      # Agent B: 匯出功能
```

### 每個 Worktree 初始化
```bash
cd ../stocksmart-feat-xxx
cd frontend && pnpm install
cd ../backend && pnpm install
```

### 合併回主分支
```bash
# 回到主目錄
cd ../nextjs-course-main
git merge feat/xxx

# 清除 worktree
git worktree remove ../stocksmart-feat-xxx
```

## 注意事項
- 每個 worktree 需要各自 `pnpm install`
- 資料庫共用同一個 PostgreSQL，注意 migration 衝突
- Worktree 完成後記得清除：`git worktree prune`
- 建議用不同 port 避免衝突（在 .env 中調整）

## 搭配 AI Agent
1. 在 VS Code 開啟多個視窗，每個視窗對應一個 worktree
2. 每個視窗啟動獨立的 Copilot/Claude 對話
3. 各自在隔離環境中開發、測試
4. 完成後合併、刪除 worktree
