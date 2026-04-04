import axios from "axios";
import api from "@/api/axios";
import { domain } from "@/lib/constant";
import { AuthRole, normalizeAuthUser, useAuthStore } from "@/store/auth.store";

interface LoginResult {
  accessToken: string;
  refreshToken: string | null;
  user: NonNullable<ReturnType<typeof normalizeAuthUser>>;
}

const normalizeLoginPayload = (payload: unknown, role: AuthRole): LoginResult => {
  const body = (payload ?? {}) as Record<string, unknown>;

  const accessToken = String(body.accessToken || body.token || "");
  const refreshToken = (body.refreshToken as string | undefined) || null;

  const candidateUser = body.user || body.userData || (body.faculty as Record<string, unknown> | undefined)?.user || null;
  let user = normalizeAuthUser(candidateUser);

  if (!user && candidateUser && typeof candidateUser === "object") {
    const userRecord = candidateUser as Record<string, unknown>;
    const userId = Number(userRecord.user_id || userRecord.id);
    const email = String(userRecord.email || "");

    if (userId && email) {
      user = {
        ...(userRecord as Record<string, unknown>),
        user_id: userId,
        email,
        role,
      };
    }
  }

  if (!accessToken || !user) {
    throw new Error("Invalid login response");
  }

  return { accessToken, refreshToken, user };
};

export const login = async (email: string, password: string, role: AuthRole) => {
  try {
    const response = await api.post("/api/v1/general/login", { email, password, role });
    const result = normalizeLoginPayload(response.data, role);

    useAuthStore.getState().setAuth(result.user, result.accessToken, result.refreshToken);
    return result;
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) {
      throw error;
    }

    const fallbackResponse = await axios.post(
      `${domain}/api/v1/${role}/login`,
      { email, password },
      { withCredentials: true }
    );

    const result = normalizeLoginPayload(fallbackResponse.data, role);
    useAuthStore.getState().setAuth(result.user, result.accessToken, result.refreshToken);
    return result;
  }
};

export const logout = async () => {
  try {
    await api.post("/api/v1/general/logout");
  } finally {
    useAuthStore.getState().clearAuth();
  }
};
