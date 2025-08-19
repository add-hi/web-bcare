// src/store/userStore.js
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Keep helpers small and reusable
export const ensureBearer = (raw) => {
  if (!raw) return "";
  return raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
};

const initialState = {
  status: "idle", // "idle" | "loading" | "authenticating" | "authenticated" | "unauthenticated" | "error"
  user: null, // user object from /auth/login or /auth/me
  accessToken: null, // "Bearer ..." (store as returned)
  refreshToken: null, // raw refresh token
  tokenType: "Bearer",
  expiresAt: null, // epoch ms, optional
  error: null,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // setters
      setStatus: (status) => set({ status }),
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (rt) => set({ refreshToken: rt }),
      setTokenType: (tt) => set({ tokenType: tt }),
      setExpiresAt: (ts) => set({ expiresAt: ts }),
      setError: (error) => set({ error }),

      // helpers
      reset: () => set({ ...initialState, status: "unauthenticated" }),
      isAuthenticated: () => !!get().accessToken && !!get().user,
    }),
    {
      name: "auth",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        // persist only what we need across refresh
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        tokenType: s.tokenType,
        expiresAt: s.expiresAt,
      }),
    }
  )
);
