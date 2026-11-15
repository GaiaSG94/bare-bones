import { expect, test } from "@playwright/test";

const SKELETON = "http://localhost:4170/skeleton/";

test.describe("skeleton", () => {
  test("loads the demo CSV and renders the typed table", async ({ page }) => {
    await page.goto(SKELETON);
    await expect(page.getByRole("heading", { name: /Bare Bones starter/ })).toBeVisible();
    await page.getByRole("button", { name: /Load demo data/i }).click();
    await expect(page.locator(".bb-grid table")).toBeVisible();
    await expect(page.locator(".bb-grid tbody tr").first()).toBeVisible();
  });

  test("shows the back link to the home page", async ({ page }) => {
    await page.goto(SKELETON);
    await expect(page.getByRole("link", { name: /Bare Bones/i }).first()).toBeVisible();
  });
});
