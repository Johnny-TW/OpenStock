import { test, expect } from "@playwright/test";

test.describe("登入頁面", () => {
  test("應該顯示登入表單", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("系統登入")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "登入", exact: true })).toBeVisible();
  });

  test("應該顯示第三方登入按鈕", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("button", { name: /Microsoft/ })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Google/ })).toBeVisible();
  });

  test("空白表單送出應該不會跳轉", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "登入", exact: true }).click();

    await expect(page).toHaveURL(/\/login/);
  });
});
