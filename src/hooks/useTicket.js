"use client";
import { useCallback, useMemo } from "react";
import httpClient from "@/lib/httpClient";
import useTicketStore from "@/store/ticketStore";

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

export default function useTicket() {
  const {
    list,
    pagination,
    loadingList,
    errorList,
    setListLoading,
    setListError,
    setTickets,
    setPagination,
  } = useTicketStore();

  const BASE = useMemo(
    () =>
      (
        process.env.NEXT_PUBLIC_API_URL
      ).replace(/\/$/, ""),
    []
  );

  const fetchTickets = useCallback(
    async ({ limit = 100, offset = 0, force = false } = {}) => {
      // Check if data already exists and matches current pagination
      const currentPagination = pagination;
      const hasData = list.length > 0;
      const sameParams = currentPagination.limit === limit && currentPagination.offset === offset;

      if (!force && hasData && sameParams) {
        console.log('Using cached ticket data');
        return; // Use cached data
      }

      setListLoading(true);
      setListError(null);
      try {
        const Authorization = getAccessToken();
        if (!Authorization)
          throw new Error("Token tidak ditemukan. Silakan login ulang.");

        const res = await httpClient.get("/v1/tickets", {
          baseURL: BASE,
          params: { limit, offset },
          headers: {
            Accept: "application/json",
            Authorization,
            "ngrok-skip-browser-warning": "true",
          },
        });

        const payload = res?.data;
        if (!payload?.success)
          throw new Error(payload?.message || "Gagal mengambil tiket");

        setTickets(payload.data || []);
        setPagination({
          limit: payload?.pagination?.limit ?? limit,
          offset: payload?.pagination?.offset ?? offset,
          total: payload?.pagination?.total ?? payload?.data?.length ?? 0,
          pages: payload?.pagination?.pages ?? 1,
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
    [BASE, setListLoading, setListError, setTickets, setPagination, list, pagination]
  );

  const updateTicket = useCallback(

    async (id, payload) => {
      if (!id) throw new Error("Ticket id tidak valid");

      const Authorization = getAccessToken();
      if (!Authorization) throw new Error("Token tidak ditemukan. Silakan login ulang.");

      const res = await httpClient.patch(`/v1/tickets/${id}`, payload, {
        baseURL: BASE,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization,
          "ngrok-skip-browser-warning": "true",
        },
      });
      return res?.data; // kembalikan respons ke pemanggil
    },
    [BASE]
  );

  return {
    list,
    pagination,
    loading: loadingList,
    error: errorList,
    fetchTickets,
    hasData: list.length > 0,
    updateTicket,
  };
}
