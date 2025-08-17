"use client";

import { useCallback, useEffect, useMemo } from "react";
import httpClient from "@/lib/httpClient";
import { useAuthStore, ensureBearer } from "@/store/userStore";

export default function useAuth() {
  const {
    status, user, accessToken, error,
    setStatus, setUser, setAccessToken, setError, reset, isAuthenticated,
  } = useAuthStore();

  const login = useCallback(async (credentials) => {
    setError(null);
    setStatus("authenticating");
    try {
      // lewat /api proxy -> tidak kena CORS
      const { data } = await httpClient.post("/v1/auth/login/employee", credentials);

      const token = ensureBearer(data?.access_token || "");
      if (!token) throw new Error("Token tidak ditemukan di response login");

      setAccessToken(token);
      setUser(data?.data ?? null);
      setStatus("authenticated");
      return data;
    } catch (e) {
      setStatus("unauthenticated");
      setError(e?.response?.data?.message || e?.message || "Gagal login");
      throw e;
    }
  }, [setAccessToken, setUser, setStatus, setError]);

  const fetchMe = useCallback(async () => {
    if (!isAuthenticated()) return null;
    try {
      const { data } = await httpClient.get("/v1/users/me", {
        headers: { Authorization: accessToken },
      });
      setUser(data ?? null);
      return data;
    } catch (e) {
      // jika token invalid, paksa logout ringan
      reset();
      setStatus("unauthenticated");
      return null;
    }
  }, [accessToken, isAuthenticated, setUser, reset, setStatus]);

  const initialize = useCallback(async () => {
    if (isAuthenticated() && !user) {
      await fetchMe();
      setStatus("authenticated");
    } else if (!isAuthenticated()) {
      setStatus("unauthenticated");
    }
  }, [isAuthenticated, user, fetchMe, setStatus]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const logout = useCallback(() => {
    reset();
    setStatus("unauthenticated");
  }, [reset, setStatus]);

  return useMemo(() => ({
    status,
    user,
    accessToken,
    isAuthenticated: isAuthenticated(),
    login,
    logout,
    initialize,
    fetchMe,
    error,
  }), [status, user, accessToken, isAuthenticated, login, logout, initialize, fetchMe, error]);

}
