# Symlinks 共用技能設定

本專案的 `.skills/` 目錄包含專案專屬的 Agent Skills。
若要在多個專案間共用這些技能，可透過 symlink 連結到全域技能目錄。

## 設定方式

### 建立全域技能目錄
```bash
mkdir -p ~/.agent-skills
```

### 將專案技能複製到全域
```bash
cp -r .skills/* ~/.agent-skills/
```

### 在其他專案中建立 symlink
```bash
cd /path/to/other-project
ln -s ~/.agent-skills .skills
```

### 或只連結部分技能
```bash
mkdir -p .skills
ln -s ~/.agent-skills/commit-pr .skills/commit-pr
ln -s ~/.agent-skills/prisma-db .skills/prisma-db
```

## 技能清單

| 技能 | 目錄 | 用途 |
|------|------|------|
| nextjs-page | `.skills/nextjs-page/` | Next.js 頁面開發模板 |
| nestjs-module | `.skills/nestjs-module/` | NestJS 模組開發模板 |
| prisma-db | `.skills/prisma-db/` | Prisma 資料庫操作 |
| redux-saga | `.skills/redux-saga/` | Redux-Saga 狀態管理 |
| sdd | `.skills/sdd/` | 規格驅動開發流程 |
| git-worktree | `.skills/git-worktree/` | Git Worktree 並行開發 |
| commit-pr | `.skills/commit-pr/` | 自動生成 Commit 與 PR |
| unit-test | `.skills/unit-test/` | 單元測試撰寫 |
