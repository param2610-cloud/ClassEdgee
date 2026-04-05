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

// ---------------------------------------------------------------------------
// Base auth mocks + global catch-all for any /api/v1/* request.
// These must be registered BEFORE any page-specific overrides so that the
// more-specific routes (registered later) are matched first by Playwright.
// ---------------------------------------------------------------------------
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

  // Global catch-all for all non-auth API routes. Returns minimal valid
  // payloads. Page-specific overrides registered AFTER this call will match
  // first because Playwright processes routes in LIFO order.
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
          summary: { overallPercentage: 85, totalClasses: 10, attendedClasses: 9, atRisk: false },
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
          data: [{ email: "coord@test.com", first_name: "Coordinator", last_name: "User", college_uid: "COORD-001" }],
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

// ---------------------------------------------------------------------------
// Student-specific overrides
// Call AFTER setupApiMocks so these routes are matched first (LIFO).
// ---------------------------------------------------------------------------

const HEALTHY_STUDENT_SUMMARY = {
  summary: { overallPercentage: 85, totalClasses: 20, attendedClasses: 17, atRisk: false },
  subjects: [
    { subjectName: "Mathematics", totalClasses: 10, attendedClasses: 9, attendancePercentage: 90, status: "good" },
    { subjectName: "Physics", totalClasses: 10, attendedClasses: 8, attendancePercentage: 80, status: "good" },
  ],
};

const AT_RISK_STUDENT_SUMMARY = {
  summary: { overallPercentage: 62, totalClasses: 20, attendedClasses: 12, atRisk: true },
  subjects: [
    { subjectName: "Mathematics", totalClasses: 10, attendedClasses: 6, attendancePercentage: 60, status: "at-risk" },
    { subjectName: "Physics", totalClasses: 10, attendedClasses: 6, attendancePercentage: 60, status: "at-risk" },
  ],
};

const STUDENT_PAST_CLASSES = [
  {
    class_id: 1,
    date_of_class: "2026-03-20T09:00:00Z",
    courses: { course_name: "Mathematics", course_code: "MA101" },
    sections: { section_name: "CS-A" },
    rooms: { room_number: "A-101" },
    timeslots: { start_time: "09:00", end_time: "10:00" },
  },
  {
    class_id: 2,
    date_of_class: "2026-03-21T11:00:00Z",
    courses: { course_name: "Physics", course_code: "PH101" },
    sections: { section_name: "CS-A" },
    rooms: { room_number: "A-101" },
    timeslots: { start_time: "11:00", end_time: "12:00" },
  },
];

export const setupStudentMocks = async (page: Page, scenario: "healthy" | "at_risk" = "healthy") => {
  const summary = scenario === "healthy" ? HEALTHY_STUDENT_SUMMARY : AT_RISK_STUDENT_SUMMARY;

  await page.route("**/student/get-student/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          user_id: 4,
          first_name: "John",
          last_name: "Doe",
          email: "student1@test.com",
          students: { student_id: 4 },
        },
      }),
    });
  });

  await page.route("**/student/classes/list-of-past-classes/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(STUDENT_PAST_CLASSES),
    });
  });

  await page.route("**/student/classes/upcoming-classes/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/attendance/student-summary/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(summary),
    });
  });
};

// ---------------------------------------------------------------------------
// Faculty-specific overrides
// ---------------------------------------------------------------------------

export const setupFacultyMocks = async (page: Page) => {
  await page.route("**/faculty/get-faculty/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          user_id: 3,
          first_name: "Faculty",
          last_name: "User",
          faculty: { faculty_id: 3, college_uid: "FAC-001" },
        },
      }),
    });
  });

  await page.route("**/faculty/classes/list-of-past-classes/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          class_id: 1,
          date_of_class: "2026-03-20T09:00:00Z",
          courses: { course_name: "Mathematics", course_code: "MA101" },
          sections: { section_name: "CS-A", section_id: 1 },
          rooms: { room_number: "A-101" },
          timeslots: { start_time: "09:00", end_time: "10:00" },
          course_id: 1,
          section_id: 1,
        },
      ]),
    });
  });
};

export const setupFacultyClassMocks = async (page: Page) => {
  // Section students for AttendanceMarker
  await page.route("**/student/list-of-student-of-section/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          student_id: 1,
          user_id: 10,
          enrollment_number: "2023CS01",
          users: { user_id: 10, first_name: "Alice", last_name: "Smith", college_uid: "STU-01" },
        },
        {
          student_id: 2,
          user_id: 11,
          enrollment_number: "2023CS02",
          users: { user_id: 11, first_name: "Bob", last_name: "Jones", college_uid: "STU-02" },
        },
      ]),
    });
  });

  // Attendance history (empty = no prior submission today)
  await page.route("**/attendance/history/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ history: [] }),
    });
  });

  // Mark attendance
  await page.route("**/attendance/mark-attendance", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Attendance marked" }),
      });
    } else {
      await route.fallback();
    }
  });

  // Notes (empty initially)
  await page.route("**/resource/assignments**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    } else if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          note_id: 99,
          title: "Test Note",
          content: "Test content",
          tags: [],
          is_private: false,
        }),
      });
    } else {
      await route.fallback();
    }
  });

  // Resources (empty initially)
  await page.route("**/resource/resources**", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    } else if (method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          resource_id: 99,
          title: "Test File",
          description: "",
          file_url: "/uploads/test.txt",
          tags: [],
        }),
      });
    } else if (method === "DELETE") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    } else {
      await route.fallback();
    }
  });
};

// ---------------------------------------------------------------------------
// Coordinator-specific overrides — seeded values from testing-plan.md
// ---------------------------------------------------------------------------

const makeStudents = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    user_id: 100 + i,
    enrollment_number: `2023CS${String(i + 1).padStart(2, "0")}`,
    users: { user_id: 100 + i, first_name: `Student${i + 1}`, last_name: "Test" },
    sections: { section_name: "CS-A" },
    departments: { department_name: "Computer Science" },
    attendance_percentage: i < 7 ? 85 : 62,
  }));

const makeFacultyList = () => [
  {
    user_id: 3,
    users: { user_id: 3, first_name: "Faculty", last_name: "One", college_uid: "FAC-001" },
    departments: { department_name: "Computer Science" },
    expertise: ["Mathematics"],
    max_weekly_hours: 20,
  },
  {
    user_id: 5,
    users: { user_id: 5, first_name: "Faculty", last_name: "Two", college_uid: "FAC-002" },
    departments: { department_name: "Electronics" },
    expertise: ["Physics"],
    max_weekly_hours: 18,
  },
  {
    user_id: 6,
    users: { user_id: 6, first_name: "Faculty", last_name: "Three", college_uid: "FAC-003" },
    departments: { department_name: "Computer Science" },
    expertise: ["Algorithms"],
    max_weekly_hours: 22,
  },
];

const makeRooms = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    room_id: i + 1,
    room_number: `${String.fromCharCode(65 + Math.floor(i / 3))}-${101 + (i % 3)}`,
    room_type: i % 2 === 0 ? "classroom" : "lab",
    capacity: 40 + i * 5,
    floor_number: Math.floor(i / 3) + 1,
    building_id: Math.floor(i / 3) + 1,
    status: i === 2 ? "maintenance" : "available",
  }));

const makeBuildings = () => [
  { building_id: 1, building_name: "Block A", floors: 3, rooms: makeRooms(3) },
  { building_id: 2, building_name: "Block B", floors: 3, rooms: makeRooms(3) },
];

export const setupCoordinatorMocks = async (page: Page) => {
  const students20 = makeStudents(20);
  const faculty3 = makeFacultyList();
  const rooms6 = makeRooms(6);
  const buildings2 = makeBuildings();

  await page.route("**/student/list-of-student**", async (route) => {
    const url = route.request().url();
    const params = new URL(url).searchParams;
    const search = params.get("search") || "";
    const filtered = search
      ? students20.filter((s) => s.users.first_name.toLowerCase().includes(search.toLowerCase()))
      : students20;
    const page_n = Number(params.get("page") || 1);
    const pageSize = Number(params.get("pageSize") || 10);
    const start = (page_n - 1) * pageSize;
    const slice = filtered.slice(start, start + pageSize);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: slice,
        pagination: { total: filtered.length, page: page_n, pageSize, totalPages: Math.ceil(filtered.length / pageSize) },
      }),
    });
  });

  await page.route("**/student/delete-student/**", async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    } else {
      await route.fallback();
    }
  });

  await page.route("**/faculty/list-of-faculty**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: faculty3,
        pagination: { total: 3, page: 1, pageSize: 10, totalPages: 1 },
      }),
    });
  });

  await page.route("**/faculty/delete-faculty/**", async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    } else {
      await route.fallback();
    }
  });

  await page.route("**/attendance/dashboard**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        stats: {
          overallAttendancePercentage: 78,
          studentsBelowThreshold: 3,
          classesWithoutAttendanceToday: 2,
          totalClasses: 60,
        },
        records: [
          { classId: 1, className: "Mathematics", section: "CS-A", department: "Computer Science", date: "2026-04-01", presentCount: 18, absentCount: 2, method: "manual" },
          { classId: 2, className: "Physics", section: "CS-A", department: "Computer Science", date: "2026-04-02", presentCount: 17, absentCount: 3, method: "facial" },
        ],
      }),
    });
  });

  await page.route("**/attendance/low-attendance-report**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        totalStudents: 3,
        data: students20.filter((s) => s.attendance_percentage < 75),
      }),
    });
  });

  await page.route("**/attendance/send-attendance-emails**", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    } else {
      await route.fallback();
    }
  });

  await page.route("**/room/list-of-rooms**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: rooms6 }),
    });
  });

  await page.route("**/room/buildings**", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: buildings2 }),
      });
    } else if (method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { building_id: 99, building_name: "Block C", floors: 2 } }),
      });
    } else {
      await route.fallback();
    }
  });

  await page.route("**/room**", async (route) => {
    const method = route.request().method();
    if (method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { room_id: 99, room_number: "C-201", room_type: "classroom", capacity: 50, floor_number: 2, status: "available" },
        }),
      });
    } else {
      await route.fallback();
    }
  });

  await page.route("**/department/list-of-department**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          { department_id: 1, department_name: "Computer Science" },
          { department_id: 2, department_name: "Electronics" },
        ],
      }),
    });
  });

  await page.route("**/section/list-of-section**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          { section_id: 1, section_name: "CS-A" },
          { section_id: 2, section_name: "EL-A" },
        ],
      }),
    });
  });
};

// ---------------------------------------------------------------------------
// Admin-specific overrides — seeded values from testing-plan.md
// ---------------------------------------------------------------------------
export const setupAdminMocks = async (page: Page) => {
  // System counts: 20 students, 3 faculty, 1 coordinator, 6 rooms
  await page.route("**/student/list-of-student**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [],
        pagination: { total: 20, page: 1, pageSize: 1, totalPages: 20 },
      }),
    });
  });

  await page.route("**/faculty/list-of-faculty**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [],
        pagination: { total: 3, page: 1, pageSize: 1, totalPages: 3 },
      }),
    });
  });

  await page.route("**/room/list-of-rooms**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: makeRooms(6),
      }),
    });
  });

  await page.route("**/section/list-of-section**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [{ section_id: 1 }, { section_id: 2 }] }),
    });
  });

  await page.route("**/curriculum/course**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: Array.from({ length: 5 }, (_, i) => ({ course_id: i + 1 })) }),
    });
  });

  await page.route("**/supreme/coordinators**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [{ user_id: 2, first_name: "Coordinator", last_name: "User", email: "coord@test.com", college_uid: "COORD-001", institution_id: 1 }],
        pagination: { totalCoordinators: 1 },
      }),
    });
  });
};

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
export const loginAs = async (page: Page, role: Role) => {
  const account = credentials[role];

  await page.goto("/auth/login");

  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(new RegExp(`${roleRoots[role]}$`));
};

export const roleRoot = (role: Role) => roleRoots[role];
