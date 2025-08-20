// store/customerStore.js
"use client";
import { create } from "zustand";

const useCustomerStore = create((set, get) => ({
    byId: {}, // { [id]: customerObject }
    setCustomer: (id, data) =>
        set((s) => ({ byId: { ...s.byId, [id]: data } })),
    clear: () => set({ byId: {} }),
}));

export default useCustomerStore;