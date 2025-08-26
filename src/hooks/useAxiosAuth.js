// src/hooks/useAxiosAuth.js
"use client";

import { useEffect } from "react";
import httpClient from "@/lib/httpClient";
import { useAuthStore, ensureBearer } from "@/store/userStore";

/**
 * Interceptor Axios untuk:
 * - Inject Authorization dari store
 * - Refresh token saat 419 (atau 401) lalu retry request awal
 * - Deduplicate refresh via refreshPromise
 */

let installed = false;
let refreshPromise = null;

export default function useAxiosAuth() {
    useEffect(() => {
        if (installed) return;
        installed = true;

        // === REQUEST INTERCEPTOR ===
        const reqId = httpClient.interceptors.request.use((config) => {
            const { accessToken } = useAuthStore.getState();
            // sisipkan Authorization kalau belum ada
            if (accessToken && !config.headers?.Authorization) {
                config.headers = { ...(config.headers || {}), Authorization: accessToken };
            }
            return config;
        });

        // === RESPONSE INTERCEPTOR ===
        const resId = httpClient.interceptors.response.use(
            (res) => res,
            async (error) => {
                const status = error?.response?.status;
                const original = error?.config || {};
                const url = String(original?.url || "");
                const isRefreshCall = url.includes("/auth/refresh");

                // Tidak ada response (network error) -> lempar saja
                if (!error?.response) return Promise.reject(error);

                // Hanya tangani 419 / 401 dan bukan panggilan refresh itu sendiri
                const shouldRefresh =
                    (status === 419 || status === 401) && !original._retry && !isRefreshCall;

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
                            // Tidak bisa refresh -> logout lokal
                            reset();
                            setStatus("unauthenticated");
                            return Promise.reject(error);
                        }

                        // Lakukan refresh token
                        refreshPromise = httpClient
                            .post(
                                "/auth/refresh",
                                { refresh_token: refreshToken }
                                // Jika perlu header khusus (misal ngrok), tambahkan di sini:
                                // , { headers: { "ngrok-skip-browser-warning": "true" } }
                            )
                            .then(({ data }) => {
                                const nextAccess = ensureBearer(data?.access_token || "");
                                if (!nextAccess) throw new Error("No access_token on refresh");

                                // Simpan access token baru
                                setAccessToken(nextAccess);
                                // Jika server memberi refresh token baru, simpan juga
                                if (data?.refresh_token) setRefreshToken(data.refresh_token);

                                setStatus("authenticated");
                                return nextAccess;
                            })
                            .catch((e) => {
                                // Refresh gagal -> bersihkan session
                                const { reset, setStatus } = useAuthStore.getState();
                                reset();
                                setStatus("unauthenticated");
                                throw e;
                            })
                            .finally(() => {
                                refreshPromise = null;
                            });
                    }

                    // Tunggu refresh selesai (atau reuse promise yang sedang berjalan)
                    const newToken = await refreshPromise;

                    // Retry request awal dengan token baru
                    original.headers = { ...(original.headers || {}), Authorization: newToken };

                    // Tambah cache-buster untuk GET agar tidak di-cache
                    const method = (original.method || "get").toLowerCase();
                    if (method === "get") {
                        original.params = { ...(original.params || {}), _t: Date.now() };
                    }

                    return httpClient(original);
                } catch (e) {
                    return Promise.reject(e);
                }
            }
        );

        // Cleanup saat unmount (mis. navigasi penuh)
        return () => {
            httpClient.interceptors.request.eject(reqId);
            httpClient.interceptors.response.eject(resId);
            installed = false;
        };
    }, []);
}
