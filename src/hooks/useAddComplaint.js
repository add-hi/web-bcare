"use client";
import { useCallback, useEffect } from "react";
import useAddComplaintStore from "@/store/addComplaintStore";
import toast from "react-hot-toast";

// === Single-flight guards (dipakai bareng semua komponen) ===
let dropdownOnce = null; // untuk /channel, /category, dst
let userOnce = null; // untuk /me atau /employee
let dropdownLoaded = false; // flag lokal, anti-refetch walau store tak punya isDataFetched
let userLoaded = false; // flag lokal, anti-refetch walau store tak punya isUserFetched

const isFn = (f) => typeof f === "function";

function getAccessToken() {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    const token = parsed?.state?.accessToken || "";
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  } catch {
    return "";
  }
}

function decodeNameFromJWT(bearer) {
  try {
    const token = bearer.replace(/^Bearer\s+/i, "");
    const [h, p] = token.split(".");
    if (!p) return "";
    const b64 = p.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const payload = JSON.parse(atob(b64 + pad));
    return payload.full_name || payload.name || payload.username || "";
  } catch {
    return "";
  }
}

// export default function useAddComplaint() {
//   const store = useAddComplaintStore();
//   const {
//     // State
//     customerData, searchContext, inputType,
//     dataFormData, actionFormData, notesFormData,
//     channels, categories, allCategories, policies, sources, terminals, priorities, uics,
//     employees, roles, currentEmployee, currentRole,
//     loadingData, isDataFetched, isUserFetched,

//     // Actions
//     setCustomerData, setDataFormData, setActionFormData, setNotesFormData,
//     setChannels, setCategories, setAllCategories, setPolicies, setSources,
//     setTerminals, setPriorities, setUics, setEmployees, setRoles,
//     setCurrentEmployee, setCurrentRole, setLoadingData, reset,
//     setIsDataFetched, setIsUserFetched

//   } = store;

export default function useAddComplaint() {
  const store = useAddComplaintStore();
  const {
    // State
    customerData,
    searchContext,
    inputType,
    dataFormData,
    actionFormData,
    notesFormData,
    channels,
    categories,
    allCategories,
    policies,
    sources,
    terminals,
    priorities,
    uics,
    employees,
    roles,
    currentEmployee,
    currentRole,
    loadingData,
    isDataFetched,
    isUserFetched,

    // Actions
    setCustomerData,
    setDataFormData,
    setActionFormData,
    setNotesFormData,
    setChannels,
    setCategories,
    setAllCategories,
    setPolicies,
    setSources,
    setTerminals,
    setPriorities,
    setUics,
    setEmployees,
    setRoles,
    setCurrentEmployee,
    setCurrentRole,
    setLoadingData,
    setIsDataFetched,
    setIsUserFetched,
    reset,
  } = store;

  const get = () => store;

  // Fetch specific policy for channel and category
  const fetchPolicyInfo = useCallback(async (channelId, categoryId) => {
    try {
      const Authorization = getAccessToken();
      if (!Authorization) return null;

      const headers = {
        Accept: "application/json",
        Authorization,
        "ngrok-skip-browser-warning": "true",
      };

      const response = await fetch(`/api/v1/policies?channel_id=${channelId}&complaint_id=${categoryId}&limit=1`, { headers });
      if (response.ok) {
        const policyData = await response.json();
        const policies = Array.isArray(policyData) ? policyData : policyData.data || [];
        return policies[0] || null;
      }
    } catch (error) {
      console.error('Failed to fetch policy:', error);
    }
    return null;
  }, []);

  // === DROPDOWN: sekali saja untuk semua komponen ===
  const fetchDropdownDataOnce = useCallback(async () => {
    // kalau sudah pernah sukses (flag lokal) atau store sudah tandai fetched, stop
    if (dropdownLoaded || isDataFetched) return;

    // kalau sudah ada request yang lagi jalan, re-use
    if (dropdownOnce) return dropdownOnce;

    dropdownOnce = (async () => {
      // kalau store punya setLoadingData baru dipanggil
      if (isFn(setLoadingData)) setLoadingData(true);
      try {
        const Authorization = getAccessToken();
        if (!Authorization) return;

        const headers = {
          Accept: "application/json",
          Authorization,
          "ngrok-skip-browser-warning": "true",
        };

        const [
          channelRes,
          categoryRes,
          sourceRes,
          terminalRes,
          priorityRes,
          policyRes,
          uicRes,
        ] = await Promise.all([
          fetch("/api/v1/channels", { headers }),
          fetch("/api/v1/complaint-categories", { headers }),
          fetch("/api/v1/sources", { headers }),
          fetch("/api/v1/terminals", { headers }),
          fetch("/api/v1/priorities", { headers }),
          fetch("/api/v1/policies", { headers }),
          fetch("/api/v1/uics", { headers }),
        ]);

        if (channelRes.ok) {
          const channelData = await channelRes.json();
          // Handle different response formats
          const channels = Array.isArray(channelData) ? channelData : channelData.data || [];
          setChannels(channels);
        }

        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          const cats = Array.isArray(categoryData) ? categoryData : categoryData.data || [];
          setAllCategories(cats);
          setCategories(cats);
        } else {
          // Try fallback endpoint
          try {
            const fallbackRes = await fetch("/api/v1/complaint-categories", { headers });
            if (fallbackRes.ok) {
              const categoryData = await fallbackRes.json();
              const cats = Array.isArray(categoryData) ? categoryData : categoryData.data || [];
              setAllCategories(cats);
              setCategories(cats);
            }
          } catch (error) {
            // Silent fail
          }
        }

        if (sourceRes.ok) {
          const sourceData = await sourceRes.json();
          const sources = Array.isArray(sourceData) ? sourceData : sourceData.data || [];
          setSources(sources);
        }
        if (terminalRes.ok) {
          const terminalData = await terminalRes.json();
          // Handle different response formats
          const terminals = Array.isArray(terminalData)
            ? terminalData
            : terminalData.data || [];
          setTerminals(terminals);
        }
        if (priorityRes.ok) {
          const priorityData = await priorityRes.json();
          const priorities = Array.isArray(priorityData) ? priorityData : priorityData.data || [];
          setPriorities(priorities);
        }

        if (policyRes.ok) {
          const policyData = await policyRes.json();
          setPolicies(
            Array.isArray(policyData) ? policyData : policyData.data || []
          );
        }

        if (uicRes.ok) {
          const uicData = await uicRes.json();
          setUics(uicData.data || []);
        } else {
          setUics([]);
        }

        // tandai loaded pakai flag lokal
        dropdownLoaded = true;
        // kalau store menyediakan setter, update juga (opsional)
        if (isFn(setIsDataFetched)) setIsDataFetched(true);
      } finally {
        if (isFn(setLoadingData)) setLoadingData(false);
      }
    })().catch((err) => {
      // kalau gagal, biar bisa retry
      dropdownOnce = null;
      throw err;
    });

    return dropdownOnce;
  }, [
    isDataFetched, // aman meski undefined (falsy)
    setLoadingData,
    setChannels,
    setCategories,
    setAllCategories,
    setSources,
    setTerminals,
    setPriorities,
    setPolicies,
    setUics,
  ]);

  // === USER: sekali saja untuk semua komponen ===
  const fetchCurrentUserOnce = useCallback(async () => {
    // hindari refetch: pakai flag lokal + guard store
    if (userLoaded || isUserFetched || currentEmployee) return;
    if (userOnce) return userOnce;

    userOnce = (async () => {
      const Authorization = getAccessToken();
      if (!Authorization) return;

      const headers = {
        Accept: "application/json",
        Authorization,
        "ngrok-skip-browser-warning": "true",
      };

      try {
        const meRes = await fetch("/api/v1/auth/me", { headers });
        if (meRes.ok) {
          const me = await meRes.json();
          setCurrentEmployee({
            ...me,
            full_name:
              me.full_name || me.fullName || me.name || me.username || "",
          });
          const roleName =
            me.role_details?.role_name || me.role_name || me.role || "";
          setCurrentRole({ role_name: roleName });

          userLoaded = true; // flag lokal
          if (isFn(setIsUserFetched)) setIsUserFetched(true); // opsional
          return;
        }
      } catch (_) {}

      const employeeRes = await fetch("/api/v1/employee", { headers });
      if (employeeRes.ok) {
        const employeeData = await employeeRes.json();
        const employee = Array.isArray(employeeData)
          ? employeeData[0]
          : employeeData;
        if (employee) setCurrentEmployee(employee);

        if (employee?.role_id) {
          const roleRes = await fetch("/api/v1/role", { headers });
          if (roleRes.ok) {
            const roleData = await roleRes.json();
            const role = roleData.find((r) => r.role_id === employee.role_id);
            setCurrentRole(role);
          }
        }

        userLoaded = true; // flag lokal
        if (isFn(setIsUserFetched)) setIsUserFetched(true); // opsional
      }
    })().catch((err) => {
      userOnce = null;
      throw err;
    });

    return userOnce;
  }, [
    isUserFetched,
    currentEmployee,
    setCurrentEmployee,
    setCurrentRole,
    setIsUserFetched,
  ]);

  // Filter categories based on selected channel
  const filterCategories = useCallback(
    (channelId) => {
      if (channelId && policies.length > 0 && allCategories.length > 0) {
        const allowedComplaintIds = policies
          .filter((policy) => {
            // Handle nested structure: policy.channel.channel_id
            const policyChannelId = policy.channel?.channel_id || policy.channel_id;
            return policyChannelId === Number(channelId);
          })
          .map((policy) => {
            // Handle nested structure: policy.complaint_category.complaint_id
            return policy.complaint_category?.complaint_id || policy.complaint_id;
          });

        const filteredCategories = allCategories.filter((cat) =>
          allowedComplaintIds.includes(cat.complaint_id)
        );

        return filteredCategories;
      }
      return allCategories;
    },
    [policies, allCategories]
  );

  // Update categories in store
  const updateCategories = useCallback(
    (filteredCategories) => {
      setCategories(filteredCategories);
    },
    [setCategories]
  );

  // Get UIC name based on channel and category
  const getUicName = useCallback(
    async (channelId, categoryId) => {
      if (channelId && categoryId) {
        const policy = await fetchPolicyInfo(channelId, categoryId);
        
        if (policy) {
          // Try to get UIC name from nested structure first
          const uicName = policy.uic?.division_name || policy.uic?.uic_name;
          if (uicName) {
            return uicName;
          }
          
          // Fallback to lookup in uics array
          const uicId = policy.uic?.division_id || policy.uic_id;
          if (uicId && uics.length > 0) {
            const uic = uics.find((u) => u.uic_id === uicId || u.division_id === uicId);
            return uic?.uic_name || uic?.division_name || "";
          }
          
          // Last fallback
          if (uicId) {
            return `UIC ID: ${uicId}`;
          }
        }
      }
      return "";
    },
    [fetchPolicyInfo, uics]
  );

  // Get SLA info based on channel and category
  const getSlaInfo = useCallback(
    async (channelId, categoryId) => {
      if (channelId && categoryId) {
        const policy = await fetchPolicyInfo(channelId, categoryId);
        
        if (policy) {
          return {
            slaDays: policy.sla_days || policy.sla,
            slaHours: policy.sla_hours || (policy.sla_days || policy.sla) * 24,
            description: policy.description,
          };
        }
      }
      return { slaDays: "", slaHours: "", description: "" };
    },
    [fetchPolicyInfo]
  );

  const resetAllForms = useCallback(() => {
    reset();
    window.dispatchEvent(new CustomEvent("resetAllForms"));
  }, [reset]);

  // Update ticket status after creation (workaround for backend limitation)
  const updateTicketStatus = useCallback(
    async (ticketId, statusIds, action) => {
      const Authorization = getAccessToken();
      if (!Authorization) {
        throw new Error("No authorization token for status update");
      }

      const updateData = {
        customer_status_id: statusIds.customer_status_id,
        employee_status_id: statusIds.employee_status_id,
      };

      const response = await fetch(`/api/v1/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: Authorization,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to save ticket: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();

      return result;
    },
    []
  );

  // Save ticket function
  const saveTicket = useCallback(async () => {
    // Get fresh store state
    const storeState = get();

    // Check if actionFormData exists in fresh store
    if (!storeState.actionFormData) {
      // Handle missing actionFormData
    }
    try {
      const Authorization = getAccessToken();
      if (!Authorization) {
        throw new Error("No authorization token found");
      }

      // Get policy_id based on channel and category
      const policy = policies.find(
        (p) =>
          p.channel_id === Number(dataFormData.channelId) &&
          p.complaint_id === Number(dataFormData.categoryId)
      );

      // Map action to status IDs
      const getStatusIds = (action) => {
        if (action === "ESCALATED") {
          return { customer_status_id: 3, employee_status_id: 3 };
        } else if (action === "CLOSED") {
          return { customer_status_id: 4, employee_status_id: 4 };
        }

        return { customer_status_id: 1, employee_status_id: 1 };
      };

      // Use actionFormData from hook (more reliable than store state)
      const currentActionData = actionFormData;

      const statusIds = getStatusIds(currentActionData?.action);

      // Get related account and card IDs from form input numbers
      let related_account_id = null;
      let related_card_id = null;

      // Use related_account_id from search context if available
      if (searchContext?.related_account_id) {
        related_account_id = searchContext.related_account_id;
      }

      // Use related_card_id from search context (should be the actual card ID)
      if (searchContext?.related_card_id) {
        related_card_id = searchContext.related_card_id;
      } else if (searchContext?.customerCards && searchContext.customerCards.length > 0) {
        // Use first card ID from customer cards
        related_card_id = searchContext.customerCards[0].card_id;
      } else if (customerData?.card_id) {
        // Fallback to customerData card_id if available
        related_card_id = customerData.card_id;
      }

      // Build ticket data matching exact body format

      const ticketData = {
        action: currentActionData?.action || null,
        description: dataFormData?.description || "",
        issue_channel_id: dataFormData?.channelId
          ? Number(dataFormData.channelId)
          : null,
        complaint_id: dataFormData?.categoryId
          ? Number(dataFormData.categoryId)
          : null,
        customer_id: customerData?.customer_id || null,
        transaction_date: dataFormData?.transactionDate
          ? new Date(dataFormData.transactionDate).toISOString()
          : null,
        committed_due_at: (() => {
          // Try multiple sources for committed_due_at
          const committedDue =
            dataFormData?.committedDueAt || dataFormData?.committed_due_at;

          if (committedDue) {
            return new Date(committedDue).toISOString();
          }

          // Fallback: calculate from created_time + SLA if available
          if (dataFormData?.createdTime && dataFormData?.slaDays) {
            const createdDate = new Date(dataFormData.createdTime);
            const committedDate = new Date(createdDate);
            committedDate.setDate(
              committedDate.getDate() + parseInt(dataFormData.slaDays)
            );
            committedDate.setHours(0, 0, 0, 0);
            return committedDate.toISOString();
          }

          return null;
        })(),
        amount: dataFormData?.amount && dataFormData.amount !== "" ? Number(dataFormData.amount) : null,
        record: dataFormData?.record || "",
        related_account_id: related_account_id,
        related_card_id: related_card_id,
        terminal_id: dataFormData?.terminalId && dataFormData.terminalId !== "" ? Number(dataFormData.terminalId) : null,
        intake_source_id: dataFormData?.sourceId
          ? Number(dataFormData.sourceId)
          : null,
        priority_id: dataFormData?.priorityId && dataFormData.priorityId !== "" ? Number(dataFormData.priorityId) : null,
        reason: currentActionData?.reason || "",
        solution: currentActionData?.solution || "",
      };

      // Remove fields that should not be sent to backend
      const fieldsToRemove = [
        "customer_status_id",
        "employee_status_id",
        "responsible_employee_id",
        "policy_id",
        "created_time",
        "closed_time",
      ];
      fieldsToRemove.forEach((field) => delete ticketData[field]);

      // Add division_notes in correct JSON format
      if (notesFormData?.newNote) {
        // Ensure user data is loaded
        await fetchCurrentUserOnce();
        
        const authz = getAccessToken();
        const jwtName = decodeNameFromJWT(authz);
        
        // Get fresh store state after fetch
        const freshState = get();
        
        const authorName =
          freshState.currentEmployee?.full_name ||
          freshState.currentEmployee?.name ||
          freshState.currentEmployee?.fullName ||
          jwtName ||
          "Unknown";
          
        const divisionName = 
          freshState.currentRole?.role_name ||
          freshState.currentRole?.name ||
          "Unknown";
          
        const noteObject = {
          division: divisionName,
          timestamp: new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          msg: notesFormData.newNote,
          author: authorName,
        };

        // Send as array of objects (backend expects this format)
        ticketData.division_notes = [noteObject];
      }

      // Debug: log ticket data before sending
      console.log('Ticket data to be sent:', JSON.stringify(ticketData, null, 2));
      window.debugTicketData = ticketData;

      const response = await fetch("/api/v1/tickets", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: Authorization,
          "ngrok-skip-browser-warning": "true",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(
          `Gagal membuat ticket (${response.status} ${response.statusText}).\n\n` +
            `${
              errorText?.slice(0, 500) || "Tidak ada detail error dari server."
            }`
        );
        throw new Error(
          `Failed to save ticket: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();

      // Toast sukses
      try {
        const d = result?.data ?? result ?? {};
        const ticketNumber =
          d.ticket_number ?? d.ticketNo ?? d.ticket ?? d.number ?? "-";
        const ticketId = d.ticket_id ?? d.id ?? d.ticketId ?? "-";
        toast.success(
          `Ticket Number: ${ticketNumber}\n` + `Ticket ID: ${ticketId}`
        );
      } catch (e) {
        toast.success("Ticket berhasil dibuat!");
      }

      resetAllForms();

      return result;
    } catch (error) {
      toast.error(
        `Gagal membuat ticket.\n\n${error?.message || "Unknown error"}`
      );
      throw error;
    }
  }, [
    dataFormData,
    actionFormData,
    notesFormData,
    customerData,
    currentEmployee,
    currentRole,
    policies,
    resetAllForms,
    get,
  ]);

  // useEffect(() => {
  //   fetchDropdownData();
  //   fetchCurrentUser();
  // }, [fetchDropdownData, fetchCurrentUser]);

  // useEffect(() => {
  //   if (!isDataFetched) {
  //     fetchDropdownData();
  //   }
  //   if (!isUserFetched) {
  //     fetchCurrentUser();
  //   }
  // }, []);
  useEffect(() => {
    fetchDropdownDataOnce();
    fetchCurrentUserOnce();
  }, [fetchDropdownDataOnce, fetchCurrentUserOnce]);

  // return {
  //   // State
  //   customerData, searchContext, inputType,
  //   dataFormData, actionFormData, notesFormData,
  //   channels, categories, allCategories, policies, sources, terminals, priorities, uics,
  //   currentEmployee, currentRole, loadingData,
  //    loadingData, isDataFetched, isUserFetched,
  //   // Actions
  //   setCustomerData, setDataFormData, setActionFormData, setNotesFormData,
  //   filterCategories, updateCategories, getUicName, getSlaInfo,
  //   reset, resetAllForms, saveTicket,
  //     setIsDataFetched, setIsUserFetched, reset
  // };
  return {
    // State
    customerData,
    searchContext,
    inputType,
    dataFormData,
    actionFormData,
    notesFormData,
    channels,
    categories,
    allCategories,
    policies,
    sources,
    terminals,
    priorities,
    uics,
    currentEmployee,
    currentRole,
    loadingData,

    // Actions
    setCustomerData,
    setDataFormData,
    setActionFormData,
    setNotesFormData,
    filterCategories,
    updateCategories,
    getUicName,
    getSlaInfo,
    reset,
    resetAllForms,
    saveTicket,
  };
}
