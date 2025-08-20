"use client";
import { useCallback, useMemo } from "react";
import httpClient from "@/lib/httpClient";
import { useAuthStore } from "@/store/userStore";
import { useFeedbackStore } from "@/store/feedbackStore";

// mapping angka status -> label yang dipakai di UI
const STATUS_MAP = {
  1: "open",
  2: "in-progress", 
  3: "resolved",
  4: "closed"
};

const mapFeedback = (raw) => {
  return {
    id: raw?.id,
    ticket_number: raw?.ticket?.ticket_number ?? "",
    description: raw?.comment || raw?.ticket?.description || "",
    customerName: raw?.customer?.full_name ?? "-",
    createdAt: raw?.submit_time ? new Date(raw.submit_time).toISOString().slice(0, 10) : "",
    rating: raw?.score ?? null,
    status: STATUS_MAP[raw?.ticket?.status] ?? "open",
    category: "service",
    assignedTo: null,
  };
};

export default function useFeedback() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { status, items, error, setStatus, setItems, setError, reset } =
    useFeedbackStore();

  const fetchAll = useCallback(async () => {
    setError(null);
    setStatus("loading");
    
    try {
      const response = await httpClient.get("/feedback", {
        headers: isAuthenticated() ? { Authorization: accessToken } : {},
      });
      
      // API response structure: { success, message, data: [...] }
      const list = response.data?.data ?? [];
      
      if (list.length === 0) {
        setItems([]);
        setStatus("success");
        return [];
      }
      
      const mapped = list.map(mapFeedback);
      setItems(mapped);
      setStatus("success");
      return mapped;
    } catch (e) {
      setStatus("error");
      setError(e?.response?.data?.message || e?.message || "Gagal memuat feedback");
      return [];
    }
  }, [accessToken, isAuthenticated, setStatus, setItems, setError]);

  // (opsional) jika perlu create feedback:
  const createFeedback = useCallback(
    async (payload) => {
      setError(null);
      setStatus("loading");
      try {
        const { data } = await httpClient.post("/feedback", payload, {
          headers: isAuthenticated() ? { Authorization: accessToken } : {},
        });
        const mapped = mapFeedback(data?.data || data);
        setItems([mapped, ...useFeedbackStore.getState().items]);
        setStatus("success");
        return mapped;
      } catch (e) {
        setStatus("error");
        const msg = e?.response?.data?.message || e?.message || "Gagal membuat feedback";
        setError(msg);
        throw new Error(msg);
      }
    },
    [accessToken, isAuthenticated, setItems, setStatus, setError]
  );

  return useMemo(
    () => ({ status, items, error, fetchAll, reset, createFeedback }),
    [status, items, error, fetchAll, reset, createFeedback]
  );
}
