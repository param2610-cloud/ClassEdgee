import api from "@/api/axios";

export interface StudentClassData {
  class_id: number;
  date_of_class?: string;
  courses?: {
    course_name?: string;
    course_code?: string;
  };
  rooms?: {
    room_number?: string;
  };
  sections?: {
    section_name?: string;
  };
  timeslots?: {
    start_time?: string;
    end_time?: string;
  };
}

const isValidClass = (value: unknown): value is StudentClassData => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return Number(candidate.class_id) > 0;
};

export const getStudentUpcomingClasses = async (
  studentId: number,
  numberOfClasses = 5
): Promise<StudentClassData[]> => {
  const requests = Array.from({ length: numberOfClasses }).map((_, index) =>
    api
      .get(`/api/v1/student/classes/upcoming-classes/${studentId}/${index}`)
      .then((res) => res.data)
      .catch(() => null)
  );

  const responses = await Promise.all(requests);

  const uniqueByClass = new Map<number, StudentClassData>();
  responses.forEach((item) => {
    if (isValidClass(item)) {
      uniqueByClass.set(item.class_id, item);
    }
  });

  return Array.from(uniqueByClass.values());
};

export const getStudentPastClasses = async (userId: number): Promise<StudentClassData[]> => {
  const response = await api.get(`/api/v1/student/classes/list-of-past-classes/${userId}`);
  const payload = Array.isArray(response.data) ? response.data : [];
  return payload.filter(isValidClass);
};
