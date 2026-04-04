import { useAuthStore } from "@/store/auth.store";

export const useAuth = () =>
  useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    refreshToken: state.refreshToken,
    isHydrated: state.isHydrated,
    setAuth: state.setAuth,
    setUser: state.setUser,
    setToken: state.setToken,
    setRefreshToken: state.setRefreshToken,
    clearAuth: state.clearAuth,
  }));
