import { expect, test } from "@playwright/test";

test.describe("Smoke Navigation", () => {
  test("home page renders core navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("img", { name: "logo" })).toBeVisible();
    await expect(page.getByRole("link", { name: "products" })).toBeVisible();
    await expect(page.getByRole("link", { name: "FAQs" })).toBeVisible();
  });

  test("shop link navigates to products page", async ({ page }) => {
    await page.goto("/");

    const shopLink = page.locator('a[href="/products"]').first();
    await expect(shopLink).toBeVisible();
    await Promise.all([
      page.waitForURL("**/products", { timeout: 10000 }),
      shopLink.click(),
    ]);
    await expect(page).toHaveURL(/\/products$/);
  });
});
