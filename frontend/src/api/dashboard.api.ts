import api from "@/api/axios";

export interface DashboardClassRow {
  class_id: number;
  date_of_class?: string;
  courses?: {
    course_name?: string;
    course_code?: string;
  };
  sections?: {
    section_name?: string;
  };
  rooms?: {
    room_number?: string;
  };
  timeslots?: {
    start_time?: string;
    end_time?: string;
  };
}

export interface FacultyDashboardSummary {
  facultyId: number | null;
  totalClasses: number;
  todayClasses: number;
  pendingAttendance: number;
  recentClasses: DashboardClassRow[];
}

export interface CoordinatorRow {
  college_uid?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  institution_id?: number;
}

export interface SystemCounts {
  students: number;
  faculty: number;
  coordinators: number;
  sections: number;
  rooms: number;
  courses: number;
}

const toArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const sameDay = (value?: string) => {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export const getFacultyDashboardSummary = async (userId: number): Promise<FacultyDashboardSummary> => {
  const facultyResponse = await api.get(`/api/v1/faculty/get-faculty/${userId}`);
  const facultyPayload = facultyResponse.data?.data ?? facultyResponse.data;
  const facultyId = Number(facultyPayload?.faculty?.faculty_id) || null;

  const classesResponse = await api.get(`/api/v1/faculty/classes/list-of-past-classes/${userId}`);
  const classes = toArray<DashboardClassRow>(classesResponse.data);

  const todayClasses = classes.filter((item) => sameDay(item.date_of_class));

  const todayAttendanceChecks = await Promise.all(
    todayClasses.map((row) =>
      api
        .get(`/api/v1/attendance/history/${row.class_id}`)
        .then((res) => {
          const history = toArray(res.data?.history);
          return history.length > 0;
        })
        .catch(() => false)
    )
  );

  const markedCount = todayAttendanceChecks.filter(Boolean).length;

  return {
    facultyId,
    totalClasses: classes.length,
    todayClasses: todayClasses.length,
    pendingAttendance: Math.max(todayClasses.length - markedCount, 0),
    recentClasses: classes.slice(0, 6),
  };
};

export const getStudentsCount = async (): Promise<number> => {
  const response = await api.get("/api/v1/student/list-of-student", {
    params: { page: 1, pageSize: 1 },
  });

  const total = Number(response.data?.pagination?.total);
  if (Number.isFinite(total)) return total;

  return toArray(response.data?.data).length;
};

export const getFacultyCount = async (): Promise<number> => {
  const response = await api.get("/api/v1/faculty/list-of-faculty", {
    params: { page: 1, pageSize: 1 },
  });

  const total = Number(response.data?.pagination?.total);
  if (Number.isFinite(total)) return total;

  return toArray(response.data?.data).length;
};

export const getSectionsCount = async (): Promise<number> => {
  const response = await api.get("/api/v1/section/list-of-section");
  return toArray(response.data?.data).length;
};

export const getRoomsCount = async (): Promise<number> => {
  const response = await api.get("/api/v1/room/list-of-rooms");
  return toArray(response.data?.data).length;
};

export const getCoursesCount = async (): Promise<number> => {
  const response = await api.get("/api/v1/curriculum/course");
  return toArray(response.data).length;
};

export const getCoordinators = async (
  institutionId?: number,
  limit = 10
): Promise<CoordinatorRow[]> => {
  const response = await api.get("/api/v1/supreme/coordinators", {
    params: {
      page: 1,
      limit,
      institution_id: institutionId,
    },
  });

  return toArray<CoordinatorRow>(response.data?.data);
};

export const getCoordinatorCount = async (institutionId?: number): Promise<number> => {
  const response = await api.get("/api/v1/supreme/coordinators", {
    params: {
      page: 1,
      limit: 1,
      institution_id: institutionId,
    },
  });

  const total = Number(response.data?.pagination?.totalCoordinators);
  if (Number.isFinite(total)) return total;

  return toArray(response.data?.data).length;
};

export const getSystemCounts = async (institutionId?: number): Promise<SystemCounts> => {
  const [students, faculty, coordinators, sections, rooms, courses] = await Promise.all([
    getStudentsCount(),
    getFacultyCount(),
    getCoordinatorCount(institutionId),
    getSectionsCount(),
    getRoomsCount(),
    getCoursesCount(),
  ]);

  return {
    students,
    faculty,
    coordinators,
    sections,
    rooms,
    courses,
  };
};
