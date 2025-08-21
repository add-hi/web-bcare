// src/hooks/useUser.js
"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import httpClient from "@/lib/httpClient";
import { useAuthStore, ensureBearer } from "@/store/userStore";
import { extractUserFromToken } from "@/lib/jwtUtils";

/**
 * Auth hook – NO cookies.
 * All auth state is held in the zustand store (persisted via localStorage).
 * Middleware is now a pass-through; pages/Layouts should guard using this hook.
 */
export default function useUser() {
  const {
    status,
    user,
    accessToken,
    refreshToken,
    expiresAt,
    error,
    setStatus,
    setUser,
    setAccessToken,
    setRefreshToken,
    setTokenType,
    setExpiresAt,
    setError,
    reset,
    isAuthenticated,
  } = useAuthStore();

  // one timer across the lifetime of this hook instance
  const refreshTimerRef = useRef(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const doLocalLogout = useCallback(() => {
    clearRefreshTimer();
    reset();
    setStatus("unauthenticated");
  }, [clearRefreshTimer, reset, setStatus]);

  const scheduleRefresh = useCallback(
    (expiresInSec) => {
      clearRefreshTimer();
      if (!expiresInSec || expiresInSec <= 0 || !refreshToken) return;

      // refresh ~60s before expiry (never less than 5s)
      const fireInMs = Math.max((expiresInSec - 60) * 1000, 5000);
      refreshTimerRef.current = setTimeout(() => {
        refreshAccessToken().catch(() => {
          // if refresh fails, force logout locally
          doLocalLogout();
        });
      }, fireInMs);
    },
    [clearRefreshTimer, refreshToken, doLocalLogout] // include doLocalLogout
  );

  /** POST /auth/login/employee */
  const login = useCallback(
    async ({ npp, password }) => {
      setError(null);
      setStatus("authenticating");
      try {
        const { data } = await httpClient.post("/auth/login/employee", {
          npp,
          password,
        });

        const access = ensureBearer(data?.access_token || "");
        if (!access) throw new Error(data?.message || "No access_token");

        const refresh = data?.refresh_token || null;
        const tokenType = data?.token_type || "Bearer";
        const expiresIn = Number(data?.expires_in || 0);
        const apiUser = data?.data ?? null;
        const tokenUser = extractUserFromToken(access);
        
        // Merge API user data with JWT token data
        const me = {
          ...tokenUser, // JWT data (includes npp, id, role_id, etc.)
          ...apiUser,   // API data (includes full_name, role description)
        };

        // store
        setAccessToken(access);
        setRefreshToken(refresh);
        setTokenType(tokenType);
        setUser(me);

        // compute & persist expiry
        const now = Date.now();
        const expAt = expiresIn ? now + expiresIn * 1000 : null;
        setExpiresAt(expAt);

        // schedule silent refresh
        if (refresh && expiresIn) scheduleRefresh(expiresIn);

        setStatus("authenticated");
        return data; // caller decides post-login routing
      } catch (e) {
        setStatus("unauthenticated");
        const msg = e?.response?.data?.message || e?.message || "Login failed";
        setError(msg);
        throw new Error(msg);
      }
    },
    [
      setError,
      setStatus,
      setAccessToken,
      setRefreshToken,
      setTokenType,
      setUser,
      setExpiresAt,
      scheduleRefresh,
    ]
  );

  /** GET /auth/me */
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
      // token bad/expired/etc.
      doLocalLogout();
      return null;
    }
  }, [isAuthenticated, accessToken, setUser, doLocalLogout]);

  /** POST /auth/refresh */
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) throw new Error("No refresh token");
    try {
      const { data } = await httpClient.post("/auth/refresh", {
        refresh_token: refreshToken,
      });

      const access = ensureBearer(data?.access_token || "");
      if (!access) throw new Error(data?.message || "No access_token");

      const tokenType = data?.token_type || "Bearer";
      const expiresIn = Number(data?.expires_in || 0);

      setAccessToken(access);
      setTokenType(tokenType);

      const now = Date.now();
      const expAt = expiresIn ? now + expiresIn * 1000 : null;
      setExpiresAt(expAt);

      if (expiresIn) scheduleRefresh(expiresIn);

      return access;
    } catch (e) {
      // propagate—caller will decide to logout
      throw e;
    }
  }, [
    refreshToken,
    setAccessToken,
    setTokenType,
    setExpiresAt,
    scheduleRefresh,
  ]);

  /** POST /auth/logout + local cleanup */
  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await httpClient.post("/auth/logout", null, {
          headers: { Authorization: accessToken },
        });
      }
    } catch {
      // ignore network/API errors on logout
    } finally {
      doLocalLogout();
    }
  }, [accessToken, doLocalLogout]);

  /** Rehydrate on mount / page refresh */
  const initialize = useCallback(() => {
    if (isAuthenticated()) {
      setStatus("authenticated");

      // reschedule refresh from persisted expiresAt
      if (expiresAt && refreshToken) {
        const msLeft = expiresAt - Date.now();
        if (msLeft > 70_000) {
          scheduleRefresh(Math.floor(msLeft / 1000));
        } else {
          // try immediate refresh to extend session
          refreshAccessToken().catch(() => doLocalLogout());
        }
      }

      // hydrate user if missing
      if (!user) {
        fetchMe().catch(() => {});
      }
    } else {
      setStatus("unauthenticated");
    }
  }, [
    isAuthenticated,
    user,
    fetchMe,
    expiresAt,
    refreshToken,
    scheduleRefresh,
    refreshAccessToken,
    doLocalLogout,
    setStatus,
  ]);

  useEffect(() => {
    initialize();
    return () => clearRefreshTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract user from token if user data is missing but token exists
  const effectiveUser = useMemo(() => {
    if (user) return user;
    if (accessToken) {
      const tokenUser = extractUserFromToken(accessToken);
      if (tokenUser) {
        // Update store with extracted user data
        setUser(tokenUser);
        return tokenUser;
      }
    }
    return null;
  }, [user, accessToken, setUser]);

  // what the app uses
  return useMemo(
    () => ({
      status,
      user: effectiveUser,
      accessToken,
      isAuthenticated: isAuthenticated(), // boolean
      login,
      logout,
      initialize,
      fetchMe,
      refreshAccessToken,
      error,
    }),
    [
      status,
      effectiveUser,
      accessToken,
      isAuthenticated,
      login,
      logout,
      initialize,
      fetchMe,
      refreshAccessToken,
      error,
    ]
  );
}
