"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import httpClient from "@/lib/httpClient";

// Agar tidak double Bearer
export const ensureBearer = (raw) => {
  if (!raw) return "";
  return raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
};

// jagaan cookies
// const setCookie = (name, value, maxAgeSeconds = 60 * 60 * 24 * 7) => {
//   if (typeof document === "undefined") return;
//   const enc = encodeURIComponent(value);
//   const isHttps =
//     typeof window !== "undefined" && window.location.protocol === "https:";
//   document.cookie = `${name}=${enc}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${
//     isHttps ? "; Secure" : ""
//   }`;
// };

// const deleteCookie = (name) => {
//   if (typeof document === "undefined") return;
//   document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
// };

const initial = {
  status: "idle",            // idle | authenticating | authenticated | unauthenticated
  accessToken: null,         // simpan string "Bearer xxx" agar mudah dipakai di header
  user: null,
  error: null,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initial,

      // committers
      setStatus: (status) => set({ status }),
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      setError: (error) => set({ error }),

      // utils
      patch: (partial) => set(partial),
      reset: () => set({ ...initial }),

      // computed helpers
      isAuthenticated: () => Boolean(get().accessToken),
    }),
    {
      name: "auth",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
      }),
    }
  )
);

