// hooks/useCustomer.js
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import httpClient from "@/lib/httpClient";
// (opsional) kalau pakai store cache, aktifkan import di bawah:
// import useCustomerStore from "@/store/customerStore";

function getAccessToken() {
    if (typeof window === "undefined") return "";
    try {
        const raw = localStorage.getItem("auth");
        if (raw) {
            const parsed = JSON.parse(raw);
            let t = parsed?.state?.accessToken || "";
            if (t && !/^Bearer\s/i.test(t)) t = `Bearer ${t}`;
            return t || "";
        }
    } catch { }
    return "";
}

export default function useCustomer(customerId) {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(Boolean(customerId));
    const [error, setError] = useState(null);

    const BASE = useMemo(() => {
        const v =
            process.env.NEXT_PUBLIC_API_URL;
        return v.replace(/\/$/, "");
    }, []);

    const fetchCustomer = useCallback(async (id) => {
        if (!id) return;
        setLoading(true);
        setError(null);
        const Authorization = getAccessToken();

        try {
            if (!Authorization) throw new Error("Token tidak ditemukan. Silakan login ulang.");

            const res = await httpClient.get(`/v1/customers/${id}`, {
                baseURL: BASE,
                headers: {
                    Accept: "application/json",
                    Authorization,
                    "ngrok-skip-browser-warning": "true",
                },
            });

            const payload = res?.data;
            if (!payload?.success) {
                throw new Error(payload?.message || "Gagal mengambil customer");
            }
            const detail = payload.data || null;
            setCustomer(detail);

            // (opsional) simpan ke store cache
            // useCustomerStore.getState().setCustomer(id, detail);
        } catch (e) {
            setError(
                e?.response?.data?.message || e?.message || "Gagal mengambil customer"
            );
        } finally {
            setLoading(false);
        }
    }, [BASE]);

    useEffect(() => {
        if (!customerId) return;
        // (opsional) cek cache store lebih dulu:
        // const cached = useCustomerStore.getState().byId[customerId];
        // if (cached) { setCustomer(cached); setLoading(false); return; }

        fetchCustomer(customerId);
    }, [customerId, fetchCustomer]);

    return { customer, loading, error, refetch: () => fetchCustomer(customerId) };
}
