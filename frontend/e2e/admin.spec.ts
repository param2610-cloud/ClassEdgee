import { expect, test } from "@playwright/test";
import { loginAs, setupApiMocks, setupAdminMocks } from "./helpers";

// T-STORY-015 — E2E admin role journeys
// Covers: dashboard stat cards with seeded values (20 students, 3 faculty,
// 1 coordinator, 6 rooms), coordinators list, navigation guards.

test.describe("admin journeys — dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupAdminMocks(page);
    await loginAs(page, "admin");
  });

  test("lands on /admin after login", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("shows Total Students stat card with seeded count of 20", async ({ page }) => {
    await expect(page.getByText(/total students/i)).toBeVisible();
    await expect(page.getByText("20")).toBeVisible();
  });

  test("shows Total Faculty stat card with seeded count of 3", async ({ page }) => {
    await expect(page.getByText(/total faculty/i)).toBeVisible();
    await expect(page.getByText("3")).toBeVisible();
  });

  test("shows Coordinators stat card", async ({ page }) => {
    await expect(page.getByText(/coordinators/i).first()).toBeVisible();
  });

  test("shows Rooms stat card with seeded count of 6", async ({ page }) => {
    await expect(page.getByText(/rooms/i).first()).toBeVisible();
    await expect(page.getByText("6")).toBeVisible();
  });

  test("coordinators table shows seeded coordinator email", async ({ page }) => {
    await expect(page.getByText("coord@test.com")).toBeVisible();
  });
});

test.describe("admin journeys — coordinators page", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupAdminMocks(page);
    await loginAs(page, "admin");
    await page.goto("/admin/coordinators");
  });

  test("loads coordinators page", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/coordinators$/);
  });

  test("shows seeded coordinator in list", async ({ page }) => {
    await expect(page.getByText("coord@test.com")).toBeVisible();
  });

  test("coordinator list has Name, Email columns", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: /name/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /email/i })).toBeVisible();
  });
});

test.describe("admin journeys — navigation guards", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupAdminMocks(page);
    await loginAs(page, "admin");
  });

  test("accessing /coordinator while logged in as admin redirects to /admin", async ({ page }) => {
    await page.goto("/coordinator");
    await expect(page).toHaveURL(/\/admin/);
  });

  test("accessing /student while logged in as admin redirects to /admin", async ({ page }) => {
    await page.goto("/student");
    await expect(page).toHaveURL(/\/admin/);
  });

  test("accessing /faculty while logged in as admin redirects to /admin", async ({ page }) => {
    await page.goto("/faculty");
    await expect(page).toHaveURL(/\/admin/);
  });
});
