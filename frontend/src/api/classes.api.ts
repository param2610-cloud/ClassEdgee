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

export interface ClassUserLite {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface ClassNote {
  note_id: number;
  title: string;
  content: string;
  tags: string[];
  is_private?: boolean;
  created_at?: string;
  updated_at?: string;
  users?: ClassUserLite;
}

export interface UploadClassNotePayload {
  title: string;
  content: string;
  courseId: number;
  createdBy: number;
  sectionId?: number;
  tags?: string[];
  isPrivate?: boolean;
}

export interface ClassResource {
  resource_id: number;
  title: string;
  description?: string;
  file_url?: string;
  resource_type: string;
  tags: string[];
  visibility?: string;
  created_at?: string;
  users?: ClassUserLite;
}

export interface UploadClassResourcePayload {
  title: string;
  description?: string;
  courseId: number;
  uploadedBy: number;
  file: File;
  tags?: string[];
  visibility?: string;
}

export const getNotes = async (courseId: number): Promise<ClassNote[]> => {
  const response = await api.get("/api/v1/resource/assignments", {
    params: { course_id: courseId },
  });

  return Array.isArray(response.data) ? (response.data as ClassNote[]) : [];
};

export const uploadNote = async (payload: UploadClassNotePayload): Promise<ClassNote> => {
  const response = await api.post("/api/v1/resource/assignments", {
    title: payload.title,
    content: payload.content,
    course_id: payload.courseId,
    created_by: payload.createdBy,
    section_id: payload.sectionId,
    tags: payload.tags ?? [],
    is_private: payload.isPrivate ?? false,
  });

  return response.data as ClassNote;
};

export const getResources = async (courseId: number): Promise<ClassResource[]> => {
  const response = await api.get("/api/v1/resource/resources", {
    params: { course_id: courseId },
  });

  return Array.isArray(response.data) ? (response.data as ClassResource[]) : [];
};

export const uploadResource = async (
  payload: UploadClassResourcePayload
): Promise<ClassResource> => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("title", payload.title);
  formData.append("description", payload.description ?? "");
  formData.append("course_id", String(payload.courseId));
  formData.append("uploaded_by", String(payload.uploadedBy));
  formData.append("resource_type", payload.file.type || "application/octet-stream");
  formData.append("visibility", payload.visibility ?? "section");
  formData.append("tags", JSON.stringify(payload.tags ?? []));

  const response = await api.post("/api/v1/resource/resources", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data as ClassResource;
};

export const deleteResource = async (resourceId: number): Promise<void> => {
  await api.delete(`/api/v1/resource/resources/${resourceId}`);
};
