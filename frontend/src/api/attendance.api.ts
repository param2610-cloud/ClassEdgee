import api from "@/api/axios";
import { getCurrentStudent } from "@/api/student.api";
import { Department, Section, Student } from "@/interface/general";

export type ManualAttendanceStatus = "present" | "absent";

export interface ManualAttendancePayload {
  student_id: number;
  status: ManualAttendanceStatus;
}

export interface AttendanceHistoryRecord {
  date: string;
  status: string;
  verification_method: string;
}

export interface ClassAttendanceHistoryItem {
  student: {
    id: number;
    name: string;
    email?: string;
    college_uid?: string;
    profile_picture?: string;
  };
  attendance: {
    present: number;
    absent: number;
    total: number;
    percentage: string;
  };
  records: AttendanceHistoryRecord[];
}

export interface StudentAttendanceSummary {
  overallPercentage: number;
  totalClasses: number;
  attendedClasses: number;
  atRisk: boolean;
}

export interface AttendanceDashboardFilters {
  departmentId?: number;
  sectionId?: number;
  startDate?: string;
  endDate?: string;
  threshold?: number;
}

export interface CoordinatorAttendanceRecord {
  classId: number;
  className: string;
  section: string;
  department: string;
  date: string;
  presentCount: number;
  absentCount: number;
  method: string;
}

export interface CoordinatorAttendanceStats {
  overallAttendancePercentage: number;
  studentsBelowThreshold: number;
  classesWithoutAttendanceToday: number;
  totalClasses: number;
}

export interface CoordinatorAttendanceDashboardResponse {
  stats: CoordinatorAttendanceStats;
  records: CoordinatorAttendanceRecord[];
}

export interface LowAttendanceStudent {
  studentId: number;
  enrollmentNumber: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  attendancePercentage: string;
  totalClasses: number;
  attendedClasses: number;
}

export const getSectionStudents = async (sectionId: number): Promise<Student[]> => {
  const response = await api.get(`/api/v1/student/list-of-student-of-section/${sectionId}`);
  const payload = response.data?.students;
  return Array.isArray(payload) ? (payload as Student[]) : [];
};

export const getClassAttendanceHistory = async (
  classId: number
): Promise<ClassAttendanceHistoryItem[]> => {
  const response = await api.get(`/api/v1/attendance/history/${classId}`);
  const payload = response.data?.history;
  return Array.isArray(payload) ? (payload as ClassAttendanceHistoryItem[]) : [];
};

export const markManualAttendance = async (
  classId: number,
  attendanceData: ManualAttendancePayload[]
): Promise<{ success?: boolean }> => {
  const response = await api.post("/api/v1/attendance/mark-attendance", {
    class_id: classId,
    attendance_data: attendanceData,
  });

  return response.data as { success?: boolean };
};

export const getAttendanceSections = async (): Promise<Section[]> => {
  const response = await api.get("/api/v1/section/list-of-section");
  const payload = response.data?.data;
  return Array.isArray(payload) ? (payload as Section[]) : [];
};

export const getAttendanceDepartments = async (
  institutionId?: number
): Promise<Department[]> => {
  if (!institutionId) return [];

  const response = await api.get("/api/v1/department/list-of-department", {
    headers: {
      "X-Institution-Id": String(institutionId),
    },
  });

  const payload = response.data?.department;
  return Array.isArray(payload) ? (payload as Department[]) : [];
};

export const getCoordinatorAttendanceDashboard = async (
  filters: AttendanceDashboardFilters
): Promise<CoordinatorAttendanceDashboardResponse> => {
  const params = {
    ...(filters.departmentId ? { department_id: String(filters.departmentId) } : {}),
    ...(filters.sectionId ? { section_id: String(filters.sectionId) } : {}),
    ...(filters.startDate ? { start_date: filters.startDate } : {}),
    ...(filters.endDate ? { end_date: filters.endDate } : {}),
    ...(typeof filters.threshold === "number" ? { threshold: String(filters.threshold) } : {}),
  };

  const response = await api.get("/api/v1/attendance/dashboard", { params });

  const stats = response.data?.stats;
  const records = response.data?.records;

  return {
    stats: {
      overallAttendancePercentage: Number(stats?.overallAttendancePercentage ?? 0),
      studentsBelowThreshold: Number(stats?.studentsBelowThreshold ?? 0),
      classesWithoutAttendanceToday: Number(stats?.classesWithoutAttendanceToday ?? 0),
      totalClasses: Number(stats?.totalClasses ?? 0),
    },
    records: Array.isArray(records) ? (records as CoordinatorAttendanceRecord[]) : [],
  };
};

export const getLowAttendanceReport = async (
  filters: AttendanceDashboardFilters
): Promise<LowAttendanceStudent[]> => {
  const params = {
    ...(filters.departmentId ? { department_id: String(filters.departmentId) } : {}),
    ...(typeof filters.threshold === "number" ? { threshold: String(filters.threshold) } : {}),
  };

  const response = await api.get("/api/v1/attendance/low-attendance-report", { params });
  const payload = response.data?.data;
  return Array.isArray(payload) ? (payload as LowAttendanceStudent[]) : [];
};

export const sendLowAttendanceEmails = async (): Promise<{ message?: string; affectedStudents?: unknown[] }> => {
  const response = await api.post("/api/v1/attendance/send-attendance-emails");
  return response.data as { message?: string; affectedStudents?: unknown[] };
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getStudentAttendanceSummary = async (
  userId: number
): Promise<StudentAttendanceSummary> => {
  const student = await getCurrentStudent(userId);
  const studentId = student?.students?.student_id;

  if (!studentId) {
    throw new Error("Student record is missing student_id");
  }

  const reportResponse = await api.get("/api/v1/attendance/low-attendance-report", {
    params: { threshold: 101 },
  });

  const rows = Array.isArray(reportResponse.data?.data) ? reportResponse.data.data : [];
  const match = rows.find((row: { studentId?: number }) => toNumber(row?.studentId) === toNumber(studentId));

  if (!match) {
    return {
      overallPercentage: 0,
      totalClasses: 0,
      attendedClasses: 0,
      atRisk: true,
    };
  }

  const overallPercentage = toNumber(match.attendancePercentage);

  return {
    overallPercentage,
    totalClasses: toNumber(match.totalClasses),
    attendedClasses: toNumber(match.attendedClasses),
    atRisk: overallPercentage < 75,
  };
};
