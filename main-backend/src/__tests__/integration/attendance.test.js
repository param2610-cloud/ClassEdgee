import request from "supertest";
import { jest } from "@jest/globals";
import { prismaMock, resetPrismaMock } from "../../__mocks__/prisma.js";

jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

const { default: app } = await import("../../../server.js");

describe("integration attendance routes", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("mark-attendance returns 200 and forwards data to upsert", async () => {
    prismaMock.attendance.upsert.mockImplementation(async ({ create }) => ({
      attendance_id: 1,
      ...create,
    }));

    const response = await request(app)
      .post("/api/v1/attendance/mark-attendance")
      .send({
        class_id: 101,
        attendance_data: [
          { student_id: 1, status: "present" },
          { student_id: 2, status: "absent" },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(prismaMock.attendance.upsert).toHaveBeenCalledTimes(2);
  });

  it("mark-attendance validates missing class_id and attendance_data", async () => {
    let response = await request(app)
      .post("/api/v1/attendance/mark-attendance")
      .send({ attendance_data: [{ student_id: 1, status: "present" }] });

    expect(response.status).toBe(400);

    response = await request(app)
      .post("/api/v1/attendance/mark-attendance")
      .send({ class_id: 101, attendance_data: [] });

    expect(response.status).toBe(400);
  });

  it("history route returns grouped records", async () => {
    prismaMock.attendance.findMany.mockResolvedValue([
      {
        class_id: 101,
        student_id: 1,
        date: new Date(),
        status: "present",
        verification_method: "manual",
        students: {
          user_id: 2001,
          users: {
            first_name: "John",
            last_name: "Doe",
            email: "john@test.com",
            college_uid: "STU-01",
            profile_picture: null,
          },
        },
      },
    ]);

    const response = await request(app).get("/api/v1/attendance/history/101");

    expect(response.status).toBe(200);
    expect(response.body.history).toHaveLength(1);
    expect(response.body.history[0].student.name).toBe("John Doe");
  });

  it("student-summary returns atRisk true for low attendance and false for healthy", async () => {
    prismaMock.attendance.findMany
      .mockResolvedValueOnce([
        ...Array.from({ length: 6 }).map(() => ({
          status: "present",
          class_id: 1,
          classes: { course_id: 11, courses: { course_name: "Algorithms", course_code: "CS303" } },
        })),
        ...Array.from({ length: 4 }).map(() => ({
          status: "absent",
          class_id: 1,
          classes: { course_id: 11, courses: { course_name: "Algorithms", course_code: "CS303" } },
        })),
      ])
      .mockResolvedValueOnce([
        ...Array.from({ length: 9 }).map(() => ({
          status: "present",
          class_id: 1,
          classes: { course_id: 11, courses: { course_name: "Algorithms", course_code: "CS303" } },
        })),
        ...Array.from({ length: 1 }).map(() => ({
          status: "absent",
          class_id: 1,
          classes: { course_id: 11, courses: { course_name: "Algorithms", course_code: "CS303" } },
        })),
      ]);

    let response = await request(app).get("/api/v1/attendance/student-summary/1");
    expect(response.status).toBe(200);
    expect(response.body.summary.atRisk).toBe(true);

    response = await request(app).get("/api/v1/attendance/student-summary/2");
    expect(response.status).toBe(200);
    expect(response.body.summary.atRisk).toBe(false);
  });

  it("dashboard validates bad date and returns records for valid date range", async () => {
    let response = await request(app).get("/api/v1/attendance/dashboard?start_date=invalid");
    expect(response.status).toBe(400);

    prismaMock.classes.findMany.mockResolvedValue([
      {
        class_id: 11,
        date_of_class: new Date(),
        section_id: 1,
        sections: {
          section_id: 1,
          section_name: "CS-A",
          department_id: 1,
          departments: { department_name: "Computer Science" },
        },
        courses: { course_name: "Data Structures" },
      },
    ]);

    prismaMock.attendance.findMany.mockResolvedValue([
      {
        class_id: 11,
        student_id: 1,
        date: new Date(),
        status: "present",
        verification_method: "manual",
      },
    ]);

    prismaMock.students.findMany.mockResolvedValue([{ student_id: 1, section_id: 1 }]);

    response = await request(app).get("/api/v1/attendance/dashboard?department_id=1");
    expect(response.status).toBe(200);
    expect(response.body.records.length).toBeGreaterThanOrEqual(1);
  });

  it("low-attendance-report filters by threshold", async () => {
    prismaMock.students.findMany.mockResolvedValue([
      {
        student_id: 1,
        enrollment_number: "2023CS01",
        current_semester: 3,
        attendance: [
          { status: "present" },
          { status: "present" },
          { status: "absent" },
          { status: "absent" },
        ],
        users: { first_name: "Risk", last_name: "Student", email: "risk@test.com" },
        departments: { department_name: "Computer Science" },
      },
      {
        student_id: 2,
        enrollment_number: "2023CS02",
        current_semester: 3,
        attendance: [
          { status: "present" },
          { status: "present" },
          { status: "present" },
          { status: "absent" },
        ],
        users: { first_name: "Safe", last_name: "Student", email: "safe@test.com" },
        departments: { department_name: "Computer Science" },
      },
    ]);

    prismaMock.classes.count.mockResolvedValue(4);

    let response = await request(app).get("/api/v1/attendance/low-attendance-report?threshold=75");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);

    response = await request(app).get("/api/v1/attendance/low-attendance-report?threshold=100");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
  });
});
