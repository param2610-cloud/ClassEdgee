import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { domain } from "@/lib/constant";
import { useAuthStore } from "@/store/auth.store";

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: domain,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    const status = error.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/api/v1/general/refresh-token")) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const store = useAuthStore.getState();
    const refreshToken = store.refreshToken || localStorage.getItem("refreshToken");

    if (!refreshToken) {
      store.clearAuth();
      return Promise.reject(error);
    }

    try {
      const refreshResponse = await axios.post(
        `${domain}/api/v1/general/refresh-token`,
        { refreshToken },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      const nextAccessToken = refreshResponse.data?.accessToken as string | undefined;
      const nextRefreshToken = (refreshResponse.data?.refreshToken as string | undefined) || refreshToken;

      if (!nextAccessToken) {
        throw new Error("Access token missing in refresh response");
      }

      store.setToken(nextAccessToken);
      store.setRefreshToken(nextRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      store.clearAuth();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
