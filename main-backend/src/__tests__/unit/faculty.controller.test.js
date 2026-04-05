import { jest } from "@jest/globals";
import { prismaMock, resetPrismaMock } from "../../__mocks__/prisma.js";

jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

const { deletefaculty } = await import("../../controllers/faculty.controller.js");

const createRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
};

describe("faculty.controller deletefaculty unit", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("uses numeric user_id path directly when id is numeric", async () => {
    prismaMock.faculty.findFirst.mockResolvedValue({ faculty_id: 5, user_id: 123 });
    prismaMock.$transaction.mockImplementation(async (callback) => {
      const tx = {
        faculty: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
        users: { delete: jest.fn().mockResolvedValue({ user_id: 123 }) },
      };
      return callback(tx);
    });

    const req = { params: { id: "123" } };
    const res = createRes();

    await deletefaculty(req, res);

    expect(prismaMock.users.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.faculty.findFirst).toHaveBeenCalledWith({ where: { user_id: 123 } });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("resolves user_id from college_uid path when id is non-numeric", async () => {
    prismaMock.users.findFirst.mockResolvedValue({ user_id: 44 });
    prismaMock.faculty.findFirst.mockResolvedValue({ faculty_id: 8, user_id: 44 });
    prismaMock.$transaction.mockImplementation(async (callback) => {
      const tx = {
        faculty: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
        users: { delete: jest.fn().mockResolvedValue({ user_id: 44 }) },
      };
      return callback(tx);
    });

    const req = { params: { id: "EMP-001" } };
    const res = createRes();

    await deletefaculty(req, res);

    expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
      where: { college_uid: "EMP-001", role: "faculty" },
      select: { user_id: true },
    });
    expect(prismaMock.faculty.findFirst).toHaveBeenCalledWith({ where: { user_id: 44 } });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 404 when user is not found for college_uid", async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);

    const req = { params: { id: "UNKNOWN-UID" } };
    const res = createRes();

    await deletefaculty(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "faculty not found" })
    );
  });

  it("returns 404 when faculty row is not found for resolved user id", async () => {
    prismaMock.users.findFirst.mockResolvedValue({ user_id: 77 });
    prismaMock.faculty.findFirst.mockResolvedValue(null);

    const req = { params: { id: "EMP-404" } };
    const res = createRes();

    await deletefaculty(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "faculty not found" })
    );
  });

  it("deletes faculty and user in one transaction and returns success", async () => {
    prismaMock.faculty.findFirst.mockResolvedValue({ faculty_id: 11, user_id: 321 });

    const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const deleteUser = jest.fn().mockResolvedValue({ user_id: 321 });

    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback({
        faculty: { deleteMany },
        users: { delete: deleteUser },
      });
    });

    const req = { params: { id: "321" } };
    const res = createRes();

    await deletefaculty(req, res);

    expect(deleteMany).toHaveBeenCalledWith({ where: { user_id: 321 } });
    expect(deleteUser).toHaveBeenCalledWith({ where: { user_id: 321 } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "faculty deleted successfully" })
    );
  });
});
