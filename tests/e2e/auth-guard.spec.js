import { expect, test } from "@playwright/test";

test.describe("Auth Guard", () => {
  test("unauthenticated user is redirected from /profile to home", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/$/);
  });

  test("unauthenticated user is redirected from /checkout to home", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/$/);
  });
});
