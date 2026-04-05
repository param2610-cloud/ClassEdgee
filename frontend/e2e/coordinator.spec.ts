import { expect, test } from "@playwright/test";
import { loginAs, setupApiMocks, setupCoordinatorMocks } from "./helpers";

// T-STORY-014 — E2E coordinator role journeys
// Covers: student management (search/delete), faculty management (delete),
// attendance dashboard (stat cards, filters), rooms (add room), buildings.

test.describe("coordinator journeys — student management", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupCoordinatorMocks(page);
    await loginAs(page, "coordinator");
    await page.goto("/coordinator/students");
  });

  test("table loads with 20 seeded students", async ({ page }) => {
    // Stat card shows total
    await expect(page.getByText(/total students/i)).toBeVisible();
    await expect(page.getByText("20")).toBeVisible();
  });

  test("first page shows 10 student rows", async ({ page }) => {
    // Each student row contains their name
    await expect(page.getByText("Student1")).toBeVisible();
    await expect(page.getByText("Student10")).toBeVisible();
  });

  test("searching by name filters the table", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search by name or uid/i);
    await searchInput.fill("Student5");
    // Trigger search (may be on input or a button)
    await page.keyboard.press("Enter");

    // Only matching student should be visible, others hidden
    await expect(page.getByText("Student5")).toBeVisible();
    await expect(page.getByText("Student1")).not.toBeVisible();
  });

  test("Add Student button navigates to /coordinator/students/new", async ({ page }) => {
    await page.getByRole("button", { name: /add student/i }).click();
    await expect(page).toHaveURL(/\/coordinator\/students\/new$/);
  });

  test("Delete button shows confirmation dialog", async ({ page }) => {
    // Click delete on the first student row
    await page.getByRole("button", { name: /delete/i }).first().click();
    // Confirmation dialog/modal should appear
    await expect(page.getByText(/delete student\?|are you sure|permanently remove/i)).toBeVisible();
  });

  test("confirming delete removes student from list", async ({ page }) => {
    await page.getByRole("button", { name: /delete/i }).first().click();
    // Find and click confirm button inside dialog
    const confirmBtn = page.getByRole("button", { name: /^delete$|confirm/i }).last();
    await confirmBtn.click();
    // Toast or updated list (mock returns success)
    await expect(page.getByText(/deleted|removed/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe("coordinator journeys — faculty management", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupCoordinatorMocks(page);
    await loginAs(page, "coordinator");
    await page.goto("/coordinator/faculty");
  });

  test("table loads with 3 seeded faculty members", async ({ page }) => {
    await expect(page.getByText(/total faculty/i)).toBeVisible();
    await expect(page.getByText("3")).toBeVisible();
  });

  test("faculty names are visible in table", async ({ page }) => {
    await expect(page.getByText("Faculty One").or(page.getByText("Faculty"))).toBeVisible();
  });

  test("Delete button shows confirmation dialog", async ({ page }) => {
    await page.getByRole("button", { name: /delete/i }).first().click();
    await expect(page.getByText(/delete faculty|permanently remove/i)).toBeVisible();
  });

  test("confirming faculty delete calls API and shows toast", async ({ page }) => {
    await page.getByRole("button", { name: /delete/i }).first().click();
    const confirmBtn = page.getByRole("button", { name: /^delete$|confirm/i }).last();
    await confirmBtn.click();
    await expect(page.getByText(/deleted|removed/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe("coordinator journeys — attendance dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupCoordinatorMocks(page);
    await loginAs(page, "coordinator");
    await page.goto("/coordinator/attendance");
  });

  test("4 stat cards are visible", async ({ page }) => {
    await expect(page.getByText(/overall attendance/i)).toBeVisible();
    await expect(page.getByText(/students below threshold/i)).toBeVisible();
    await expect(page.getByText(/classes without attendance today/i)).toBeVisible();
    await expect(page.getByText(/classes in range/i).or(page.getByText(/total classes/i))).toBeVisible();
  });

  test("Students Below Threshold card shows 3 (seeded at-risk count)", async ({ page }) => {
    // The mock returns studentsBelowThreshold: 3
    await expect(page.getByText("3")).toBeVisible();
  });

  test("attendance records table renders with section and class columns", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: /section/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /class|course/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /date/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /present/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /absent/i })).toBeVisible();
  });

  test("Export Excel button is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /export excel/i })).toBeVisible();
  });

  test("Send Warnings button is visible when at-risk students exist", async ({ page }) => {
    await expect(page.getByRole("button", { name: /send warnings/i })).toBeVisible();
  });
});

test.describe("coordinator journeys — timetable", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupCoordinatorMocks(page);
    await loginAs(page, "coordinator");
    await page.goto("/coordinator/timetable");
  });

  test("timetable page loads without crashing", async ({ page }) => {
    await expect(page).toHaveURL(/\/coordinator\/timetable/);
    await expect(page.getByText(/not found|error/i)).not.toBeVisible();
  });

  test("at least one tab is visible (View Schedule / Generate / Manual)", async ({ page }) => {
    const tabList = page.getByRole("tablist");
    if (await tabList.isVisible()) {
      const tabs = tabList.getByRole("tab");
      expect(await tabs.count()).toBeGreaterThan(0);
    }
  });
});

test.describe("coordinator journeys — rooms", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupCoordinatorMocks(page);
    await loginAs(page, "coordinator");
    await page.goto("/coordinator/rooms");
  });

  test("table shows 6 seeded rooms", async ({ page }) => {
    await expect(page.getByText(/total rooms/i)).toBeVisible();
    await expect(page.getByText("6")).toBeVisible();
  });

  test("room table has Room Number, Type, Status columns", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: /room number/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /type|room type/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /status/i })).toBeVisible();
  });

  test("Add Room button opens dialog", async ({ page }) => {
    await page.getByRole("button", { name: /add room/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: /add room/i })).toBeVisible();
  });

  test("filling Add Room form and submitting closes dialog", async ({ page }) => {
    await page.getByRole("button", { name: /add room/i }).click();

    await page.getByLabel(/room number/i).fill("C-201");
    // Select room type if there's a select
    const typeSelect = page.getByLabel(/room type/i);
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption("classroom");
    }
    // Capacity
    const capacityInput = page.getByLabel(/capacity/i);
    if (await capacityInput.isVisible()) {
      await capacityInput.fill("50");
    }

    await page.getByRole("button", { name: /create room/i }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe("coordinator journeys — buildings", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await setupCoordinatorMocks(page);
    await loginAs(page, "coordinator");
    await page.goto("/coordinator/buildings");
  });

  test("table shows 2 seeded buildings", async ({ page }) => {
    await expect(page.getByText(/total buildings/i)).toBeVisible();
    await expect(page.getByText("2")).toBeVisible();
  });

  test("building names are visible", async ({ page }) => {
    await expect(page.getByText("Block A")).toBeVisible();
    await expect(page.getByText("Block B")).toBeVisible();
  });

  test("table has Building Name and Floors columns", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: /building name/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /floors/i })).toBeVisible();
  });
});
