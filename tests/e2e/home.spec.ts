import { expect, test } from "@playwright/test";

const HOME = "http://localhost:4170/";
const BUDGET = "http://localhost:4170/budget/";
const CLUB = "http://localhost:4170/club/";

test.describe("home page", () => {
  test("shows the title, the chip, the themes and the real numbers", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.getByRole("heading", { name: /Drop a spreadsheet/ })).toBeVisible();
    await expect(page.locator(".chip-tag")).toContainText("Kiroween 2026");
    await expect(page.locator("#site")).toHaveAttribute("data-bg", "papier");
    for (const theme of ["encre", "papier", "orbite"]) {
      await expect(page.locator(`.bgs button[data-bg="${theme}"]`)).toBeVisible();
    }
    const facts = page.locator("#bb-facts span");
    await expect(facts.first()).toContainText("tests");
    await expect(facts.nth(2)).toContainText("lines in core + ui");
    await expect(facts.nth(3)).toContainText("runtime dependencies");
  });

  test("switches theme", async ({ page }) => {
    await page.goto(HOME);
    await page.locator('.bgs button[data-bg="encre"]').click();
    await expect(page.locator("#site")).toHaveAttribute("data-bg", "encre");
    await page.locator('.bgs button[data-bg="papier"]').click();
    await expect(page.locator("#site")).toHaveAttribute("data-bg", "papier");
  });

  test("the two cards open the real apps", async ({ page }) => {
    await page.goto(HOME);
    await expect(page.locator(".app.orb")).toHaveAttribute("href", "./budget/");
    await expect(page.locator(".app.flood")).toHaveAttribute("href", "./club/");
  });

  test("plays the 9-step scenario, including the two club steps", async ({ page }) => {
    await page.goto(HOME);
    await page.getByRole("button", { name: /Play the scenario/ }).first().click();
    await expect(page.locator("#cap .num")).toHaveText("01 / 09");
    await expect(page.locator("#cap h2")).toContainText("dev team copies");
    for (let step = 2; step <= 9; step += 1) {
      await page.locator("#sc-next").click();
      await expect(page.locator("#cap .num")).toHaveText(`${String(step).padStart(2, "0")} / 09`);
    }
    await expect(page.locator("#cap h2")).toContainText("shared publicly");
    await expect(page.locator("#cap .res")).toContainText("Six teams, one table, one link.");
    await page.locator("#sc-close").click();
    await expect(page.locator("#cap")).toBeHidden();
  });
});

test.describe("share links across sites", () => {
  test("a budget public link reopens the same view in a new context", async ({ page, browser }) => {
    test.setTimeout(60_000);
    await page.goto(BUDGET);
    await page.getByRole("button", { name: "Load demo data" }).click();
    await expect(page.getByText("Balance · financial year 2026")).toBeVisible();
    await page.getByRole("button", { name: "Public link" }).click();
    await expect.poll(async () => page.getByLabel("Share link").inputValue()).toContain("#bb=v1.p.");
    const link = await page.getByLabel("Share link").inputValue();
    await page.close();

    const other = await browser.newContext();
    const second = await other.newPage();
    await second.goto(`${BUDGET}${link}`);
    await expect(second.getByText("Balance · financial year 2026")).toBeVisible();
    await other.close();
  });

  test("a club public link reopens the league table", async ({ page, browser }) => {
    test.setTimeout(90_000);
    await page.goto(CLUB);
    await page.getByRole("button", { name: "Load demo season" }).click();
    await expect(page.getByRole("heading", { name: "League table" }).first()).toBeVisible();
    await expect.poll(async () => page.getByLabel("Share link").inputValue()).toContain("#bb=v1.p.");
    const link = await page.getByLabel("Share link").inputValue();
    await page.close();

    const other = await browser.newContext();
    const second = await other.newPage();
    await second.goto(`${CLUB}${link}`, { waitUntil: "domcontentloaded" });
    await expect(second.getByRole("button", { name: /Castors/ })).toBeVisible({ timeout: 45_000 });
    await other.close();
  });
});
