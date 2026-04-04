import { useAuthStore } from "@/store/auth.store";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return {
    user,
    token,
    refreshToken,
    isHydrated,
    setAuth,
    setUser,
    setToken,
    setRefreshToken,
    clearAuth,
  };
};
