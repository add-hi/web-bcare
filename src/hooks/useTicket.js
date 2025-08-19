"use client";
import { useCallback, useMemo } from "react";
import httpClient from "@/lib/httpClient"; // tetap pakai yang kamu punya
import useTicketStore from "@/store/ticketStore";

/** Ambil token dari userStore yang dipersist di localStorage: key "auth"
 * Contoh strukturnya:
 * {"state":{"accessToken":"Bearer <jwt>", "user": {...}},"version":1}
 */
function getAccessToken() {
    try {
        const raw = localStorage.getItem("auth");
        if (!raw) return "";
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.accessToken || "";
        // sudah mengandung "Bearer " dari sisi login kamu, tapi kita amankan
        return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    } catch {
        return "";
    }
}

export default function useTicket() {
    const {
        list,
        pagination,
        loading,
        error,
        setLoading,
        setError,
        setTickets,
        setPagination,
    } = useTicketStore();

    const BASE = useMemo(() => {
        const v =
            process.env.NEXT_PUBLIC_TICKET_API_BASE_URL ||
            "https://275232686ea9.ngrok-free.app";
        return v.replace(/\/$/, "");
    }, []);

    const fetchTickets = useCallback(
        async ({ limit = 10, offset = 0 } = {}) => {
            setLoading(true);
            setError(null);
            try {
                const Authorization = getAccessToken();
                if (!Authorization) throw new Error("Token tidak ditemukan. Silakan login ulang.");

                const res = await httpClient.get("/v1/tickets", {
                    baseURL: BASE, // override baseURL agar bisa beda domain dengan auth
                    params: { limit, offset },
                    headers: {
                        Accept: "application/json",
                        Authorization,
                        "ngrok-skip-browser-warning": "true",
                    },
                });

                const payload = res?.data;
                console.log(payload);
                console.log('payload ticket');

                if (!payload?.success) {
                    throw new Error(payload?.message || "Gagal mengambil tiket");
                }

                console.log("[useTicket] raw payload:", payload);
                console.log("[useTicket] data:", payload?.data);
                console.log("[useTicket] pagination:", payload?.pagination);

                setTickets(payload.data || []);
                setPagination({
                    limit: payload?.pagination?.limit ?? limit,
                    offset: payload?.pagination?.offset ?? offset,
                    total: payload?.pagination?.total ?? (payload?.data?.length ?? 0),
                    pages: payload?.pagination?.pages ?? 1,
                });
            } catch (e) {
                setError(
                    e?.response?.data?.message ||
                    e?.message ||
                    "Terjadi kesalahan saat mengambil tiket"
                );
            } finally {
                setLoading(false);
            }
        },
        [BASE, setLoading, setError, setTickets, setPagination]
    );

    return {
        list,
        pagination,
        loading,
        error,
        fetchTickets,
    };
}
