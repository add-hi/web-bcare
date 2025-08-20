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

const mapTicket = (raw) => {
  return {
    id: raw?.ticket_id,
    ticket_number: raw?.ticket_number ?? "",
    description: raw?.comment || raw?.description || "",
    customerName: "-",
    createdAt: raw?.created_time ? new Date(raw.created_time).toISOString().slice(0, 10) : "",
    rating: null,
    status: STATUS_MAP[raw?.employee_status_id] ?? "open",
    category: "service",
    assignedTo: raw?.responsible_employee_id,
    amount: raw?.amount,
    priority_id: raw?.priority_id,
  };
};

export default function useTickets() {
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const { status, items, error, setStatus, setItems, setError, reset } = useFeedbackStore();

  const fetchAll = useCallback(async () => {
    setError(null);
    setStatus("loading");
    
    try {
      const response = await httpClient.get("/v1/ticket", {
        headers: isAuthenticated() ? { Authorization: accessToken } : {},
      });
      
      const list = response.data ?? [];
      
      if (list.length === 0) {
        setItems([]);
        setStatus("success");
        return [];
      }
      
      const mapped = list.map(mapTicket);
      setItems(mapped);
      setStatus("success");
      return mapped;
    } catch (e) {
      setStatus("error");
      setError(e?.response?.data?.message || e?.message || "Gagal memuat tiket");
      return [];
    }
  }, [accessToken, isAuthenticated, setStatus, setItems, setError]);

  return useMemo(
    () => ({ status, items, error, fetchAll, reset }),
    [status, items, error, fetchAll, reset]
  );
}