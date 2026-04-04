import { expect, Page } from "@playwright/test";

export type Role = "admin" | "coordinator" | "faculty" | "student";

const roleRoots: Record<Role, string> = {
  admin: "/admin",
  coordinator: "/coordinator",
  faculty: "/faculty",
  student: "/student",
};

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  coordinator: "Coordinator",
  faculty: "Faculty",
  student: "Student",
};

const credentials = {
  admin: { email: "admin@test.com", password: "Test@1234" },
  coordinator: { email: "coord@test.com", password: "Test@1234" },
  faculty: { email: "faculty1@test.com", password: "Test@1234" },
  student: { email: "student1@test.com", password: "Test@1234" },
};

const makeUser = (role: Role) => ({
  user_id: role === "admin" ? 1 : role === "coordinator" ? 2 : role === "faculty" ? 3 : 4,
  email: credentials[role].email,
  role,
  first_name: roleLabels[role],
  last_name: "User",
  institution_id: 1,
});

export const setupApiMocks = async (page: Page) => {
  const tokenToRole = new Map<string, Role>();
  const roleByEmail = new Map<string, Role>([
    [credentials.admin.email, "admin"],
    [credentials.coordinator.email, "coordinator"],
    [credentials.faculty.email, "faculty"],
    [credentials.student.email, "student"],
  ]);

  await page.route("**/api/v1/general/login", async (route) => {
    const body = route.request().postDataJSON() as {
      email?: string;
      password?: string;
      role?: Role;
    };

    const role = roleByEmail.get(String(body?.email || "")) || (body?.role as Role) || "student";

    if (body?.password !== "Test@1234") {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid credentials" }),
      });
      return;
    }

    const token = `${role}-token`;
    tokenToRole.set(token, role);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken: token,
        refreshToken: `${role}-refresh-token`,
        user: makeUser(role),
      }),
    });
  });

  await page.route("**/api/v1/general/validate-token", async (route) => {
    const auth = route.request().headers()["authorization"] || "";
    const token = auth.replace("Bearer ", "");
    const role = tokenToRole.get(token) || "student";

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Token is valid",
        user: makeUser(role),
      }),
    });
  });

  await page.route("**/api/v1/general/logout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Logged out" }),
    });
  });

  await page.route("**/api/v1/general/refresh-token", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Refresh not needed in test" }),
    });
  });

  await page.route("**/api/emergency-alerts", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/api\/v1\/(?!general\/).*/, async (route) => {
    const url = route.request().url();

    if (url.includes("/attendance/history/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ history: [] }),
      });
      return;
    }

    if (url.includes("/student/list-of-student")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, pageSize: 10, totalPages: 1 },
        }),
      });
      return;
    }

    if (url.includes("/faculty/list-of-faculty")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, pageSize: 10, totalPages: 1 },
        }),
      });
      return;
    }

    if (url.includes("/attendance/student-summary/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          summary: {
            overallPercentage: 85,
            totalClasses: 10,
            attendedClasses: 9,
            atRisk: false,
          },
          subjects: [],
        }),
      });
      return;
    }

    if (url.includes("/attendance/dashboard")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          stats: {
            overallAttendancePercentage: 85,
            studentsBelowThreshold: 0,
            classesWithoutAttendanceToday: 0,
            totalClasses: 0,
          },
          records: [],
        }),
      });
      return;
    }

    if (url.includes("/attendance/low-attendance-report")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, totalStudents: 0, data: [] }),
      });
      return;
    }

    if (url.includes("/supreme/coordinators")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [{ email: "coordinator@test.com" }],
          pagination: { totalCoordinators: 1 },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
};

export const loginAs = async (page: Page, role: Role) => {
  const account = credentials[role];

  await page.goto("/auth/login");

  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(new RegExp(`${roleRoots[role]}$`));
};

export const roleRoot = (role: Role) => roleRoots[role];
