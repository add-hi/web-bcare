"use client";
import { useCallback, useMemo } from "react";
import httpClient from "@/lib/httpClient";
import { useAuthStore } from "@/store/userStore";
import { useFeedbackStore } from "@/store/feedbackStore";

const STATUS_MAP = {
  1: "open",
  2: "in-progress", 
  3: "resolved",
  4: "closed"
};

export default function useFeedback() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { status, items, error, setStatus, setItems, setError, reset } = useFeedbackStore();

  const fetchAll = useCallback(async () => {
    setError(null);
    setStatus("loading");
    
    try {
      // Fetch both feedback and tickets
      const [feedbackResponse, ticketsResponse] = await Promise.all([
        httpClient.get("/feedback", {
          headers: isAuthenticated() ? { Authorization: accessToken } : {},
        }),
        httpClient.get("/ticket", {
          headers: isAuthenticated() ? { Authorization: accessToken } : {},
        })
      ]);
      
      const feedbackList = feedbackResponse.data?.data ?? [];
      const ticketsList = ticketsResponse.data ?? [];
      
      if (feedbackList.length === 0) {
        setItems([]);
        setStatus("success");
        return [];
      }
      
      // Create ticket lookup map
      const ticketMap = {};
      ticketsList.forEach(ticket => {
        ticketMap[ticket.ticket_id] = ticket;
      });
      
      // Map feedback with ticket data
      const mapped = feedbackList.map(feedback => {
        const ticket = ticketMap[feedback.ticket?.id];
        
        return {
          id: feedback.id,
          ticket_number: feedback.ticket?.ticket_number ?? "",
          description: feedback.comment || "",
          customerName: feedback.customer?.full_name ?? "-",
          createdAt: feedback.submit_time ? new Date(feedback.submit_time).toISOString().slice(0, 10) : "",
          rating: feedback.score ?? null,
          status: STATUS_MAP[feedback.ticket?.status] ?? "open",
          category: "service",
          assignedTo: ticket?.responsible_employee_id || null,
        };
      });
      
      setItems(mapped);
      setStatus("success");
      return mapped;
    } catch (e) {
      setStatus("error");
      setError(e?.response?.data?.message || e?.message || "Gagal memuat data");
      return [];
    }
  }, [accessToken, isAuthenticated, setStatus, setItems, setError]);

  return useMemo(
    () => ({ status, items, error, fetchAll, reset }),
    [status, items, error, fetchAll, reset]
  );
}