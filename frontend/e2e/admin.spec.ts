import { expect, test } from "@playwright/test";
import { loginAs, setupApiMocks } from "./helpers";

test.describe("admin journeys", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await loginAs(page, "admin");
  });

  test("admin dashboard and coordinators page are reachable", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin$/);
    await page.getByRole("link", { name: "Coordinators" }).click();
    await expect(page).toHaveURL(/\/admin\/coordinators$/);
  });

  test("admin cannot access student namespace", async ({ page }) => {
    await page.goto("/student");
    await expect(page).toHaveURL(/\/admin$/);
  });
});
