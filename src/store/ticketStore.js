"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initial = {
    // list
    list: [],
    pagination: { limit: 10, offset: 0, total: 0, pages: 0 },
    loadingList: false,
    errorList: null,

    // detail
    selectedId: null,
    detailById: {},       // { [id]: normalizedDetail }
    loadingDetail: false,
    errorDetail: null,
};

const useTicketStore = create(
    persist(
        (set, get) => ({
            ...initial,

            // list setters
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

            // detail setters
            setSelectedId: (selectedId) => set({ selectedId }),
            setDetailLoading: (loadingDetail) => set({ loadingDetail }),
            setDetailError: (errorDetail) => set({ errorDetail }),
            upsertDetail: (id, detail) =>
                set({ detailById: { ...get().detailById, [id]: detail } }),

            reset: () => set({ ...initial }),
        }),
        { name: "ticket" }
    )
);

export default useTicketStore;
