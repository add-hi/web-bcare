"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initial = {
    list: [],
    pagination: { limit: 10, offset: 0, total: 0, pages: 0 },
    loadingList: false,
    errorList: null,
};

const useEscalatedTicketStore = create(
    persist(
        (set, get) => ({
            ...initial,

            setListLoading: (loadingList) => set({ loadingList }),
            setListError: (errorList) => set({ errorList }),
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
        { name: "escalated-ticket" }
    )
);

export default useEscalatedTicketStore;