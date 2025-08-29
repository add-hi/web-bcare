// src/store/userStore.js
"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const ensureBearer = (raw) => {
  if (!raw) return "";
  return raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
};

const initialState = {
  status: "idle",
  user: null,
  accessToken: null,   // IN-MEMORY ONLY (tidak dipersist)
  refreshToken: null,  // IN-MEMORY ONLY (tidak dipersist)
  tokenType: "Bearer",
  error: null,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      setStatus: (status) => set({ status }),
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (rt) => set({ refreshToken: rt }),
      setTokenType: (tt) => set({ tokenType: tt }),
      setError: (error) => set({ error }),
      reset: () => set({ ...initialState, status: "unauthenticated" }),
      isAuthenticated: () => !!get().accessToken && !!get().user,
    }),
    {
      name: "auth",                // key storage
      version: 5,
      // ⬇️ pakai sessionStorage biar window-nya pendek
      storage: createJSONStorage(() => sessionStorage),
      // ⬇️ hanya persist data user minimal
      partialize: (s) => ({ user: s.user }),
      migrate: (persisted) => {
        if (persisted) {
          // hapus jejak lama jika sebelumnya menyimpan email/npp/id/token
          delete persisted.accessToken;
          delete persisted.refreshToken;
          if (persisted.user) {
            const u = persisted.user;
            persisted.user = {
              full_name: u.full_name,
              role_code: u.role_code,
              division_code: u.division_code,
            };
          }
        }
        return persisted ?? {};
      },
    }
  )
);
