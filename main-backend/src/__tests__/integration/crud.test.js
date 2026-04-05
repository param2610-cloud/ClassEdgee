import bcrypt from "bcrypt";
import request from "supertest";
import { jest } from "@jest/globals";
import { prismaMock, resetPrismaMock } from "../../__mocks__/prisma.js";

jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

const { default: app } = await import("../../../server.js");

describe("integration student/faculty CRUD routes", () => {
  let passwordHash;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash("Test@1234", 10);
  });

  beforeEach(() => {
    resetPrismaMock();
  });

  it("creates a student and persists user + student records", async () => {
    prismaMock.users.findUnique.mockResolvedValueOnce(null);
    prismaMock.students.findUnique.mockResolvedValueOnce(null);
    prismaMock.users.findUnique.mockResolvedValueOnce(null);
    prismaMock.users.create.mockResolvedValue({ user_id: 700 });
    prismaMock.students.create.mockResolvedValue({ student_id: 900, user_id: 700 });

    const response = await request(app)
      .post("/api/v1/student/createstudent")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "newstudent@test.com",
        password: "Test@1234",
        phoneNumber: "9999999999",
        departmentId: 1,
        enrollmentNumber: "2023CS99",
        batchYear: 2023,
        currentSemester: 3,
        guardianName: "Guardian",
        guardianContact: "9999999998",
        collegeUid: "STU-099",
        institution_id: 1,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(prismaMock.users.create).toHaveBeenCalled();
    expect(prismaMock.students.create).toHaveBeenCalled();
  });

  it("returns error for duplicate email during student create", async () => {
    prismaMock.users.findUnique.mockResolvedValue({ user_id: 1, email: "dup@test.com" });

    const response = await request(app)
      .post("/api/v1/student/createstudent")
      .send({
        firstName: "Dup",
        lastName: "User",
        email: "dup@test.com",
        password: "Test@1234",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("returns an error when required student fields are missing", async () => {
    prismaMock.users.findUnique.mockResolvedValue(null);
    prismaMock.students.findUnique.mockResolvedValue(null);
    prismaMock.users.create.mockRejectedValue(new Error("Missing required field"));

    const response = await request(app)
      .post("/api/v1/student/createstudent")
      .send({
        email: "bad@test.com",
        password: "Test@1234",
      });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("lists students with pagination metadata", async () => {
    prismaMock.students.count.mockResolvedValue(20);
    prismaMock.students.findMany.mockResolvedValue(
      Array.from({ length: 5 }).map((_, index) => ({ student_id: index + 1 }))
    );

    const response = await request(app).get("/api/v1/student/list-of-student?page=1&pageSize=5&search=student1");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.pagination.total).toBe(20);
  });

  it("deletes student user pair and returns 404 for unknown user", async () => {
    prismaMock.students.findUnique.mockResolvedValueOnce({ student_id: 1, user_id: 50 });
    prismaMock.students.delete.mockResolvedValue({ student_id: 1 });
    prismaMock.users.delete.mockResolvedValue({ user_id: 50 });

    let response = await request(app).delete("/api/v1/student/delete-student/50");
    expect(response.status).toBe(200);

    prismaMock.students.findUnique.mockResolvedValueOnce(null);

    response = await request(app).delete("/api/v1/student/delete-student/999");
    expect(response.status).toBe(404);
  });

  it("deletes faculty by numeric id and by college UID and handles unknown ids", async () => {
    prismaMock.faculty.findFirst.mockResolvedValueOnce({ faculty_id: 1, user_id: 12 });
    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback({
        faculty: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
        users: { delete: jest.fn().mockResolvedValue({ user_id: 12 }) },
      });
    });

    let response = await request(app).delete("/api/v1/faculty/delete-faculty/12");
    expect(response.status).toBe(200);

    prismaMock.users.findFirst.mockResolvedValueOnce({ user_id: 13 });
    prismaMock.faculty.findFirst.mockResolvedValueOnce({ faculty_id: 2, user_id: 13 });

    response = await request(app).delete("/api/v1/faculty/delete-faculty/EMP-001");
    expect(response.status).toBe(200);

    prismaMock.users.findFirst.mockResolvedValueOnce(null);
    response = await request(app).delete("/api/v1/faculty/delete-faculty/UNKNOWN");
    expect(response.status).toBe(404);
  });
});
