import { expect, test } from "@playwright/test";
import { loginAs, setupApiMocks } from "./helpers";

test.describe("student journeys", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await loginAs(page, "student");
  });

  test("student can navigate to attendance from sidebar", async ({ page }) => {
    await page.getByRole("link", { name: "Attendance" }).click();
    await expect(page).toHaveURL(/\/student\/attendance$/);
  });

  test("student cannot access coordinator namespace", async ({ page }) => {
    await page.goto("/coordinator");
    await expect(page).toHaveURL(/\/student$/);
  });
});
