import api from "@/api/axios";
import { getCurrentStudent } from "@/api/student.api";
import { Student } from "@/interface/general";

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
