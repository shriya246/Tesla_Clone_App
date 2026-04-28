import { expect, test } from "@playwright/test";

test("home page loads the primary experience", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Tesla Inspired/i);
  await expect(
    page.getByRole("heading", { name: "Full Self-Driving (Supervised)" }),
  ).toBeVisible();
  await expect(page.getByText("Exclusive Offers")).toBeVisible();
});

test("vehicle catalog and detail pages render", async ({ page }) => {
  await page.goto("/vehicles");

  await expect(page.getByRole("heading", { name: "Vehicles" })).toBeVisible();

  await page.goto("/vehicles/model-s");

  await expect(page.getByRole("heading", { name: "Model S" })).toBeVisible();
  await expect(page.getByText("Request a Demo Drive")).toBeVisible();
});
