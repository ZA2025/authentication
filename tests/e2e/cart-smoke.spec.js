import { expect, test } from "@playwright/test";

test.describe("Cart Smoke", () => {
  test("unauthenticated add-to-cart redirects to login", async ({ page }) => {
    await page.goto("/products");

    const firstViewLink = page.getByRole("link", { name: "View" }).first();
    const viewCount = await page.getByRole("link", { name: "View" }).count();

    test.skip(
      viewCount === 0,
      "No products available in this environment for cart smoke."
    );

    await firstViewLink.click();
    await expect(page).toHaveURL(/\/products\/.+/);

    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
