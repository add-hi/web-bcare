// src/store/auth.js
"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import httpClient from "@/lib/httpClient";

/** Helper: normalize token so header won't become "Bearer Bearer xxx" */
export const ensureBearer = (raw) => {
  if (!raw) return "";
  return raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
};

/** Cookie helpers (dev-friendly; replace with httpOnly cookies via server route when backend is ready) */
const setCookie = (name, value, maxAgeSeconds = 60 * 60 * 24 * 7) => {
  if (typeof document === "undefined") return;
  const enc = encodeURIComponent(value);
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${name}=${enc}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${
    isHttps ? "; Secure" : ""
  }`;
};

const deleteCookie = (name) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
};

const initialState = {
  status: "idle", // 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'
  accessToken: null, // can be "Bearer xxx" or "xxx"
  user: null, // the "data" object from login response
  error: null,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      /** Derived */
      isAuthenticated: () => !!get().accessToken && !!get().user,

      /** Login with employee creds */
      login: async ({ npp, password }) => {
        set({ status: "loading", error: null });

        try {
          const res = await httpClient.post("/v1/auth/login/employee", {
            npp,
            password,
          });

          // Shape per sample:
          // { message, access_token, data: { ...profile } }
          const rawToken = res?.data?.access_token;
          const token = ensureBearer(rawToken);
          const user = res?.data?.data ?? null;

          if (!token) {
            throw new Error("No access_token in response");
          }

          set({
            accessToken: token,
            user,
            status: "authenticated",
            error: null,
          });

          // Mirror to a non-HttpOnly cookie so Next middleware can read it
          setCookie("access_token", token);

          return { token, user };
        } catch (e) {
          const msg =
            e?.response?.data?.message || e?.message || "Login failed";
          set({ status: "error", error: msg, accessToken: null, user: null });
          throw new Error(msg);
        }
      },

      /** Logout: clear state + cookies */
      logout: () => {
        set({ ...initialState, status: "unauthenticated" });
        deleteCookie("access_token");
        // also nuke persisted state
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("auth");
          } catch {}
        }
      },

      /** For rehydration edge cases */
      initialize: () => {
        const { accessToken, user } = get();
        if (accessToken && user) {
          set({ status: "authenticated" });
        } else {
          set({ status: "unauthenticated" });
        }
      },
    }),
    {
      name: "auth", // localStorage key
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);

