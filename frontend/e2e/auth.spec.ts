import { expect, test } from "@playwright/test";
import { loginAs, roleRoot, setupApiMocks } from "./helpers";

test.describe("auth flows", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test("legacy /auth/signin redirects to /auth/login", async ({ page }) => {
    await page.goto("/auth/signin");
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  for (const role of ["admin", "coordinator", "faculty", "student"] as const) {
    test(`can login as ${role}`, async ({ page }) => {
      await loginAs(page, role);
      await expect(page.getByRole("button", { name: new RegExp(`${role}`, "i") })).toBeVisible();
    });
  }

  test("shows inline error for wrong password", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByLabel("Password").fill("Wrong@1234");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid credentials|401|request failed/i)).toBeVisible();
  });

  test("already logged-in user is redirected from /auth/login", async ({ page }) => {
    await loginAs(page, "faculty");
    await page.goto("/auth/login");
    await expect(page).toHaveURL(roleRoot("faculty"));
  });

  test("logout redirects to login and clears access token", async ({ page }) => {
    await loginAs(page, "admin");

    await page.getByRole("button", { name: /admin/i }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();

    await expect(page).toHaveURL(/\/auth\/login$/);

    const accessToken = await page.evaluate(() => window.localStorage.getItem("accessToken"));
    expect(accessToken).toBeNull();
  });

  test("protected route redirects to login after logout", async ({ page }) => {
    await loginAs(page, "admin");
    await page.getByRole("button", { name: /admin/i }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
