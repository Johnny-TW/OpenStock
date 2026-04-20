# Playwright E2E 測試指南

## 什麼是 Playwright

Playwright 是微軟開發的 E2E（End-to-End）測試框架，它會**真的打開瀏覽器**，模擬使用者的操作（點擊、輸入、導航），驗證畫面是否正確。

```
Unit Test（Jest）→ 測 function 邏輯對不對
E2E Test（Playwright）→ 測使用者看到的畫面對不對
```

---

## 建置流程

### Step 1：安裝套件

```bash
cd frontend

# 安裝 Playwright 測試框架
pnpm add -D @playwright/test

# 下載 Chromium 瀏覽器引擎（約 92MB）
npx playwright install chromium
```

### Step 2：建立設定檔

建立 `frontend/playwright.config.ts`：

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",            // 測試檔案放在 e2e/ 資料夾
  timeout: 30_000,             // 每個測試最多 30 秒
  expect: { timeout: 10_000 }, // 每個 expect 斷言最多等 10 秒
  fullyParallel: true,         // 測試案例平行執行
  retries: 1,                  // 失敗重試 1 次
  reporter: [                  // 報告格式
    ["html", { open: "never" }],  // HTML 報告（不自動打開）
    ["list"],                      // 終端機列表輸出
  ],
  use: {
    // 預設測試的網站網址（可用環境變數覆蓋）
    baseURL: process.env.BASE_URL || "http://localhost:3003",
    screenshot: "only-on-failure",  // 失敗時自動截圖
    trace: "on-first-retry",       // 第一次重試時記錄完整操作軌跡
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },  // 模擬桌面版 Chrome
    },
  ],
});
```

### Step 3：建立測試檔案

#### `e2e/login.spec.ts` — 登入頁面測試

```ts
import { test, expect } from "@playwright/test";

test.describe("登入頁面", () => {
  // 測試 1：登入表單的基本元素有沒有出現
  test("應該顯示登入表單", async ({ page }) => {
    await page.goto("/login");  // 打開登入頁

    // 確認標題、輸入欄位、按鈕都存在
    await expect(page.getByText("系統登入")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "登入", exact: true })
    ).toBeVisible();
  });

  // 測試 2：第三方登入按鈕有沒有渲染
  test("應該顯示第三方登入按鈕", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("button", { name: /Microsoft/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Google/ })
    ).toBeVisible();
  });

  // 測試 3：空白送出不應該跳轉（防止無驗證送出）
  test("空白表單送出應該不會跳轉", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "登入", exact: true }).click();

    // 應該還在 /login 頁面
    await expect(page).toHaveURL(/\/login/);
  });
});
```

#### `e2e/smoke.spec.ts` — 冒煙測試（基礎健康檢查）

```ts
import { test, expect } from "@playwright/test";

test.describe("頁面基本載入", () => {
  // 測試 4：首頁是否正確重導
  test("首頁應該重導到 /stock", async ({ page }) => {
    await page.goto("/");

    // 登入中 → /login，已登入 → /stock
    await expect(page).toHaveURL(/\/(stock|login)/);
  });

  // 測試 5：不存在的頁面不會爆炸
  test("不存在的頁面應該顯示 404 或重導", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");

    expect(response).not.toBeNull();
    expect([200, 404].includes(response!.status())).toBeTruthy();
  });
});

test.describe("API Health", () => {
  // 測試 6：後端 API 有活著
  test("後端 Swagger 應該可以存取", async ({ request }) => {
    const apiHost = process.env.API_HOST || "http://localhost:3004";
    const response = await request.get(`${apiHost}/api/docs-json`);

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.info.title).toContain("StockSmart");
  });
});
```

### Step 4：加入 .gitignore

在 `frontend/.gitignore` 加入：

```
# testing
/playwright-report/
/test-results/
/blob-report/
```

### Step 5：加入 package.json scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## 執行測試

### 本機開發環境（port 3003 / 3004）

```bash
cd frontend
npx playwright test
```

### QAS Docker 環境（port 4000 / 4004）

```bash
cd frontend
BASE_URL=http://localhost:4000 API_HOST=http://localhost:4004 npx playwright test
```

### 互動式 UI 模式（可以看到瀏覽器操作過程）

```bash
BASE_URL=http://localhost:4000 API_HOST=http://localhost:4004 npx playwright test --ui
```

### 查看 HTML 測試報告

```bash
npx playwright show-report
```

---

## 執行結果

```
Running 6 tests using 4 workers

  ✓  登入頁面 › 應該顯示登入表單 (1.5s)
  ✓  登入頁面 › 應該顯示第三方登入按鈕 (1.5s)
  ✓  登入頁面 › 空白表單送出應該不會跳轉 (1.5s)
  ✓  頁面基本載入 › 首頁應該重導到 /stock (2.0s)
  ✓  頁面基本載入 › 不存在的頁面應該顯示 404 或重導 (488ms)
  ✓  API Health › 後端 Swagger 應該可以存取 (98ms)

  6 passed (2.8s)
```

---

## 檔案結構

```
frontend/
├── playwright.config.ts       ← 設定檔（測試目錄、瀏覽器、超時時間）
├── e2e/
│   ├── login.spec.ts          ← 登入頁面測試（3 個案例）
│   └── smoke.spec.ts          ← 冒煙測試（3 個案例）
├── playwright-report/         ← HTML 測試報告（.gitignore）
└── test-results/              ← 失敗截圖 & trace（.gitignore）
```

---

## Playwright 常用語法速查

### 定位元素

```ts
page.locator("#email")                              // CSS selector
page.getByRole("button", { name: "登入" })           // 依角色 + 文字
page.getByRole("button", { name: "登入", exact: true }) // 精確匹配
page.getByText("系統登入")                            // 依文字內容
page.getByText(/Microsoft/)                          // 正則表達式
page.getByLabel("電子郵件")                           // 依 label
page.getByPlaceholder("name@example.com")            // 依 placeholder
page.getByTestId("submit-btn")                       // 依 data-testid
```

### 操作

```ts
await page.goto("/login")                   // 導航到頁面
await page.click("#submit")                 // 點擊
await page.fill("#email", "test@test.com")  // 輸入文字
await page.selectOption("#role", "admin")   // 選擇下拉選單
await page.check("#agree")                  // 勾選 checkbox
await page.waitForURL("**/stock")           // 等待 URL 變化
```

### 斷言

```ts
await expect(page).toHaveURL(/\/stock/)                      // URL 匹配
await expect(page).toHaveTitle(/StockSmart/)                 // 頁面標題
await expect(page.locator("#email")).toBeVisible()            // 元素可見
await expect(page.locator("#email")).toBeHidden()             // 元素隱藏
await expect(page.locator("#email")).toHaveValue("test")      // 輸入值
await expect(page.locator(".error")).toHaveText("登入失敗")    // 文字內容
await expect(page.locator(".list li")).toHaveCount(5)         // 元素數量
```

### API 測試

```ts
test("API 測試", async ({ request }) => {
  const response = await request.get("http://localhost:3004/api/docs-json");
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.info.title).toContain("StockSmart");
});
```

---

## CI/CD 整合

已加入 `.github/workflows/deploy-qas.yml`，QAS 部署後自動執行：

```yaml
e2e-test:
  name: E2E Test (Playwright)
  needs: [deploy]
  steps:
    - name: Install Playwright browsers
      run: npx playwright install --with-deps chromium

    - name: Run E2E tests
      run: npx playwright test
      env:
        BASE_URL: ${{ vars.QAS_APP_URL }}
        API_HOST: ${{ vars.QAS_API_HOST }}

    - name: Upload test report
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: frontend/playwright-report/
```
