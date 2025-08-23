"use client";
import { useCallback, useMemo } from "react";
import httpClient from "@/lib/httpClient";
import useEscalatedTicketStore from "@/store/escalatedTicketStore";

function getAccessToken() {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    const token = parsed?.state?.accessToken || "";
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  } catch {
    return "";
  }
}

export default function useEscalatedTicket() {
  const {
    list,
    pagination,
    loadingList,
    errorList,
    setListLoading,
    setListError,
    setTickets,
    setPagination,
  } = useEscalatedTicketStore();

  const BASE = useMemo(
    () =>
      (
        process.env.NEXT_PUBLIC_TICKET_API_BASE_URL || "https://bcare.my.id"
      ).replace(/\/$/, ""),
    []
  );

  const fetchEscalatedTickets = useCallback(
    async ({ limit = 10, offset = 0, force = false } = {}) => {
      // For client-side pagination, we only need to fetch once
      const hasData = list.length > 0;
      
      if (!force && hasData) {
        console.log('Using cached escalated ticket data');
        return; // Use cached data
      }

      setListLoading(true);
      setListError(null);
      try {
        const Authorization = getAccessToken();
        if (!Authorization)
          throw new Error("Token tidak ditemukan. Silakan login ulang.");

        // Fetch ALL tickets first (large limit to get everything)
        const res = await httpClient.get("/v1/tickets", {
          baseURL: BASE,
          params: { limit: 1000, offset: 0 }, // Get all tickets
          headers: {
            Accept: "application/json",
            Authorization,
            "ngrok-skip-browser-warning": "true",
          },
        });

        const payload = res?.data;
        if (!payload?.success)
          throw new Error(payload?.message || "Gagal mengambil tiket");

        // Filter for escalated tickets only (employee_status_id: 3)
        const allTickets = payload.data || [];
        const escalatedTickets = allTickets.filter((t) => 
          t?.employee_status?.employee_status_id === 3
        );

        // Store all escalated tickets (client-side pagination will handle display)
        setTickets(escalatedTickets);
        setPagination({
          limit: limit,
          offset: 0,
          total: escalatedTickets.length, // Total escalated tickets
          pages: Math.ceil(escalatedTickets.length / limit),
        });
      } catch (e) {
        setListError(
          e?.response?.data?.message ||
            e?.message ||
            "Terjadi kesalahan saat mengambil tiket"
        );
      } finally {
        setListLoading(false);
      }
    },
    [BASE, setListLoading, setListError, setTickets, setPagination, list]
  );

  const refreshEscalatedTickets = useCallback(
    async ({ limit = 10, offset = 0 } = {}) => {
      return fetchEscalatedTickets({ limit, offset, force: true });
    },
    [fetchEscalatedTickets]
  );

  return {
    list,
    pagination,
    loading: loadingList,
    error: errorList,
    fetchEscalatedTickets,
    refreshEscalatedTickets,
    hasData: list.length > 0,
  };
}