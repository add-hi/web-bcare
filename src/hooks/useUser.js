// src/hooks/useUser.js
"use client";
import { useCallback, useEffect, useMemo } from "react";
import httpClient from "@/lib/httpClient";
import { useAuthStore, ensureBearer } from "@/store/userStore";
import { extractUserFromToken } from "@/lib/jwtUtils";

export default function useUser() {
  const {
    status, user, accessToken, refreshToken, error,
    setStatus, setUser, setAccessToken, setRefreshToken, setTokenType,
    setError, reset, isAuthenticated,
  } = useAuthStore();

  const doLocalLogout = useCallback(() => {
    reset();
    setStatus("unauthenticated");
  }, [reset, setStatus]);

  const login = useCallback(async ({ npp, password }) => {
    setError(null);
    setStatus("authenticating");
    try {
      const { data } = await httpClient.post("/auth/login/employee", { npp, password });

      const access = ensureBearer(data?.access_token || "");
      if (!access) throw new Error(data?.message || "No access_token");

      const refresh = data?.refresh_token || null;
      const tokenType = data?.token_type || "Bearer";
      const apiUser = data?.data ?? null;
      const tokenUser = extractUserFromToken(access);

      const me = { ...tokenUser, ...apiUser };

      setAccessToken(access);
      setRefreshToken(refresh);
      setTokenType(tokenType);
      setUser(me);

      setStatus("authenticated");
      return data;
    } catch (e) {
      setStatus("unauthenticated");
      const msg = e?.response?.data?.message || e?.message || "Login failed";
      setError(msg);
      throw new Error(msg);
    }
  }, [setError, setStatus, setAccessToken, setRefreshToken, setTokenType, setUser]);

  const fetchMe = useCallback(async () => {
    if (!isAuthenticated() || !accessToken) return null;
    try {
      const { data } = await httpClient.get("/auth/me", {
        headers: { Authorization: accessToken },
      });
      const me = data?.data ?? null;
      if (me) setUser(me);
      return me;
    } catch {
      doLocalLogout();
      return null;
    }
  }, [isAuthenticated, accessToken, setUser, doLocalLogout]);

  /** POST /auth/refresh — disimpan bila ingin dipanggil manual */
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) throw new Error("No refresh token");
    const { data } = await httpClient.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    const access = ensureBearer(data?.access_token || "");
    if (!access) throw new Error(data?.message || "No access_token");
    setAccessToken(access);
    setTokenType(data?.token_type || "Bearer");
    return access;
  }, [refreshToken, setAccessToken, setTokenType]);

  /** Rehydrate on mount / page refresh */
  const initialize = useCallback(() => {
    if (isAuthenticated()) {
      setStatus("authenticated");
      if (!user) fetchMe().catch(() => { });
    } else {
      setStatus("unauthenticated");
    }
  }, [isAuthenticated, user, fetchMe, setStatus]);

  useEffect(() => {
    initialize();
    // tidak ada timer lagi, jadi tidak perlu cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveUser = useMemo(() => {
    if (user) return user;
    if (accessToken) {
      const tokenUser = extractUserFromToken(accessToken);
      if (tokenUser) {
        setUser(tokenUser);
        return tokenUser;
      }
    }
    return null;
  }, [user, accessToken, setUser]);

  return useMemo(
    () => ({
      status,
      user: effectiveUser,
      accessToken,
      isAuthenticated: isAuthenticated(),
      login,
      logout: async () => {
        try {
          if (accessToken) {
            await httpClient.post("/auth/logout", null, { headers: { Authorization: accessToken } });
          }
        } catch { }
        finally { doLocalLogout(); }
      },
      initialize,
      fetchMe,
      refreshAccessToken, // optional
      error,
    }),
    [status, effectiveUser, accessToken, isAuthenticated, login, doLocalLogout, initialize, fetchMe, refreshAccessToken, error]
  );
}
