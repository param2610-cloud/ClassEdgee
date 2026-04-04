import { jest } from "@jest/globals";
import { prismaMock, resetPrismaMock } from "../../__mocks__/prisma.js";

const axiosPostMock = jest.fn();

jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

jest.unstable_mockModule("axios", () => ({
  default: {
    post: axiosPostMock,
  },
}));

const { generateSchedule } = await import("../../controllers/schedule/schedule.controller2.js");

const createRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
};

const setupFetchDataMocks = () => {
  prismaMock.departments.findMany.mockResolvedValue([
    {
      department_id: 1,
      department_code: "CSE",
      department_name: "Computer Science",
      faculty: [
        {
          faculty_id: 1,
          max_classes_per_day: 4,
          max_weekly_hours: 40,
          preferred_slots: [1, 2],
          users: { first_name: "Ada", last_name: "Lovelace" },
          facultyavailability: [],
          faculty_subject_mapping: [
            {
              subject_details: {
                subject_code: "CS301",
              },
            },
          ],
        },
      ],
      courses: [
        {
          course_id: 1,
          credits: 4,
          subject_details: [
            {
              subject_id: 1,
              subject_code: "CS301",
              subject_name: "Data Structures",
              subject_type: "theory",
              faculty_subject_mapping: [{ faculty: { faculty_id: 1 } }],
              units: [{ required_hours: 3 }],
              syllabus_structure: { semester: 3 },
            },
          ],
        },
      ],
      sections: [
        {
          section_id: 1,
          section_name: "CS-A",
          batch_year: 2023,
          student_count: 10,
          semester: 3,
          academic_year: 2026,
        },
      ],
    },
  ]);

  prismaMock.rooms.findMany.mockResolvedValue([
    {
      room_id: 1,
      room_number: "A-101",
      capacity: 60,
      room_type: "classroom",
      features: null,
    },
  ]);

  prismaMock.timeslots.findMany.mockResolvedValue([
    {
      slot_id: 1,
      day_of_week: 1,
      start_time: new Date("1970-01-01T09:00:00.000Z"),
    },
  ]);
};

describe("schedule.controller generateSchedule unit", () => {
  beforeEach(() => {
    resetPrismaMock();
    axiosPostMock.mockReset();
    setupFetchDataMocks();
  });

  it("returns 422 with solver_status=infeasible and message from Python response", async () => {
    axiosPostMock.mockResolvedValue({
      data: {
        status: "infeasible",
        message: "No room available",
      },
    });

    const req = { body: { created_by: 1 } };
    const res = createRes();

    await generateSchedule(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        solver_status: "infeasible",
        message: "No room available",
      })
    );
  });

  it("returns 422 with fallback infeasible message when none is provided", async () => {
    axiosPostMock.mockResolvedValue({
      data: {
        status: "infeasible",
      },
    });

    const req = { body: { created_by: 1 } };
    const res = createRes();

    await generateSchedule(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        solver_status: "infeasible",
        message: expect.stringContaining("No feasible schedule"),
      })
    );
  });

  it("returns 422 when solver response is feasible but schedule is empty", async () => {
    axiosPostMock.mockResolvedValue({
      data: {
        status: "feasible",
        schedule: [],
      },
    });

    const req = { body: { created_by: 1 } };
    const res = createRes();

    await generateSchedule(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Schedule solver returned an empty result.",
        solver_status: "feasible",
      })
    );
  });

  it("returns 200 when solver status is optimal and schedule is persisted", async () => {
    axiosPostMock.mockResolvedValue({
      data: {
        status: "optimal",
        schedule: {
          CSE_2023_1: {
            "1 09:00:00": {
              faculty_id: "1",
              room_id: "1",
              section_id: "1",
              semester: 3,
              academic_year: 2026,
              course_id: "1",
              subject_id: "1",
              slot_id: "1",
            },
          },
        },
      },
    });

    prismaMock.departments.findFirst.mockResolvedValue({ department_id: 1 });
    prismaMock.$transaction.mockImplementation(async (callback) => {
      const tx = {
        schedule_meta: {
          findFirst: jest.fn().mockResolvedValue({ schedule_id: 1 }),
          create: jest.fn().mockResolvedValue({ schedule_id: 1 }),
        },
        schedule_details: {
          findFirst: jest.fn().mockResolvedValue({ detail_id: 1 }),
          create: jest.fn().mockResolvedValue({ detail_id: 1 }),
        },
        classes: {
          createMany: jest.fn().mockResolvedValue({ count: 16 }),
        },
      };

      return callback(tx);
    });

    const req = { body: { created_by: 1, semester_weeks: 1 } };
    const res = createRes();

    await generateSchedule(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        solver_status: "optimal",
        message: "Schedule generated successfully",
      })
    );
  });
});
