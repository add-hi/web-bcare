// src/hooks/useAxiosAuth.js
"use client";
import { useEffect } from "react";
import httpClient from "@/lib/httpClient"; // shared axios instance
import apiPaths from "@/lib/apiPaths";
import { useAuthStore } from "@/store/auth";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

function getCookie(name) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
}

function setCookie(name, value, { maxAge } = {}) {
  if (typeof document === "undefined") return;
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/"];
  if (typeof maxAge === "number") parts.push(`Max-Age=${maxAge}`);
  document.cookie = parts.join("; ");
}

let isRefreshing = false;
let refreshQueue = [];
const enqueue = (cb) => refreshQueue.push(cb);
const flushQueue = (newAccessToken) => {
  refreshQueue.forEach((cb) => cb(newAccessToken));
  refreshQueue = [];
};

export default function useAxiosAuth() {
  const logout = useAuthStore((s) => s.logout);
  const setTokens = useAuthStore((s) => s.setTokens);

  useEffect(() => {
    // Attach Authorization from cookie when missing
    const reqId = httpClient.interceptors.request.use((config) => {
      const access = getCookie(ACCESS_COOKIE); // may already include "Bearer "
      if (access && !config.headers?.Authorization) {
        config.headers = config.headers || {};
        config.headers.Authorization = access.startsWith("Bearer ")
          ? access
          : `Bearer ${access}`;
      }
      return config;
    });

    // 401 → refresh → retry
    const resId = httpClient.interceptors.response.use(
      (res) => res,
      async (error) => {
        const status = error?.response?.status;
        const original = error?.config;

        if (status === 401 && original && !original._retry) {
          original._retry = true;

          const refresh = getCookie(REFRESH_COOKIE);
          if (!refresh) {
            await logout();
            return Promise.reject(error);
          }

          if (isRefreshing) {
            return new Promise((resolve) => {
              enqueue((newAccess) => {
                if (!newAccess) return resolve(Promise.reject(error));
                original.headers = original.headers || {};
                original.headers.Authorization = newAccess;
                resolve(httpClient(original));
              });
            });
          }

          try {
            isRefreshing = true;
            const resp = await httpClient.post(apiPaths.refresh, {
              refresh_token: refresh,
            });

            const newAccess =
              resp?.data?.access_token || resp?.data?.data?.access_token;
            if (!newAccess)
              throw new Error("No access_token in refresh response");

            // ~15 min access cookie; keep refresh as-is
            setCookie(ACCESS_COOKIE, newAccess, { maxAge: 60 * 15 });
            setTokens({ access_token: newAccess, refresh_token: refresh });

            flushQueue(newAccess);
            isRefreshing = false;

            original.headers = original.headers || {};
            original.headers.Authorization = newAccess;
            return httpClient(original);
          } catch (e) {
            isRefreshing = false;
            flushQueue(null);
            await logout();
            return Promise.reject(e);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      httpClient.interceptors.request.eject(reqId);
      httpClient.interceptors.response.eject(resId);
    };
  }, [logout, setTokens]);

  // Returning the shared instance is optional; it’s the same object exported by lib/httpClient
  return httpClient;
}
