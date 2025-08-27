"use client";
import { useCallback } from "react";
import useUser from "@/hooks/useUser";
import httpClient from "@/lib/httpClient";
import toast from "react-hot-toast";

export default function useTicketNotes() {
  const { user, accessToken } = useUser();

  const addNoteToTicket = useCallback(async (ticketId, noteText) => {
    if (!accessToken || !ticketId || !noteText.trim()) {
      throw new Error("Missing required parameters");
    }

    try {
      const authorName = user?.full_name || user?.name || user?.email || "Unknown";
      const divisionName = user?.role_details?.role_name || user?.role || "Unknown";
      
      const noteObject = {
        division: divisionName,
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit", 
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        msg: noteText.trim(),
        author: authorName,
      };

      // PATCH request to update ticket with new note
      const response = await httpClient.patch(`/v1/tickets/${ticketId}`, {
        division_notes: [noteObject] // Backend will append this to existing notes
      }, {
        baseURL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, ""),
        headers: { Authorization: accessToken }
      });

      toast.success("Note added successfully!");
      return response.data;
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to add note";
      toast.error(errorMsg);
      throw error;
    }
  }, [accessToken, user]);

  return {
    addNoteToTicket
  };
}