import api from "@/api/axios";
import { Department, Faculty, User } from "@/interface/general";

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FacultyListResponse {
  success: boolean;
  data: Faculty[];
  pagination: PaginationMeta;
}

export interface FacultyListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  designation?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateFacultyPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  departmentId: number;
  employeeId: string;
  designation: string;
  joiningDate: string;
  contractEndDate?: string;
  expertise: string[];
  qualifications: string[];
  maxWeeklyHours: number;
  researchInterests: string[];
  publications: string[];
  profilePictureUrl?: string;
  institute_id: number;
}

export interface UpdateFacultyPayload {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    profile_picture?: string;
  };
  faculty: {
    department_id: number;
    designation: string;
    expertise: string[];
    qualifications: string[];
    max_weekly_hours?: number;
    contract_end_date?: string | null;
    research_interests: string[];
    publications: string[];
  };
}

export interface BulkUploadResponse {
  total_records?: number;
  created?: number;
  failed?: number;
  [key: string]: unknown;
}

export const getCoordinatorFaculty = async (
  params: FacultyListParams
): Promise<FacultyListResponse> => {
  const response = await api.get("/api/v1/faculty/list-of-faculty", {
    params,
  });

  const payload = response.data as Partial<FacultyListResponse>;

  return {
    success: Boolean(payload.success),
    data: Array.isArray(payload.data) ? payload.data : [],
    pagination: {
      total: Number(payload.pagination?.total ?? 0),
      page: Number(payload.pagination?.page ?? params.page ?? 1),
      pageSize: Number(payload.pagination?.pageSize ?? params.pageSize ?? 8),
      totalPages: Number(payload.pagination?.totalPages ?? 1),
    },
  };
};

export const createCoordinatorFaculty = async (
  payload: CreateFacultyPayload
): Promise<{ success?: boolean; message?: string }> => {
  const response = await api.post("/api/v1/faculty/createfaculty", payload);
  return response.data;
};

export const getFacultyByUserId = async (userId: number): Promise<User> => {
  const response = await api.get(`/api/v1/faculty/get-faculty/${userId}`);
  const payload = response.data?.data;

  if (!payload) {
    throw new Error("Faculty details not found");
  }

  return payload as User;
};

export const updateCoordinatorFaculty = async (
  userId: number,
  payload: UpdateFacultyPayload
): Promise<{ success?: boolean; message?: string }> => {
  const response = await api.put(`/api/v1/faculty/edit/${userId}`, payload);
  return response.data;
};

export const deleteCoordinatorFaculty = async (id: number | string): Promise<void> => {
  await api.delete(`/api/v1/faculty/delete-faculty/${id}`);
};

export const uploadFacultyBulk = async (file: File): Promise<BulkUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/v1/faculty/facultybulkupload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data as BulkUploadResponse;
};

export const getFacultyDepartments = async (
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
