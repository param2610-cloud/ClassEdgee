import { jest } from "@jest/globals";
import { prismaMock, resetPrismaMock } from "../../__mocks__/prisma.js";

jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

const {
  markAttendance,
  getCoordinatorAttendanceDashboard,
  getStudentAttendanceSummary,
  toDateBounds,
} = await import("../../controllers/attendance.controller.js");

const createRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
};

describe("attendance.controller unit", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe("toDateBounds", () => {
    it("returns 30-day fallback range when inputs are missing", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-04-05T10:00:00.000Z").getTime());

      const bounds = toDateBounds(undefined, undefined);

      expect(bounds).not.toBeNull();
      expect(bounds.endDate.getFullYear()).toBe(2026);
      expect(bounds.endDate.getMonth()).toBe(3);
      expect(bounds.endDate.getDate()).toBe(5);
      expect(bounds.startDate.getFullYear()).toBe(2026);
      expect(bounds.startDate.getMonth()).toBe(2);
      expect(bounds.startDate.getDate()).toBe(6);

      jest.useRealTimers();
    });

    it("returns null for invalid dates", () => {
      expect(toDateBounds("2026-01-01", "invalid-date")).toBeNull();
    });
  });

  describe("markAttendance", () => {
    it("returns 400 when class_id is missing", async () => {
      const req = { body: { attendance_data: [{ student_id: 1, status: "present" }] } };
      const res = createRes();

      await markAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "class_id is required" })
      );
    });

    it("returns 400 when attendance_data is empty", async () => {
      const req = { body: { class_id: 1, attendance_data: [] } };
      const res = createRes();

      await markAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "attendance_data must be a non-empty array" })
      );
    });
  });

  describe("getCoordinatorAttendanceDashboard", () => {
    it("returns 400 for non-numeric department_id", async () => {
      const req = { query: { department_id: "abc" } };
      const res = createRes();

      await getCoordinatorAttendanceDashboard(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Invalid department_id or section_id" })
      );
    });

    it("builds Prisma date bounds for valid filters", async () => {
      prismaMock.classes.findMany.mockResolvedValue([]);

      const req = {
        query: {
          department_id: "1",
          start_date: "2026-01-01",
          end_date: "2026-01-31",
        },
      };
      const res = createRes();

      await getCoordinatorAttendanceDashboard(req, res);

      const call = prismaMock.classes.findMany.mock.calls[0][0];
      expect(call.where.sections.department_id).toBe(1);
      expect(call.where.date_of_class.gte).toBeInstanceOf(Date);
      expect(call.where.date_of_class.lte).toBeInstanceOf(Date);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getStudentAttendanceSummary", () => {
    it("returns good status and non-risk for 80% attendance", async () => {
      prismaMock.attendance.findMany.mockResolvedValue([
        ...Array.from({ length: 8 }).map(() => ({
          status: "present",
          class_id: 1,
          classes: { course_id: 11, courses: { course_name: "Algorithms", course_code: "CS303" } },
        })),
        ...Array.from({ length: 2 }).map(() => ({
          status: "absent",
          class_id: 1,
          classes: { course_id: 11, courses: { course_name: "Algorithms", course_code: "CS303" } },
        })),
      ]);

      const req = { params: { studentId: "9" } };
      const res = createRes();

      await getStudentAttendanceSummary(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.summary.overallPercentage).toBe(80);
      expect(payload.summary.atRisk).toBe(false);
      expect(payload.subjects[0].status).toBe("good");
    });

    it("returns at-risk for 60% attendance", async () => {
      prismaMock.attendance.findMany.mockResolvedValue([
        ...Array.from({ length: 6 }).map(() => ({
          status: "present",
          class_id: 2,
          classes: { course_id: 22, courses: { course_name: "Databases", course_code: "CS302" } },
        })),
        ...Array.from({ length: 4 }).map(() => ({
          status: "absent",
          class_id: 2,
          classes: { course_id: 22, courses: { course_name: "Databases", course_code: "CS302" } },
        })),
      ]);

      const req = { params: { studentId: "10" } };
      const res = createRes();

      await getStudentAttendanceSummary(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.summary.overallPercentage).toBe(60);
      expect(payload.summary.atRisk).toBe(true);
      expect(payload.subjects[0].status).toBe("at-risk");
    });

    it("returns default summary when student has no attendance records", async () => {
      prismaMock.attendance.findMany.mockResolvedValue([]);

      const req = { params: { studentId: "11" } };
      const res = createRes();

      await getStudentAttendanceSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          summary: expect.objectContaining({ overallPercentage: 0, totalClasses: 0, atRisk: true }),
          subjects: [],
        })
      );
    });

    it("sorts subjects alphabetically by subject name", async () => {
      prismaMock.attendance.findMany.mockResolvedValue([
        {
          status: "present",
          class_id: 1,
          classes: { course_id: 1, courses: { course_name: "Zoology", course_code: "ZOO" } },
        },
        {
          status: "present",
          class_id: 2,
          classes: { course_id: 2, courses: { course_name: "Algebra", course_code: "ALG" } },
        },
      ]);

      const req = { params: { studentId: "12" } };
      const res = createRes();

      await getStudentAttendanceSummary(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.subjects.map((subject) => subject.subjectName)).toEqual(["Algebra", "Zoology"]);
    });
  });
});
