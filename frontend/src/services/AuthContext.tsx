import { ReactNode, useMemo } from "react";
import { useAuthStore } from "@/store/auth.store";

interface CompatAuthContextType {
  user: ReturnType<typeof useAuthStore.getState>["user"];
  token: string | null;
  isLoading: boolean;
  logout: () => void;
  reinitializeAuth: () => void;
}

const syncLegacyTokenToStore = (key: string, value: string | null) => {
  const state = useAuthStore.getState();

  if (key === "accessToken") {
    state.setToken(value);
  }

  if (key === "refreshToken") {
    state.setRefreshToken(value);
  }
};

export const enhancedLocalStorage = {
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
    syncLegacyTokenToStore(key, value);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    syncLegacyTokenToStore(key, null);
  },
  getItem: (key: string) => localStorage.getItem(key),
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const useAuth = (): CompatAuthContextType => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMemo(
    () => ({
      user,
      token,
      isLoading: !isHydrated,
      logout: clearAuth,
      reinitializeAuth: () => undefined,
    }),
    [clearAuth, isHydrated, token, user]
  );
};
