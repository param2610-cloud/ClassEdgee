import { expect, test } from "@playwright/test";
import { loginAs, setupApiMocks } from "./helpers";

test.describe("coordinator journeys", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await loginAs(page, "coordinator");
  });

  test("coordinator can navigate students, rooms, and buildings pages", async ({ page }) => {
    await page.getByRole("link", { name: "Students" }).click();
    await expect(page).toHaveURL(/\/coordinator\/students$/);

    await page.getByRole("link", { name: "Rooms" }).click();
    await expect(page).toHaveURL(/\/coordinator\/rooms$/);

    await page.getByRole("link", { name: "Buildings" }).click();
    await expect(page).toHaveURL(/\/coordinator\/buildings$/);
  });
});
