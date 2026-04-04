import { useEffect } from "react";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { normalizeAuthUser, useAuthStore } from "@/store/auth.store";

const fetchCurrentUser = async () => {
  const response = await api.get("/api/v1/general/validate-token");

  const rawUser = response.data?.user || response.data?.userData || response.data?.data?.user;
  const user = normalizeAuthUser(rawUser);

  if (!user) {
    throw new Error("Unable to normalize user payload from validate-token");
  }

  return user;
};

export const useCurrentUser = () => {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  useEffect(() => {
    if (!query.isError) return;

    const error = query.error as AxiosError | Error;
    const status = (error as AxiosError).response?.status;

    if (status === 401) {
      clearAuth();
    }
  }, [clearAuth, query.error, query.isError]);

  return query;
};
