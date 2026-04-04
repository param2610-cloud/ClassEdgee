import api from "@/api/axios";
import { getCurrentStudent } from "@/api/student.api";

export interface StudentAttendanceSummary {
  overallPercentage: number;
  totalClasses: number;
  attendedClasses: number;
  atRisk: boolean;
}

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
