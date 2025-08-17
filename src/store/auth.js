// src/store/auth.js
"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import httpClient from "@/lib/httpClient";
import apiPaths from "@/lib/apiPaths"; // centralized paths

/** Ensure "Bearer " prefix exactly once */
export const ensureBearer = (raw) => {
  if (!raw) return "";
  return raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
};

/** Cookie names used by middleware & interceptors */
const ACCESS_COOKIE_NAME = "access_token";
const REFRESH_COOKIE_NAME = "refresh_token";

/** Cookie helpers; avoid Secure flag on http://localhost so middleware sees it */
const setCookie = (name, value, maxAgeSeconds = 60 * 60 * 24 * 7) => {
  if (typeof document === "undefined") return;
  const enc = encodeURIComponent(value);
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${name}=${enc}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${
    isHttps ? "; Secure" : ""
  }`;
};

// mirror the same Secure logic when deleting (so cookies are actually cleared on localhost)
const deleteCookie = (name) => {
  if (typeof document === "undefined") return;
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${
    isHttps ? "; Secure" : ""
  }`;
};

const initialState = {
  status: "idle", // 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'
  accessToken: null, // may be "Bearer ..." or raw; keep as returned
  refreshToken: null, // raw refresh token per Swagger
  tokenType: "Bearer", // default
  expiresAt: null, // epoch ms
  user: null,
  error: null,

  // internal (not persisted)
  _refreshTimeoutId: null,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      /** Derived */
      isAuthenticated: () => !!get().accessToken && !!get().user,

      /** Private: schedule silent refresh ~60s before expiry */
      _scheduleRefresh: (expiresInSec) => {
        try {
          const existing = get()._refreshTimeoutId;
          if (existing) {
            clearTimeout(existing);
            set({ _refreshTimeoutId: null });
          }
        } catch {}

        if (!expiresInSec || expiresInSec <= 0) return;

        // fire 60s before expiry; never less than 5s
        const fireInMs = Math.max((expiresInSec - 60) * 1000, 5000);
        const id = setTimeout(async () => {
          try {
            await get().refreshAccessToken();
          } catch {
            // On failure, force logout
            get().logout();
          }
        }, fireInMs);
        set({ _refreshTimeoutId: id });
      },

      /** Login with NPP + password */
      login: async ({ npp, password }) => {
        set({ status: "loading", error: null });
        try {
          const res = await httpClient.post(apiPaths.auth.loginEmployee, {
            npp,
            password,
          });
          const body = res?.data || {};

          const access = body?.access_token; // already "Bearer ..." per Swagger
          const refresh = body?.refresh_token || null;
          const tokenType = body?.token_type || "Bearer";
          const expiresIn = Number(body?.expires_in || 0);
          const user = body?.data || null;

          if (!access)
            throw new Error(body?.message || "No access_token returned");

          const now = Date.now();
          const expiresAt = expiresIn ? now + expiresIn * 1000 : null;

          set({
            accessToken: access,
            refreshToken: refresh,
            tokenType,
            expiresAt,
            user,
            status: "authenticated",
            error: null,
          });

          // Mirror to cookies so middleware & interceptors can use them
          setCookie(ACCESS_COOKIE_NAME, ensureBearer(access));
          if (refresh) setCookie(REFRESH_COOKIE_NAME, refresh);

          // schedule refresh if we have refresh token + expiresIn
          if (refresh && expiresIn) get()._scheduleRefresh(expiresIn);

          return { token: access, user };
        } catch (e) {
          const msg =
            e?.response?.data?.message || e?.message || "Login failed";
          set({
            status: "error",
            error: msg,
            accessToken: null,
            refreshToken: null,
            user: null,
          });
          throw new Error(msg);
        }
      },

      /** Fetch current user (optional to call after app start) */
      fetchMe: async () => {
        const token = ensureBearer(get().accessToken);
        const res = await httpClient.get(apiPaths.auth.me, {
          headers: token ? { Authorization: token } : {},
        });
        const data = res?.data?.data || null;
        if (data) set({ user: data });
        return data;
      },

      /** Hydrate user from /auth/me if we have a token but not user (e.g., new tab) */
      hydrateFromMe: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ status: "unauthenticated" });
          return null;
        }

        try {
          if (!get().user) set({ status: "loading" });
          const me = await get().fetchMe();
          if (me) {
            set({ user: me, status: "authenticated" });
          } else {
            set({ status: "unauthenticated", user: null });
          }
          return me;
        } catch {
          set({
            status: "unauthenticated",
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          return null;
        }
      },

      /** Refresh access token with refresh_token */
      refreshAccessToken: async () => {
        const rt = get().refreshToken;
        if (!rt) throw new Error("No refresh token");
        const res = await httpClient.post(apiPaths.auth.refresh, {
          refresh_token: rt,
        });
        const body = res?.data || {};
        const access = body?.access_token;
        const tokenType = body?.token_type || "Bearer";
        const expiresIn = Number(body?.expires_in || 0);
        if (!access) throw new Error(body?.message || "No new access_token");

        const now = Date.now();
        const expiresAt = expiresIn ? now + expiresIn * 1000 : null;

        set({
          accessToken: access,
          tokenType,
          expiresAt,
        });

        // keep access cookie fresh (interceptors & middleware rely on it)
        setCookie(ACCESS_COOKIE_NAME, ensureBearer(access));
        if (expiresIn) get()._scheduleRefresh(expiresIn);

        return access;
      },

      /** Logout: call backend then clear */
      logout: async () => {
        try {
          const token = ensureBearer(get().accessToken);
          await httpClient.post(apiPaths.auth.logout, null, {
            headers: token ? { Authorization: token } : {},
          });
        } catch {
          // ignore network/API errors on logout
        } finally {
          // clear timer
          try {
            const id = get()._refreshTimeoutId;
            if (id) clearTimeout(id);
          } catch {}
          set({
            ...initialState,
            status: "unauthenticated",
            _refreshTimeoutId: null,
          });
          // clear cookies for both tokens
          deleteCookie(ACCESS_COOKIE_NAME);
          deleteCookie(REFRESH_COOKIE_NAME);
          if (typeof window !== "undefined") {
            try {
              localStorage.removeItem("auth");
            } catch {}
          }
        }
      },

      /** Initialize auth state post-rehydration */
      initialize: () => {
        const { accessToken, user, expiresAt, refreshToken } = get();

        // If we have a token but no user (fresh tab), hydrate via /auth/me
        if (accessToken && !user) {
          set({ status: "loading" });
          get()
            .hydrateFromMe()
            .finally(() => {
              const { refreshToken: rt, expiresAt: exp } = get();
              if (exp && rt) {
                const now = Date.now();
                const remainingMs = exp - now;
                if (remainingMs > 70 * 1000) {
                  const remainingSec = Math.floor(remainingMs / 1000);
                  get()._scheduleRefresh(remainingSec);
                } else {
                  get()
                    .refreshAccessToken()
                    .catch(() => {
                      set({
                        status: "unauthenticated",
                        accessToken: null,
                        refreshToken: null,
                        user: null,
                      });
                      deleteCookie(ACCESS_COOKIE_NAME);
                      deleteCookie(REFRESH_COOKIE_NAME);
                    });
                }
              }
            });
          return;
        }

        // Original behavior when both token & user already exist
        if (accessToken && user) {
          set({ status: "authenticated" });
          if (expiresAt && refreshToken) {
            const now = Date.now();
            const remainingMs = expiresAt - now;
            if (remainingMs > 70 * 1000) {
              const remainingSec = Math.floor(remainingMs / 1000);
              get()._scheduleRefresh(remainingSec);
            } else {
              get()
                .refreshAccessToken()
                .catch(() => {
                  set({
                    status: "unauthenticated",
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                  });
                  deleteCookie(ACCESS_COOKIE_NAME);
                  deleteCookie(REFRESH_COOKIE_NAME);
                });
            }
          }
        } else {
          set({ status: "unauthenticated" });
        }
      },
    }),
    {
      name: "auth",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenType: state.tokenType,
        expiresAt: state.expiresAt,
        user: state.user,
      }),
    }
  )
);
