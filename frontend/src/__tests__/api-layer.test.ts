import { beforeEach, describe, expect, it, vi } from "vitest";

const apiGetMock = vi.hoisted(() => vi.fn());
const apiPostMock = vi.hoisted(() => vi.fn());
const getCurrentStudentMock = vi.hoisted(() => vi.fn());

vi.mock("@/api/axios", () => ({
  default: {
    get: apiGetMock,
    post: apiPostMock,
  },
}));

vi.mock("@/api/student.api", async () => {
  const actual = await vi.importActual<typeof import("@/api/student.api")>("@/api/student.api");
  return {
    ...actual,
    getCurrentStudent: getCurrentStudentMock,
  };
});

import {
  getCoordinatorAttendanceDashboard,
  getStudentAttendanceSummary,
} from "@/api/attendance.api";
import { getFacultyDashboardSummary, sameDay } from "@/api/dashboard.api";

describe("frontend API layer transformations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentStudentMock.mockResolvedValue({ students: { student_id: 9 } });
  });

  it("getStudentAttendanceSummary marks atRisk true when overallPercentage is 74", async () => {
    apiGetMock.mockResolvedValue({
      data: {
        summary: {
          overallPercentage: 74,
          totalClasses: 10,
          attendedClasses: 7,
        },
        subjects: [],
      },
    });

    const result = await getStudentAttendanceSummary(101);
    expect(result.atRisk).toBe(true);
  });

  it("getStudentAttendanceSummary marks atRisk false when overallPercentage is 75", async () => {
    apiGetMock.mockResolvedValue({
      data: {
        summary: {
          overallPercentage: 75,
          totalClasses: 20,
          attendedClasses: 15,
        },
        subjects: [],
      },
    });

    const result = await getStudentAttendanceSummary(101);
    expect(result.atRisk).toBe(false);
  });

  it("getStudentAttendanceSummary returns safe defaults when summary is null", async () => {
    apiGetMock.mockResolvedValue({ data: { summary: null, subjects: null } });

    const result = await getStudentAttendanceSummary(101);

    expect(result).toEqual({
      overallPercentage: 0,
      totalClasses: 0,
      attendedClasses: 0,
      atRisk: true,
    });
  });

  it("getCoordinatorAttendanceDashboard maps stats to numbers and defaults records", async () => {
    apiGetMock.mockResolvedValue({
      data: {
        stats: {
          overallAttendancePercentage: "82.5",
          studentsBelowThreshold: "3",
          classesWithoutAttendanceToday: "1",
          totalClasses: "30",
        },
      },
    });

    const result = await getCoordinatorAttendanceDashboard({ threshold: 75 });

    expect(result.stats).toEqual({
      overallAttendancePercentage: 82.5,
      studentsBelowThreshold: 3,
      classesWithoutAttendanceToday: 1,
      totalClasses: 30,
    });
    expect(result.records).toEqual([]);
  });

  it("sameDay helper returns true for same calendar date and false for different dates", () => {
    const now = new Date();
    const sameDate = new Date(now);
    sameDate.setHours(1, 0, 0, 0);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    expect(sameDay(sameDate.toISOString())).toBe(true);
    expect(sameDay(yesterday.toISOString())).toBe(false);
  });

  it("getFacultyDashboardSummary never returns negative pendingAttendance", async () => {
    const today = new Date().toISOString();

    apiGetMock.mockImplementation(async (url) => {
      if (url.startsWith("/api/v1/faculty/get-faculty/")) {
        return { data: { data: { faculty: { faculty_id: 77 } } } };
      }

      if (url.startsWith("/api/v1/faculty/classes/list-of-past-classes/")) {
        return {
          data: [
            { class_id: 1, date_of_class: today },
          ],
        };
      }

      if (url.startsWith("/api/v1/attendance/history/")) {
        return {
          data: {
            history: [{ student: { id: 1, name: "Student" }, records: [{ date: today, status: "present" }] }],
          },
        };
      }

      return { data: {} };
    });

    const result = await getFacultyDashboardSummary(77);

    expect(result.todayClasses).toBe(1);
    expect(result.pendingAttendance).toBe(0);
  });
});
