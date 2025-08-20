"use client";
import { create } from "zustand";

const initial = {
  // Customer data
  customerData: null,
  searchContext: null,
  inputType: "",
  
  // Form data
  dataFormData: {},
  actionFormData: {},
  notesFormData: {},
  
  // API data
  channels: [],
  categories: [],
  allCategories: [],
  policies: [],
  sources: [],
  terminals: [],
  priorities: [],
  uics: [],
  employees: [],
  roles: [],
  
  // Loading states
  loadingData: false,
  
  // Current user
  currentEmployee: null,
  currentRole: null,
};

const useAddComplaintStore = create((set, get) => ({
  ...initial,

  // Customer actions
  setCustomerData: (customerData, searchContext, inputType) => 
    set({ customerData, searchContext, inputType }),

  // Form data actions
  setDataFormData: (dataFormData) => set({ dataFormData }),
  setActionFormData: (actionFormData) => set({ actionFormData }),
  setNotesFormData: (notesFormData) => set({ notesFormData }),

  // API data actions
  setChannels: (channels) => set({ channels }),
  setCategories: (categories) => set({ categories }),
  setAllCategories: (allCategories) => set({ allCategories }),
  setPolicies: (policies) => set({ policies }),
  setSources: (sources) => set({ sources }),
  setTerminals: (terminals) => set({ terminals }),
  setPriorities: (priorities) => set({ priorities }),
  setUics: (uics) => set({ uics }),
  setEmployees: (employees) => set({ employees }),
  setRoles: (roles) => set({ roles }),

  // Loading actions
  setLoadingData: (loadingData) => set({ loadingData }),

  // Current user actions
  setCurrentEmployee: (currentEmployee) => set({ currentEmployee }),
  setCurrentRole: (currentRole) => set({ currentRole }),

  // Reset action
  reset: () => set({ ...initial }),
}));

export default useAddComplaintStore;