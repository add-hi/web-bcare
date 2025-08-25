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
        process.env.NEXT_PUBLIC_API_URL
      ).replace(/\/$/, ""),
    []
  );

  const fetchEscalatedTickets = useCallback(
    async ({ limit = 10, offset = 0, force = false } = {}) => {
      setListLoading(true);
      setListError(null);
      try {
        const Authorization = getAccessToken();
        if (!Authorization)
          throw new Error("Token tidak ditemukan. Silakan login ulang.");

        // Use server-side filtering to get non-open tickets
        const res = await httpClient.get("/v1/tickets", {
          baseURL: BASE,
          params: {
            limit,
            offset,
            status: "escalated",
          },
          headers: {
            Accept: "application/json",
            Authorization,
            "ngrok-skip-browser-warning": "true",
          },
        });

        const payload = res?.data;
        if (!payload?.success)
          throw new Error(payload?.message || "Gagal mengambil tiket");

        const tickets = payload.data || [];
        const paginationData = payload.pagination || {};

        setTickets(tickets);
        setPagination({
          limit: paginationData.limit || limit,
          offset: paginationData.offset || offset,
          total: paginationData.total || tickets.length,
          pages:
            paginationData.pages ||
            Math.ceil((paginationData.total || tickets.length) / limit),
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
    [BASE, setListLoading, setListError, setTickets, setPagination]
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
