import { beforeEach, describe, expect, it, vi } from "vitest";

const apiGetMock = vi.hoisted(() => vi.fn());

vi.mock("@/api/axios", () => ({
  default: {
    get: apiGetMock,
  },
}));

import { getCoordinatorStudents } from "@/api/student.api";

describe("getCoordinatorStudents transformation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns fallback pagination when pagination is missing", async () => {
    apiGetMock.mockResolvedValue({
      data: {
        success: true,
        data: [{ student_id: 1 }],
      },
    });

    const result = await getCoordinatorStudents({ page: 2, pageSize: 5 });

    expect(result.pagination).toEqual({
      total: 0,
      page: 2,
      pageSize: 5,
      totalPages: 1,
    });
  });

  it("returns empty array when data is not an array", async () => {
    apiGetMock.mockResolvedValue({
      data: {
        success: true,
        data: null,
        pagination: { total: 10, page: 1, pageSize: 10, totalPages: 1 },
      },
    });

    const result = await getCoordinatorStudents({});

    expect(result.data).toEqual([]);
  });
});
