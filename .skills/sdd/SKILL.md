---
name: sdd
description: "Use when: receiving new feature requests, planning development workflow. Generates YAML spec files in .specs/ before implementation. Covers requirement confirmation, spec generation, coding, and acceptance testing."
---

# Skill: 規格驅動開發 (SDD)

## 觸發條件
當收到新功能需求時，先產生規格文件再實作。

## 流程

### Phase 1: 需求確認
1. 釐清使用者需求，列出功能清單
2. 確認影響範圍（前端 / 後端 / 資料庫）
3. 產生規格文件 `.specs/<feature-name>.yaml`

### Phase 2: 規格生成
依照模板產生 YAML 規格檔，包含：
- 功能描述
- API 端點設計
- 資料模型
- 前端頁面結構
- 驗收標準

### Phase 3: 程式實作
依規格檔逐步實作：
1. 資料庫 Schema（若需要）
2. 後端 API
3. 前端頁面
4. 狀態管理

### Phase 4: 測試驗收
1. 後端 unit test
2. 手動 API 測試
3. 前端功能驗收
4. 更新規格檔狀態為 `completed`

## 規格檔模板
參見 `.specs/_template.yaml`
