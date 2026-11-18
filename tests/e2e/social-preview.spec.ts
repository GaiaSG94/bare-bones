import { expect, test } from "@playwright/test";

const HOME = "http://localhost:4170/";
const IMAGE_URL = "https://gaiasg94.github.io/bare-bones/social-preview-1280x640.png";
const IMAGE_PATH = "social-preview-1280x640.png";

test.describe("social preview", () => {
  test("image is served at the site root (HTTP 200)", async ({ request }) => {
    const response = await request.get(`${HOME}${IMAGE_PATH}`);
    expect(response.status()).toBe(200);
  });

  test("og:image and twitter:image hold the absolute GitHub Pages URL", async ({ page }) => {
    await page.goto(HOME);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute("content");
    expect(ogImage).toBe(IMAGE_URL);
    expect(twitterImage).toBe(IMAGE_URL);
  });
});
