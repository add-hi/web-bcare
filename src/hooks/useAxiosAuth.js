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

        // === REQUEST INTERCEPTOR ===
        const reqId = httpClient.interceptors.request.use((config) => {
            // console.log("[REQ]", config.method?.toUpperCase(), config.url, {
            //     hasAuthHeader: !!config.headers?.Authorization,
            // });
            const url = String(config?.url || "");
            // Jangan attach Authorization untuk login/refresh
            const isAuthCall = /\/auth\/(login|refresh)/.test(url);

            if (!isAuthCall) {
                const { accessToken } = useAuthStore.getState();
                if (accessToken) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = accessToken; // sudah "Bearer ..."
                }
            }

            // header tambahan yg kamu set
            config.headers = config.headers || {};
            if (!("ngrok-skip-browser-warning" in config.headers)) {
                config.headers["ngrok-skip-browser-warning"] = "true";
            }

            return config;
        });

        // === RESPONSE INTERCEPTOR ===
        const resId = httpClient.interceptors.response.use(
            (res) => {
                return res;
            },
            async (error) => {
                const status = error?.response?.status;
                const original = error?.config || {};
                const url = String(original?.url || "");
                const isRefreshCall = /\/auth\/refresh/.test(url);
                const isLoginCall = /\/auth\/login/.test(url);

                if (!error?.response) return Promise.reject(error);

                // Hanya tangani 401/419 (expired) untuk request biasa (bukan login/refresh)
                const shouldRefresh =
                    (status === 401 || status === 419) &&
                    !original._retry &&
                    !isLoginCall &&
                    !isRefreshCall;

                if (!shouldRefresh) {
                    return Promise.reject(error);
                }

                original._retry = true;

                try {
                    // Deduplicate refresh antar request paralel
                    if (!refreshPromise) {
                        const {
                            refreshToken,
                            setAccessToken,
                            setRefreshToken,
                            setStatus,
                            reset,
                        } = useAuthStore.getState();

                        if (!refreshToken) {
                            reset();
                            setStatus("unauthenticated");
                            return Promise.reject(error);
                        }

                        refreshPromise = httpClient
                            .post("/auth/refresh", { refresh_token: refreshToken })
                            .then(({ data }) => {
                                const nextAccess = ensureBearer(data?.access_token || "");
                                if (!nextAccess) throw new Error("No access_token on refresh");
                                setAccessToken(nextAccess);
                                if (data?.refresh_token) setRefreshToken(data.refresh_token);
                                setStatus("authenticated");
                                return nextAccess;
                            })
                            .catch((e) => {
                                const { reset, setStatus } = useAuthStore.getState();
                                reset();
                                setStatus("unauthenticated");
                                throw e;
                            })
                            .finally(() => {
                                refreshPromise = null;
                            });
                    }

                    const newToken = await refreshPromise;

                    // Retry request awal dgn token baru
                    original.headers = { ...(original.headers || {}), Authorization: newToken };

                    // Optional cache-buster untuk GET
                    const method = (original.method || "get").toLowerCase();
                    if (method === "get") {
                        const u = new URL(original.baseURL ? original.baseURL + original.url : original.url, window.location.origin);
                        u.searchParams.set("_", Date.now().toString());
                        original.url = original.baseURL ? u.pathname + u.search : u.toString();
                    }

                    return httpClient(original);
                } catch (e) {
                    return Promise.reject(e);
                }
            }
        );

        return () => {
            httpClient.interceptors.request.eject(reqId);
            httpClient.interceptors.response.eject(resId);
            installed = false;
        };
    }, []);
}
