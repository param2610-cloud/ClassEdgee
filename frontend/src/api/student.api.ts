import api from "@/api/axios";
import { Department, Student, User } from "@/interface/general";

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StudentListResponse {
  success: boolean;
  data: Student[];
  pagination: PaginationMeta;
}

export interface StudentListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  semester?: string;
  batchYear?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CoordinatorStudentPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  departmentId: number;
  enrollmentNumber: string;
  batchYear: number;
  currentSemester: number;
  guardianName: string;
  guardianContact: string;
  collegeUid: string;
  profilePictureUrl?: string;
  password?: string;
  institution_id?: number;
}

export interface BulkUploadResponse {
  total_records?: number;
  created?: number;
  failed?: number;
  [key: string]: unknown;
}

export const getCurrentStudent = async (userId: number): Promise<User> => {
  const response = await api.get(`/api/v1/student/get-student/${userId}`);
  const payload = response.data?.data ?? response.data;

  if (!payload) {
    throw new Error("Failed to load student profile");
  }

  return payload as User;
};

export const getCoordinatorStudents = async (
  params: StudentListParams
): Promise<StudentListResponse> => {
  const response = await api.get("/api/v1/student/list-of-student", {
    params,
  });

  const payload = response.data as Partial<StudentListResponse>;

  return {
    success: Boolean(payload.success),
    data: Array.isArray(payload.data) ? payload.data : [],
    pagination: {
      total: Number(payload.pagination?.total ?? 0),
      page: Number(payload.pagination?.page ?? params.page ?? 1),
      pageSize: Number(payload.pagination?.pageSize ?? params.pageSize ?? 10),
      totalPages: Number(payload.pagination?.totalPages ?? 1),
    },
  };
};

export const getStudentByUserId = async (userId: number): Promise<User> => {
  const response = await api.get(`/api/v1/student/get-student/${userId}`);
  const payload = response.data?.data;

  if (!payload) {
    throw new Error("Student details not found");
  }

  return payload as User;
};

export const createCoordinatorStudent = async (
  payload: CoordinatorStudentPayload
): Promise<{ success?: boolean; message?: string }> => {
  const response = await api.post("/api/v1/student/createstudent", payload);
  return response.data;
};

export const updateCoordinatorStudent = async (
  userId: number,
  payload: Omit<CoordinatorStudentPayload, "password" | "institution_id">
): Promise<{ success?: boolean; message?: string }> => {
  const response = await api.put(`/api/v1/student/edit/${userId}`, payload);
  return response.data;
};

export const deleteCoordinatorStudent = async (userId: number): Promise<void> => {
  await api.delete(`/api/v1/student/delete-student/${userId}`);
};

export const uploadStudentsBulk = async (file: File): Promise<BulkUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/v1/student/studentbulkupload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data as BulkUploadResponse;
};

export const getDepartmentsForInstitution = async (
  institutionId: number
): Promise<Department[]> => {
  const response = await api.get("/api/v1/department/list-of-department", {
    headers: {
      "X-Institution-Id": String(institutionId),
    },
  });

  const payload = response.data?.department;
  return Array.isArray(payload) ? (payload as Department[]) : [];
};
