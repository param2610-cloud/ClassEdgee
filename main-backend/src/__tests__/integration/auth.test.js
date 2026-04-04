import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import request from "supertest";
import { jest } from "@jest/globals";
import { prismaMock, resetPrismaMock } from "../../__mocks__/prisma.js";

jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

const { default: app } = await import("../../../server.js");

describe("integration auth routes", () => {
  const password = "Test@1234";
  let passwordHash;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(password, 10);
  });

  beforeEach(() => {
    resetPrismaMock();
    prismaMock.users.update.mockResolvedValue({ user_id: 1, role: "admin" });
  });

  it("logs in admin and returns a valid JWT", async () => {
    prismaMock.users.findUnique.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
      first_name: "Admin",
      last_name: "User",
      institution_id: 1,
      institutions: { name: "Testville" },
      password_hash: passwordHash,
    });

    const response = await request(app)
      .post("/api/v1/supreme/login")
      .send({ email: "admin@test.com", password });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeTruthy();

    const decoded = jwt.verify(response.body.accessToken, process.env.ACCESS_TOKEN_SECRET);
    expect(decoded.email).toBe("admin@test.com");
  });

  it("logs in coordinator/faculty/student with their route handlers", async () => {
    prismaMock.users.findUnique.mockResolvedValueOnce({
      email: "coord@test.com",
      role: "coordinator",
      institution_id: 1,
      password_hash: passwordHash,
      college_uid: "COORD-001",
      first_name: "Core",
      last_name: "Coord",
    });

    let response = await request(app)
      .post("/api/v1/coordinator/login")
      .send({ email: "coord@test.com", password });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeTruthy();

    prismaMock.users.findUnique.mockResolvedValueOnce({
      email: "faculty1@test.com",
      role: "faculty",
      institution_id: 1,
      password_hash: passwordHash,
      faculty: { faculty_id: 10 },
    });

    response = await request(app)
      .post("/api/v1/faculty/login")
      .send({ email: "faculty1@test.com", password });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeTruthy();

    prismaMock.users.findUnique.mockResolvedValueOnce({
      email: "student1@test.com",
      role: "student",
      institution_id: 1,
      password_hash: passwordHash,
      students: { student_id: 9 },
      departments: { department_id: 1 },
    });

    response = await request(app)
      .post("/api/v1/student/login")
      .send({ email: "student1@test.com", password });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeTruthy();
  });

  it("returns 401 for wrong password", async () => {
    prismaMock.users.findUnique.mockResolvedValue({
      email: "admin@test.com",
      role: "admin",
      institution_id: 1,
      password_hash: passwordHash,
    });

    const response = await request(app)
      .post("/api/v1/supreme/login")
      .send({ email: "admin@test.com", password: "Wrong@1234" });

    expect(response.status).toBe(401);
  });

  it("returns 401 for unknown email", async () => {
    prismaMock.users.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/v1/faculty/login")
      .send({ email: "unknown@test.com", password });

    expect(response.status).toBe(401);
  });

  it("returns 401 when role data does not match route expectations", async () => {
    prismaMock.users.findUnique.mockResolvedValue({
      email: "student1@test.com",
      role: "student",
      password_hash: passwordHash,
    });

    const response = await request(app)
      .post("/api/v1/faculty/login")
      .send({ email: "student1@test.com", password });

    expect(response.status).toBe(401);
  });
});
