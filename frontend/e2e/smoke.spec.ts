import { expect, test } from "@playwright/test";

test.describe("頁面基本載入", () => {
  test("首頁應該重導到 /stock", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/(stock|login)/);
  });

  test("不存在的頁面應該顯示 404 或重導", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");

    expect(response).not.toBeNull();
    expect([200, 404].includes(response!.status())).toBeTruthy();
  });
});

test.describe("API Health", () => {
  test("後端 Swagger 應該可以存取", async ({ request }) => {
    const apiHost = process.env.API_HOST || "http://localhost:3004";
    const response = await request.get(`${apiHost}/api/docs-json`);

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.info.title).toContain("StockSmart");
  });
});
