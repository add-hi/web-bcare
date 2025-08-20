"use client";
import { create } from "zustand";

const initial = {
  status: "idle", // idle | loading | success | error
  items: [],      // array feedback yang SUDAH dimapping ke shape UI
  error: null,
};

export const useFeedbackStore = create((set, get) => ({
  ...initial,

  // committers
  setStatus: (status) => set({ status }),
  setItems: (items) => set({ items }),
  setError: (error) => set({ error }),

  // helpers
  reset: () => set({ ...initial }),
}));
