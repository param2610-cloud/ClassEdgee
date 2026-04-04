import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AuthRole = "admin" | "coordinator" | "faculty" | "student";

export interface AuthUser {
  user_id: number;
  email: string;
  role: AuthRole;
  institution_id?: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  profile_picture?: string;
  [key: string]: unknown;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setAuth: (user: AuthUser, token: string, refreshToken?: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  clearAuth: () => void;
  setHydrated: (isHydrated: boolean) => void;
}

const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

export const normalizeAuthUser = (rawUser: unknown): AuthUser | null => {
  if (!rawUser || typeof rawUser !== "object") return null;

  const user = rawUser as Record<string, unknown>;
  const role = String(user.role || "").toLowerCase() as AuthRole;
  const userId = Number(user.user_id);
  const email = String(user.email || "");

  if (!userId || !email || !role) return null;
  if (!["admin", "coordinator", "faculty", "student"].includes(role)) return null;

  const firstName = typeof user.first_name === "string" ? user.first_name : undefined;
  const lastName = typeof user.last_name === "string" ? user.last_name : undefined;
  const fullName = typeof user.name === "string" ? user.name : [firstName, lastName].filter(Boolean).join(" ") || undefined;

  return {
    ...(user as Record<string, unknown>),
    user_id: userId,
    email,
    role,
    institution_id: user.institution_id ? Number(user.institution_id) : undefined,
    first_name: firstName,
    last_name: lastName,
    name: fullName,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isHydrated: false,
      setAuth: (user, token, refreshToken) => {
        safeStorage.setItem("accessToken", token);
        if (refreshToken) {
          safeStorage.setItem("refreshToken", refreshToken);
        }
        if (user.institution_id) {
          safeStorage.setItem("institution_id", String(user.institution_id));
        }

        set({ user, token, refreshToken: refreshToken ?? null });
      },
      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (token) {
          safeStorage.setItem("accessToken", token);
        } else {
          safeStorage.removeItem("accessToken");
        }
        set({ token });
      },
      setRefreshToken: (refreshToken) => {
        if (refreshToken) {
          safeStorage.setItem("refreshToken", refreshToken);
        } else {
          safeStorage.removeItem("refreshToken");
        }
        set({ refreshToken });
      },
      clearAuth: () => {
        safeStorage.removeItem("accessToken");
        safeStorage.removeItem("refreshToken");
        set({ user: null, token: null, refreshToken: null });
      },
      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: "classedgee-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
