"use client";

import { useEffect } from "react";
import httpClient from "@/lib/httpClient";
import { useAuthStore, ensureBearer } from "@/store/userStore";

let installed = false;
let refreshPromise = null;

export default function useAxiosAuth() {
    useEffect(() => {
        if (installed) return;
        installed = true;

        // Inject Authorization bila ada
        const reqId = httpClient.interceptors.request.use((config) => {
            const { accessToken } = useAuthStore.getState();
            if (accessToken && !config.headers?.Authorization) {
                config.headers = { ...(config.headers || {}), Authorization: accessToken };
            }
            return config;
        });

        const resId = httpClient.interceptors.response.use(
            (res) => res,
            async (error) => {
                const status = error?.response?.status;
                const original = error?.config || {};
                const isRefresh = String(original?.url || "").includes("/auth/refresh");

                // Handle expired: 419 (atau 401 bila backend pakai itu)
                if ((status === 419 || status === 401) && !original._retry && !isRefresh) {
                    original._retry = true;

                    try {
                        if (!refreshPromise) {
                            const { refreshToken, setAccessToken, setStatus, reset } = useAuthStore.getState();
                            if (!refreshToken) {
                                reset(); setStatus("unauthenticated");
                                throw error;
                            }
                            refreshPromise = httpClient
                                .post("/auth/refresh", { refresh_token: refreshToken })
                                .then(({ data }) => {
                                    const next = ensureBearer(data?.access_token || "");
                                    if (!next) throw new Error("No access_token on refresh");
                                    setAccessToken(next);
                                    setStatus("authenticated");
                                    return next;
                                })
                                .catch((e) => {
                                    const { reset, setStatus } = useAuthStore.getState();
                                    reset(); setStatus("unauthenticated");
                                    throw e;
                                })
                                .finally(() => { refreshPromise = null; });
                        }

                        const newToken = await refreshPromise;

                        // Retry request awal dengan token baru
                        original.headers = { ...(original.headers || {}), Authorization: newToken };
                        if ((original.method || "get").toLowerCase() === "get") {
                            original.params = { ...(original.params || {}), _t: Date.now() }; // anti cache
                        }
                        return httpClient(original);
                    } catch (e) {
                        return Promise.reject(e);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            httpClient.interceptors.request.eject(reqId);
            httpClient.interceptors.response.eject(resId);
            installed = false;
        };
    }, []);
}
