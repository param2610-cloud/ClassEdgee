import { expect, test } from "@playwright/test";
import { loginAs, setupApiMocks, setupFacultyMocks, setupFacultyClassMocks } from "./helpers";

// T-STORY-013 — E2E faculty role journeys
// Covers: dashboard stat cards, class room attendance/notes/resources tabs.
// Class room is accessed at /faculty/classes/1 with all sub-endpoints mocked.

test.describe("faculty journeys — dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupFacultyMocks(page);
    await loginAs(page, "faculty");
  });

  test("shows 4 stat cards", async ({ page }) => {
    await expect(page.getByText(/faculty id/i)).toBeVisible();
    await expect(page.getByText(/total classes/i)).toBeVisible();
    await expect(page.getByText(/classes today/i)).toBeVisible();
    await expect(page.getByText(/pending attendance/i)).toBeVisible();
  });

  test("recent classes table is present", async ({ page }) => {
    // Either the table renders or an empty state — page must not crash
    const hasTable = await page.getByRole("table").isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/no class records/i).isVisible().catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
  });

  test("cannot access coordinator namespace", async ({ page }) => {
    await page.goto("/coordinator");
    await expect(page).toHaveURL(/\/faculty/);
  });

  test("cannot access admin namespace", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/faculty/);
  });
});

test.describe("faculty journeys — class room tabs", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupFacultyMocks(page);
    await setupFacultyClassMocks(page);
    await loginAs(page, "faculty");
    // Navigate directly to the seeded class (id=1 from mock data)
    await page.goto("/faculty/classes/1");
  });

  test.describe("attendance tab", () => {
    test("AttendanceMarker renders student list", async ({ page }) => {
      // Click the Attendance tab (may be default or named)
      const attendanceTab = page.getByRole("tab", { name: /attendance/i });
      if (await attendanceTab.isVisible()) {
        await attendanceTab.click();
      }
      // Students Alice and Bob should appear (from setupFacultyClassMocks)
      await expect(page.getByText("Alice")).toBeVisible();
      await expect(page.getByText("Bob")).toBeVisible();
    });

    test("clicking Absent for a student updates badge count", async ({ page }) => {
      const attendanceTab = page.getByRole("tab", { name: /attendance/i });
      if (await attendanceTab.isVisible()) await attendanceTab.click();

      // Click the Absent button for the first student (Alice)
      await page.getByRole("button", { name: /absent/i }).first().click();

      // Absent count badge should become visible / increment
      await expect(page.getByText(/absent:\s*1/i)).toBeVisible();
    });

    test("submit button calls mark-attendance and shows success toast", async ({ page }) => {
      const attendanceTab = page.getByRole("tab", { name: /attendance/i });
      if (await attendanceTab.isVisible()) await attendanceTab.click();

      await page.getByRole("button", { name: /submit attendance/i }).click();

      // Toast message should appear
      await expect(page.getByText(/attendance marked|submitted/i)).toBeVisible({ timeout: 5000 });
    });

    test("buttons lock after submission", async ({ page }) => {
      const attendanceTab = page.getByRole("tab", { name: /attendance/i });
      if (await attendanceTab.isVisible()) await attendanceTab.click();

      await page.getByRole("button", { name: /submit attendance/i }).click();
      await page.getByText(/attendance marked|submitted/i).waitFor({ timeout: 5000 }).catch(() => {});

      // Submit button should be disabled after submission
      const submitBtn = page.getByRole("button", { name: /submit attendance/i });
      if (await submitBtn.isVisible()) {
        await expect(submitBtn).toBeDisabled();
      }
    });
  });

  test.describe("notes tab", () => {
    test.beforeEach(async ({ page }) => {
      const notesTab = page.getByRole("tab", { name: /notes/i });
      if (await notesTab.isVisible()) await notesTab.click();
    });

    test("shows empty state when no notes", async ({ page }) => {
      await expect(page.getByText(/no notes available/i)).toBeVisible();
    });

    test("Add Note button opens modal", async ({ page }) => {
      await page.getByRole("button", { name: /add note/i }).first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("heading", { name: /add new note/i })).toBeVisible();
    });

    test("filling and submitting note form closes modal", async ({ page }) => {
      await page.getByRole("button", { name: /add note/i }).first().click();

      await page.getByPlaceholder("Title").fill("Test Note");
      await page.getByPlaceholder("Content").fill("This is test content.");

      await page.getByRole("button", { name: /create note/i }).click();

      // Dialog should close after successful submission
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("resources tab", () => {
    test.beforeEach(async ({ page }) => {
      const resourcesTab = page.getByRole("tab", { name: /resources/i });
      if (await resourcesTab.isVisible()) await resourcesTab.click();
    });

    test("shows empty state when no resources", async ({ page }) => {
      await expect(page.getByText(/no resources uploaded/i)).toBeVisible();
    });

    test("Add Resource button opens modal", async ({ page }) => {
      await page.getByRole("button", { name: /add resource/i }).first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("heading", { name: /add new resource/i })).toBeVisible();
    });

    test("upload button disabled until file and title provided", async ({ page }) => {
      await page.getByRole("button", { name: /add resource/i }).first().click();

      const uploadBtn = page.getByRole("button", { name: /upload resource/i });
      // No file or title yet — button should be disabled
      await expect(uploadBtn).toBeDisabled();

      // Fill title only (still no file)
      await page.getByPlaceholder("Title").fill("My File");
      await expect(uploadBtn).toBeDisabled();
    });
  });
});

test.describe("faculty journeys — profile page", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupFacultyMocks(page);
    await loginAs(page, "faculty");
  });

  test("/faculty/profile is reachable and renders without error", async ({ page }) => {
    await page.goto("/faculty/profile");
    await expect(page).toHaveURL(/\/faculty\/profile$/);
    // Page should not show a 404 or crash message
    await expect(page.getByText(/not found|page not found/i)).not.toBeVisible();
  });
});
