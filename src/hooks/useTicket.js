// src/hooks/useTicket.js
"use client";

import { useEffect } from "react";
import { useTicketStore } from "@/store/ticketStore";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export default function useTicket() {
  // ensure auth headers/refresh are active on the shared axios instance
  useAxiosAuth();

  const tickets = useTicketStore((s) => s.tickets);
  const total = useTicketStore((s) => s.total);
  const page = useTicketStore((s) => s.page);
  const pageSize = useTicketStore((s) => s.pageSize);
  const sort = useTicketStore((s) => s.sort);
  const filters = useTicketStore((s) => s.filters);
  const loading = useTicketStore((s) => s.loading);
  const error = useTicketStore((s) => s.error);

  const fetchTickets = useTicketStore((s) => s.fetchTickets);
  const setPage = useTicketStore((s) => s.setPage);
  const setPageSize = useTicketStore((s) => s.setPageSize);
  const setSort = useTicketStore((s) => s.setSort);
  const setFilters = useTicketStore((s) => s.setFilters);

  // auto-load whenever inputs change
  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    sort.key,
    sort.dir,
    filters.q,
    filters.status,
    filters.priority,
    filters.channel,
  ]);

  return {
    tickets,
    total,
    page,
    pageSize,
    sort,
    filters,
    loading,
    error,
    fetchTickets,
    setPage,
    setPageSize,
    setSort,
    setFilters,
  };
}
