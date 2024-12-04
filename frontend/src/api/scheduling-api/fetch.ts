import { domain } from "@/lib/constant";
import axios from "axios";

 const fetchSubjects = async (departmentId: number, semester: number) => {
    try {
      const response = await axios.get(`${domain}/api/v1/mannual-schedule/subjects`, {
        params: { departmentId, semester }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  };
  
   const fetchRooms = async (slotId: number, buildingId?: number) => {
    try {
      const response = await axios.get(`${domain}/api/v1/mannual-schedule/rooms`, {
        params: { slotId, buildingId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  };
  const fetchFaculty = async (subjectId: number, slotId: number) => {
    try {
      const response = await axios.get(`${domain}/api/v1/schedule/faculty`, {
        params: { subjectId, slotId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching faculty:', error);
      return [];
    }
  };
  const fetchListofSection = async () => {
    try {
      const response = await axios.get(`${domain}/api/v1/section/list-of-section`);
      return response.data;
    } catch (error) {
      console.error('Error fetching faculty:', error);
      return [];
    }
  }
   export { fetchSubjects, fetchRooms, fetchFaculty,fetchListofSection };