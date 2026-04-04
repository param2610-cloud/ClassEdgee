import api from "@/api/axios";
import { User } from "@/interface/general";

export const getCurrentStudent = async (userId: number): Promise<User> => {
  const response = await api.get(`/api/v1/student/get-student/${userId}`);
  const payload = response.data?.data ?? response.data;

  if (!payload) {
    throw new Error("Failed to load student profile");
  }

  return payload as User;
};
