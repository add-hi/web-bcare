"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initial = {
    list: [],
    pagination: { limit: 10, offset: 0, total: 0, pages: 0 },
    loading: false,
    error: null,
};

const useTicketStore = create(
    persist(
        (set) => ({
            ...initial,
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),
            setTickets: (list) => set({ list }),
            setPagination: (p) =>
                set({
                    pagination: {
                        limit: Number(p?.limit ?? 10),
                        offset: Number(p?.offset ?? 0),
                        total: Number(p?.total ?? 0),
                        pages: Number(p?.pages ?? 0),
                    },
                }),
            reset: () => set({ ...initial }),
        }),
        { name: "ticket" }
    )
);

export default useTicketStore;
