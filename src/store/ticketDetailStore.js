"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initial = { detail: null, loadingDetail: false, errorDetail: null };

const useTicketDetailStore = create()(
    persist(
        (set) => ({
            ...initial,
            setDetail: (detail) => set({ detail }),
            setLoadingDetail: (loadingDetail) => set({ loadingDetail }),
            setErrorDetail: (errorDetail) => set({ errorDetail }),
            clearDetail: () => set({ ...initial }),
        }),
        { name: "ticket-detail" }
    )
);

export default useTicketDetailStore;
