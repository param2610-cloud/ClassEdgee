import { expect, test } from "@playwright/test";
import { loginAs, setupApiMocks } from "./helpers";

test.describe("faculty journeys", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await loginAs(page, "faculty");
  });

  test("faculty can open classes and profile pages", async ({ page }) => {
    await page.goto("/faculty/classes");
    await expect(page).toHaveURL(/\/faculty\/classes$/);

    await page.goto("/faculty/profile");
    await expect(page).toHaveURL(/\/faculty\/profile$/);
  });

  test("faculty cannot access coordinator namespace", async ({ page }) => {
    await page.goto("/coordinator");
    await expect(page).toHaveURL(/\/faculty$/);
  });
});
