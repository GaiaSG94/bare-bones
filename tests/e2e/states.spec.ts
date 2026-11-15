import { expect, test } from "@playwright/test";

const BUDGET_URL = "http://localhost:4171/budget/";
const CLUB_URL = "http://localhost:4172/club/";

const CSV_WITH_BAD_ROWS = [
  "date;label;amount",
  "2026-01-05;Membership dues January;120,00",
  "2026-01-06;Hall rental January;-380,00",
  "2026-02-31;Bake sale;240,00",
  "2026-05-02;Paint;12,5O",
  "",
].join("\n");

test.describe("state A — budget, first visit", () => {
  test("shows the drop zone, the expected columns and the demo card", async ({ page }) => {
    await page.goto(BUDGET_URL);
    await expect(page.getByText("No data yet")).toBeVisible();
    await expect(page.getByText("Drop a spreadsheet,")).toBeVisible();
    await expect(page.getByText("Drop a .csv file here")).toBeVisible();
    await expect(page.getByText("Your data stays here. Close the tab and it is gone.")).toBeVisible();
    await expect(page.getByText("YYYY-MM-DD")).toBeVisible();
    await expect(page.getByText("Just looking?")).toBeVisible();
    await expect(page.getByRole("link", { name: "← Bare Bones" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Load demo data" })).toBeVisible();
  });

  test("loads the demo data", async ({ page }) => {
    await page.goto(BUDGET_URL);
    await page.getByRole("button", { name: "Load demo data" }).click();
    await expect(page.getByText("Balance · financial year 2026")).toBeVisible();
    await expect(page.getByRole("link", { name: "← Bare Bones" })).toBeVisible();
  });
});

test.describe("state B — import", () => {
  test("runs the three steps on the real worker and reports the real counters", async ({ page }) => {
    await page.goto(BUDGET_URL);
    await page.setInputFiles('input[type="file"]', {
      name: "ledger-2026.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(CSV_WITH_BAD_ROWS, "utf8"),
    });
    await expect(page.getByText("Reading your spreadsheet…")).toBeVisible();
    await expect(page.getByText("Columns recognised")).toBeVisible();
    await expect(page.getByText("Checking every row")).toBeVisible();
    await expect(page.getByText("Building the explorer")).toBeVisible();
    await expect(page.getByText(/Ready\. \d+ rows in your explorer\./)).toBeVisible();
    await expect(page.getByText("2 kept")).toBeVisible();
    await expect(page.getByText("2 set aside")).toBeVisible();
    await expect(page.getByText("Date does not exist")).toBeVisible();
    await expect(page.getByText("Amount is not a number")).toBeVisible();
  });

  test("downloads the rejected rows as a CSV", async ({ page }) => {
    await page.goto(BUDGET_URL);
    await page.setInputFiles('input[type="file"]', {
      name: "ledger-2026.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(CSV_WITH_BAD_ROWS, "utf8"),
    });
    await expect(page.getByText(/Ready\./)).toBeVisible();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download rejected rows" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toContain("rejected");
  });

  test("opens the explorer from the import result", async ({ page }) => {
    await page.goto(BUDGET_URL);
    await page.setInputFiles('input[type="file"]', {
      name: "ledger-2026.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(CSV_WITH_BAD_ROWS, "utf8"),
    });
    await expect(page.getByText(/Ready\./)).toBeVisible();
    await page.getByRole("button", { name: "Open the explorer" }).click();
    await expect(page.getByText("Balance · financial year 2026")).toBeVisible();
  });
});

test.describe("state C — shared link", () => {
  test("an altered link shows the fallback and loads nothing", async ({ page }) => {
    await page.goto(`${BUDGET_URL}#bb=v1.p.broken-token`);
    await expect(page.getByText("This link was changed or cut short.")).toBeVisible();
    await expect(page.getByText("Nothing was loaded", { exact: true })).toBeVisible();
    await expect(page.getByText("Your own data is safe:")).toBeVisible();
    await expect(page.getByRole("link", { name: "← Bare Bones" })).toBeVisible();
  });

  test("an altered link never replaces data already open", async ({ page }) => {
    await page.goto(BUDGET_URL);
    await page.getByRole("button", { name: "Load demo data" }).click();
    await expect(page.getByText("Balance · financial year 2026")).toBeVisible();
    await page.evaluate(() => {
      location.hash = "bb=v1.p.broken-token";
    });
    await expect(page.getByText("This link was changed or cut short. Nothing was loaded or replaced.")).toBeVisible();
    await expect(page.getByText("Balance · financial year 2026")).toBeVisible();
  });

  test("the club app shows the same fallback", async ({ page }) => {
    await page.goto(`${CLUB_URL}#bb=v1.p.broken-token`);
    await expect(page.getByText("This link was changed or cut short.")).toBeVisible();
    await expect(page.getByText("Nothing was loaded", { exact: true })).toBeVisible();
  });

  test("a private link asks for the passphrase and refuses a wrong one", async ({ page, context }) => {
    await page.goto(BUDGET_URL);
    await page.getByRole("button", { name: "Load demo data" }).click();
    await expect(page.getByText("Balance · financial year 2026")).toBeVisible();
    await page.getByRole("button", { name: "Passphrase" }).click();
    await page.getByLabel("Passphrase").first().fill("open-sesame");
    const linkInput = page.getByLabel("Share link");
    await expect(linkInput).toHaveValue(/#bb=v1\.k\./);
    const link = await linkInput.inputValue();

    const other = await context.newPage();
    await other.goto(`${BUDGET_URL}${link}`);
    await expect(other.getByText("Enter the passphrase you were given.")).toBeVisible();
    await other.getByLabel("Passphrase").fill("wrong-one");
    await other.getByRole("button", { name: "Unlock" }).click();
    await expect(other.getByText("That passphrase doesn't open this link.")).toBeVisible();
    await other.getByLabel("Passphrase").fill("open-sesame");
    await other.getByRole("button", { name: "Unlock" }).click();
    await expect(other.getByText("Balance · financial year 2026")).toBeVisible();
    await other.close();
  });
});

test.describe("state D — club, first visit", () => {
  test("shows the empty season with the demo and drop actions", async ({ page }) => {
    await page.goto(CLUB_URL);
    await expect(page.getByText("No match")).toBeVisible();
    await expect(page.getByText("played yet.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Load demo season" })).toBeVisible();
    await expect(page.getByText("Drop results.csv")).toBeVisible();
    await expect(page.getByRole("link", { name: "← Bare Bones" })).toBeVisible();
  });

  test("loads the demo season", async ({ page }) => {
    await page.goto(CLUB_URL);
    await page.getByRole("button", { name: "Load demo season" }).click();
    await expect(page.getByText("League table")).toBeVisible();
    await expect(page.getByText("Castors").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "← Bare Bones" })).toBeVisible();
  });
});
