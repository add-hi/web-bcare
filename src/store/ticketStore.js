// src/store/ticketStore.js
"use client";

import { create } from "zustand";
import httpClient from "@/lib/httpClient";
import apiPaths from "@/lib/apiPaths";

function pick(v, keys) {
  const o = {};
  keys.forEach((k) => {
    if (v?.[k] !== undefined) o[k] = v[k];
  });
  return o;
}

// Defensive mapper so UI won’t break if backend field names differ slightly.
function mapTicket(row) {
  return {
    id: row.id ?? row.ticket_id ?? row.number ?? row.no_tiket ?? "-",
    code: row.code ?? row.ticket_code ?? row.no_tiket ?? "-",
    title: row.title ?? row.subject ?? row.category_name ?? row.category ?? "-",
    channel: row.channel ?? row.source ?? "-",
    priority: row.priority ?? row.prioritas ?? "-",
    status: row.status ?? row.state ?? "-",
    createdAt:
      row.created_at ??
      row.createdAt ??
      row.tgl_input ??
      row.created ??
      row.date ??
      null,
    customerName: row.customer_name ?? row.customerName ?? row.name ?? "-",
    raw: row,
  };
}

export const useTicketStore = create((set, get) => ({
  tickets: [],
  total: 0,
  page: 1,
  pageSize: 10,
  sort: { key: "createdAt", dir: "desc" },
  filters: { q: "" }, // free text
  loading: false,
  error: null,

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSort: (sort) => set({ sort }),
  setFilters: (patch) =>
    set({ filters: { ...get().filters, ...patch }, page: 1 }),

  async fetchTickets(extraParams = {}) {
    const { page, pageSize, filters, sort } = get();
    set({ loading: true, error: null });

    try {
      if (!apiPaths?.tickets?.list) {
        set({ loading: false, error: "apiPaths.tickets.list is undefined" });
        return;
      }

      const params = {
        page,
        per_page: pageSize,
        sort: sort.key,
        order: sort.dir,
        // add only known filters; feel free to extend
        ...(filters.q ? { q: filters.q } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.channel ? { channel: filters.channel } : {}),
        ...extraParams,
      };

      const url = apiPaths.tickets.list;
      // Helpful debug in dev
      if (process.env.NODE_ENV !== "production") {
        console.debug(
          "[tickets] GET",
          httpClient.defaults.baseURL + (url || ""),
          params
        );
      }

      const res = await httpClient.get(url, { params });
      const payload = res.data;

      // —— normalize many common API shapes ——
      let rows = [];
      if (Array.isArray(payload)) rows = payload;
      else if (Array.isArray(payload.data)) rows = payload.data;
      else if (Array.isArray(payload.items)) rows = payload.items;
      else if (Array.isArray(payload.result)) rows = payload.result;
      else if (Array.isArray(payload?.data?.items)) rows = payload.data.items;
      else if (Array.isArray(payload?.data?.rows)) rows = payload.data.rows;
      else if (Array.isArray(payload?.data?.data))
        rows = payload.data.data; // nested {data:{data:[]}}
      else if (Array.isArray(payload?.rows)) rows = payload.rows;

      const total =
        payload?.meta?.total ??
        payload?.total ??
        payload?.data?.total ??
        payload?.data?.meta?.total ??
        rows.length;

      set({
        tickets: rows.map(mapTicket),
        total,
        loading: false,
        error: null,
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message || e.message || "Failed to load tickets";
      if (process.env.NODE_ENV !== "production")
        console.error("[tickets] error:", e?.response || e);
      set({ loading: false, error: msg });
    }
  },
}));
