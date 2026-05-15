import { expect, test } from "@playwright/test";

const SAMPLE_DECK = `Pokémon: 3
4 Dreepy TWM 128

Trainer: 4
4 Boss's Orders MEG 114

Energy: 2
2 Fire Energy MEE 2`;

test("paste → review → export round-trip", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox").fill(SAMPLE_DECK);
  await page.getByRole("button", { name: /upgrade deck/i }).click();

  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
  await expect(page.getByText(/Boss's Orders/)).toBeVisible();
  await expect(page.getByText(/Dreepy/)).toBeVisible();

  await page.getByRole("button", { name: /export/i }).click();
  await expect(page.getByRole("heading", { name: "Export" })).toBeVisible();
  await expect(page.locator("pre")).toContainText("Pokémon:");
  await expect(page.locator("pre")).toContainText("4 Dreepy");
});
