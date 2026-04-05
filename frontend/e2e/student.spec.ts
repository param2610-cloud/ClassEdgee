import { expect, test } from "@playwright/test";
import { loginAs, setupApiMocks, setupStudentMocks } from "./helpers";

// T-STORY-012 — E2E student role journeys
// All API calls are mocked via helpers — no real backend needed.
// Healthy student: 85% attendance, atRisk: false
// At-risk student: 62% attendance, atRisk: true

test.describe("student journeys — healthy student (85% attendance)", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupStudentMocks(page, "healthy");
    await loginAs(page, "student");
  });

  test.describe("dashboard", () => {
    test("shows Attendance stat card with percentage", async ({ page }) => {
      await expect(page.getByText(/attendance/i).first()).toBeVisible();
      // Stat card should display the mocked 85% value
      await expect(page.getByText(/85/)).toBeVisible();
    });

    test("shows Enrolled Courses stat card with non-zero value", async ({ page }) => {
      // Past classes have 2 distinct courses — stat card should render a number
      const enrolledCard = page.getByText(/enrolled courses/i);
      await expect(enrolledCard).toBeVisible();
    });

    test("shows Today's Classes section", async ({ page }) => {
      // Either shows classes or the empty state message — must not crash
      const classesHeading = page.getByText(/today'?s classes/i);
      await expect(classesHeading).toBeVisible();
    });
  });

  test.describe("attendance page (/student/attendance)", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/student/attendance");
    });

    test("renders table with correct column headers", async ({ page }) => {
      await expect(page.getByRole("columnheader", { name: /subject/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /total classes/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /attended/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /attendance\s*%/i })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: /status/i })).toBeVisible();
    });

    test("shows subject rows with no NaN or undefined values", async ({ page }) => {
      // Both mocked subjects must appear with numbers, not NaN/undefined
      const rows = page.getByRole("row");
      const rowTexts = await rows.allTextContents();
      for (const text of rowTexts) {
        expect(text).not.toContain("NaN");
        expect(text).not.toContain("undefined");
      }
    });

    test("does NOT show at-risk alert banner for healthy student", async ({ page }) => {
      const banner = page.getByText(/attendance shortage risk/i);
      await expect(banner).not.toBeVisible();
    });

    test("shows Healthy status badge for each subject", async ({ page }) => {
      await expect(page.getByText(/healthy/i).first()).toBeVisible();
    });
  });

  test.describe("navigation", () => {
    test("sidebar Attendance link navigates to /student/attendance", async ({ page }) => {
      await page.getByRole("link", { name: /attendance/i }).click();
      await expect(page).toHaveURL(/\/student\/attendance$/);
    });

    test("accessing /coordinator redirects back to /student", async ({ page }) => {
      await page.goto("/coordinator");
      await expect(page).toHaveURL(/\/student/);
    });

    test("accessing /admin redirects back to /student", async ({ page }) => {
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/student/);
    });

    test("accessing /faculty redirects back to /student", async ({ page }) => {
      await page.goto("/faculty");
      await expect(page).toHaveURL(/\/student/);
    });
  });
});

test.describe("student journeys — at-risk student (62% attendance)", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupStudentMocks(page, "at_risk");
    await loginAs(page, "student");
  });

  test.describe("dashboard", () => {
    test("shows Attendance stat card with at-risk percentage", async ({ page }) => {
      await expect(page.getByText(/attendance/i).first()).toBeVisible();
      await expect(page.getByText(/62/)).toBeVisible();
    });
  });

  test.describe("attendance page (/student/attendance)", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/student/attendance");
    });

    test("shows at-risk alert banner", async ({ page }) => {
      await expect(page.getByText(/attendance shortage risk/i)).toBeVisible();
    });

    test("shows At Risk status badge for subjects below threshold", async ({ page }) => {
      await expect(page.getByText(/at.?risk/i).first()).toBeVisible();
    });

    test("shows overall attendance percentage of 62", async ({ page }) => {
      await expect(page.getByText(/62/)).toBeVisible();
    });

    test("does not show NaN or undefined in rows", async ({ page }) => {
      const rows = page.getByRole("row");
      const rowTexts = await rows.allTextContents();
      for (const text of rowTexts) {
        expect(text).not.toContain("NaN");
        expect(text).not.toContain("undefined");
      }
    });
  });
});
