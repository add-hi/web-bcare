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
  isDataFetched: false,        // ← ADD THIS
  isUserFetched: false, 
  
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

  // Reset action - preserve dropdown data and current user
  reset: () => set((state) => ({
    ...initial,
    // Preserve dropdown data
    channels: state.channels,
    categories: state.categories,
    allCategories: state.allCategories,
    policies: state.policies,
    sources: state.sources,
    terminals: state.terminals,
    priorities: state.priorities,
    uics: state.uics,
    employees: state.employees,
    roles: state.roles,
    // Preserve current user
    currentEmployee: state.currentEmployee,
    currentRole: state.currentRole,
    loadingData: state.loadingData
  })),
}));

export default useAddComplaintStore;