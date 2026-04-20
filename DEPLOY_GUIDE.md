# 部署學習指南 — StockSmart

## 整體架構圖

```
                    GitHub Repository
                          │
              ┌───── push ─────┐
              ▼                ▼
        develop 分支       main 分支
              │                │
     CI (lint/test/build)  CI (lint/test/build)
              │                │
     Build Docker Image   Build Docker Image
              │                │
     Push to GHCR (:qas)  Push to GHCR (:prd)
              │                │
     SSH Deploy ──────┐   SSH Deploy ──────┐
                      ▼                    ▼
              ┌──────────────┐   ┌──────────────┐
              │  QAS Server  │   │  PRD Server  │
              │  :3000 前端   │   │  :3010 前端   │
              │  :3004 後端   │   │  :3014 後端   │
              │  :5436 DB    │   │  :5437 DB    │
              └──────────────┘   └──────────────┘
```

---

## 一、在本機先學會 Docker

### 1.1 驗證 Docker 環境

```bash
docker --version        # 需要 Docker Desktop 或 OrbStack
docker compose version  # 需要 v2+
```

### 1.2 先單獨建置後端 image（最快看到成果）

```bash
cd backend
docker build -t stocksmart-backend:dev .
docker run --rm -p 3004:3004 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5435/stocksmart?schema=public" \
  -e JWT_SECRET="test-secret" \
  stocksmart-backend:dev
```

打開 http://localhost:3004/api/docs 看到 Swagger 就成功了！

### 1.3 建置前端 image

```bash
cd frontend
docker build -t stocksmart-frontend:dev \
  --build-arg NEXT_PUBLIC_API_HOST=http://localhost:3004 .
docker run --rm -p 3000:3000 stocksmart-frontend:dev
```

### 1.4 用 docker compose 一次啟動整個 QAS 環境

```bash
# 回到專案根目錄
cd /path/to/nextjs-course-main

# 複製環境設定範本
cp .env.qas.example .env.qas

# 編輯 .env.qas，填入你的真實值
# 注意：DB_PASSWORD 請設一個安全的密碼

# 啟動 QAS 環境
docker compose -f docker-compose.qas.yml --env-file .env.qas up -d --build

# 查看 log
docker compose -f docker-compose.qas.yml logs -f

# 停止
docker compose -f docker-compose.qas.yml down
```

啟動後的服務：
| 服務 | 網址 |
|------|------|
| 前端 | http://localhost:3000 |
| 後端 API | http://localhost:3004 |
| Swagger | http://localhost:3004/api/docs |
| PostgreSQL | localhost:5436 |

---

## 二、免費雲端環境練習部署

### 方案 A：最快上手 — Vercel + Railway

**適合**：快速體驗「推 code → 自動部署 → 使用者可以用」的流程。

#### 前端 → Vercel（免費）

1. 到 https://vercel.com 用 GitHub 帳號登入
2. Import 你的 GitHub repo
3. 設定：
   - **Framework**: Next.js
   - **Root Directory**: `frontend`
   - **Environment Variables**: 加入 `.env.example` 裡的所有變數
4. Deploy → 會拿到 `https://your-project.vercel.app`

#### 後端 → Railway（免費額度 $5/月）

1. 到 https://railway.com 用 GitHub 帳號登入
2. New Project → Deploy from GitHub Repo
3. 設定：
   - **Root Directory**: `backend`
   - **Start Command**: `npx prisma migrate deploy && node dist/main`
   - **Environment Variables**: 加入 `backend/.env.example` 的變數
4. 加一個 PostgreSQL 服務（Railway 一鍵建立）
5. 把 Railway 給的 DATABASE_URL 填回後端環境變數
6. Deploy → 拿到 `https://your-backend.up.railway.app`

#### 串接

把 Railway 後端網址填到 Vercel 的 `NEXT_PUBLIC_API_HOST` 環境變數，重新部署前端。

### 方案 B：完整學習 — VPS + Docker

**適合**：學習 Linux 伺服器管理、SSH、Docker 部署的完整流程。

#### 推薦的便宜 VPS

| 平台 | 最低價格 | 特色 |
|------|---------|------|
| [Oracle Cloud](https://cloud.oracle.com) | **永久免費** | ARM 4核24G，超夠用 |
| [Hetzner](https://hetzner.com) | €3.29/月 | 歐洲，效能好 |
| [DigitalOcean](https://digitalocean.com) | $4/月 | 新手友善 |

#### 伺服器初始設定

```bash
# SSH 連進去
ssh root@your-server-ip

# 安裝 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安裝 Docker Compose
sudo apt install docker-compose-plugin -y

# 建立專案目錄
mkdir -p /opt/stocksmart
cd /opt/stocksmart

# 把 docker-compose 和 .env 上傳
# 方式一：scp
scp docker-compose.qas.yml .env.qas user@server:/opt/stocksmart/

# 方式二：git clone 整個專案
git clone https://github.com/your-username/nextjs-course-main.git .
cp .env.qas.example .env.qas
nano .env.qas  # 編輯環境變數

# 啟動
docker compose -f docker-compose.qas.yml --env-file .env.qas up -d --build
```

---

## 三、GitHub Actions CD 流程說明

### 已建立的 workflow

| 檔案 | 觸發條件 | 部署目標 |
|------|---------|---------|
| `deploy-qas.yml` | push 到 `develop` | QAS 環境 |
| `deploy-prd.yml` | push 到 `main` | PRD 環境 |

### 需要在 GitHub 設定的 Secrets

到 GitHub → Settings → Secrets and variables → Actions 設定：

```
# QAS 環境
QAS_SERVER_HOST    → 你的 QAS 主機 IP
QAS_SERVER_USER    → SSH 使用者名稱
QAS_SERVER_SSH_KEY → SSH 私鑰（整個 .pem 內容）

# PRD 環境
PRD_SERVER_HOST    → 你的 PRD 主機 IP
PRD_SERVER_USER    → SSH 使用者名稱
PRD_SERVER_SSH_KEY → SSH 私鑰

# Variables（非 secret）
QAS_API_HOST       → http://qas-server:3004
PRD_API_HOST       → https://api.your-domain.com
PRD_APP_URL        → https://your-domain.com
```

### 完整部署流程（模擬業界）

```
1. 開 feature branch 開發新功能
   git checkout -b feature/new-chart

2. 開發完成，push 並開 PR 到 develop
   git push origin feature/new-chart
   → CI 自動跑 lint / test / build

3. Code Review 通過，merge 到 develop
   → CD 自動部署到 QAS
   → 通知使用者去 QAS 環境測試

4. QAS 測試通過，開 PR: develop → main
   → CI 再跑一次確認

5. Merge 到 main
   → CD 自動部署到 PRD
   → 正式上線！
```

---

## 四、多環境 Git 分支策略

```
main（PRD 正式環境）
 │
 └── develop（QAS 測試環境）
      │
      ├── feature/xxx（功能開發）
      ├── feature/yyy
      └── fix/zzz（修 bug）
```

| 分支 | 用途 | 部署到 |
|------|------|--------|
| `main` | 穩定的正式版本 | PRD |
| `develop` | 整合測試 | QAS |
| `feature/*` | 新功能開發 | 無（只跑 CI） |
| `fix/*` | 修復 bug | 無（只跑 CI） |
| `hotfix/*` | 緊急修復 | 直接 PR 到 main |

---

## 五、學習 Checklist

按照順序一步步來，不要跳步驟：

### Level 1：Docker 基礎（在本機練）
- [ ] 理解 Dockerfile 每一行的意思
- [ ] 能 `docker build` 建置 image
- [ ] 能 `docker run` 啟動 container
- [ ] 能用 `docker compose up` 一次啟動多個服務
- [ ] 理解 multi-stage build 為什麼能縮小 image 大小

### Level 2：雲端部署（Vercel + Railway）
- [ ] 把前端部署到 Vercel
- [ ] 把後端部署到 Railway
- [ ] 把資料庫部署到 Railway 或 Supabase
- [ ] 前後端串接成功，使用者能正常使用

### Level 3：VPS 部署（Oracle Cloud 免費）
- [ ] 租一台 VPS，用 SSH 連進去
- [ ] 在 VPS 安裝 Docker
- [ ] 把 QAS 環境部署到 VPS
- [ ] 設定防火牆規則，只開放需要的 port
- [ ] 設定 domain name 指向 VPS（可用免費的 .tk 或 DuckDNS）

### Level 4：CI/CD 自動化
- [ ] GitHub Actions CD 能自動部署到 QAS
- [ ] 理解 GitHub Secrets 和 Environment 的差別
- [ ] 能手動觸發 workflow_dispatch 重新部署
- [ ] PRD 部署需要手動核准（environment protection rules）

### Level 5：進階（面試加分題）
- [ ] 加 Nginx 反向代理 + HTTPS（Let's Encrypt）
- [ ] 設定 health check endpoint
- [ ] 加 monitoring（Uptime Kuma，免費自架）
- [ ] 資料庫自動備份 script
- [ ] 加 rollback 機制（回滾到前一版 image）
