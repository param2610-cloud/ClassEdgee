import api from "@/api/axios";

const fetchSubjects = async (departmentId: number, semester: number) => {
  try {
    const response = await api.get("/api/v1/mannual-schedule/subjects", {
      params: { departmentId, semester },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }
};

const fetchRooms = async (slotId: number, buildingId?: number) => {
  try {
    const response = await api.get("/api/v1/mannual-schedule/rooms", {
      params: { slotId, buildingId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
};

const fetchFaculty = async (subjectId: number, slotId: number) => {
  try {
    const response = await api.get("/api/v1/mannual-schedule/faculty", {
      params: { subjectId, slotId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return [];
  }
};

const fetchListofSection = async () => {
  try {
    const response = await api.get("/api/v1/section/list-of-section");
    return response.data;
  } catch (error) {
    console.error("Error fetching sections:", error);
    return [];
  }
};

export { fetchSubjects, fetchRooms, fetchFaculty, fetchListofSection };
