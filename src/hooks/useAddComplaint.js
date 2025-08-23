"use client";
import { useCallback, useEffect } from "react";
import useAddComplaintStore from "@/store/addComplaintStore";


// === Single-flight guards (dipakai bareng semua komponen) ===
let dropdownOnce = null; // untuk /channel, /category, dst
let userOnce = null;     // untuk /me atau /employee
let dropdownLoaded = false; // flag lokal, anti-refetch walau store tak punya isDataFetched
let userLoaded = false;     // flag lokal, anti-refetch walau store tak punya isUserFetched

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

  // Fetch all dropdown data on mount
  // const fetchDropdownData = useCallback(async () => {
  //   if (isDataFetched || loadingData) {
  //     console.log("Skipping fetchDropdownData - already fetched or loading");
  //     return;
  //   }

  //   setLoadingData(true);
  //   try {
  //     const Authorization = getAccessToken();
  //     if (!Authorization) {
  //       console.error("No authorization token found");
  //       setLoadingData(false);
  //       return;
  //     }

  //     const headers = {
  //       Accept: "application/json",
  //       Authorization: Authorization,
  //       "ngrok-skip-browser-warning": "true",
  //     };

  //     const [
  //       channelRes,
  //       categoryRes,
  //       sourceRes,
  //       terminalRes,
  //       priorityRes,
  //       policyRes,
  //       uicRes,
  //     ] = await Promise.all([
  //       fetch("/api/v1/channel", { headers }),
  //       fetch("/api/v1/complaint_category", { headers }),
  //       fetch("/api/v1/source", { headers }),
  //       fetch("/api/v1/terminal", { headers }),
  //       fetch("/api/v1/priority", { headers }),
  //       fetch("/api/v1/complaint_policy", { headers }),
  //       fetch("/api/v1/uics", { headers }),
  //     ]);

  //     if (channelRes.ok) setChannels(await channelRes.json());
  //     if (categoryRes.ok) {
  //       const cats = await categoryRes.json();
  //       setAllCategories(cats);
  //       setCategories(cats);
  //     }
  //     if (sourceRes.ok) setSources(await sourceRes.json());
  //     if (terminalRes.ok) setTerminals(await terminalRes.json());
  //     if (priorityRes.ok) setPriorities(await priorityRes.json());
  //     if (policyRes.ok) {
  //       const policyData = await policyRes.json();
  //       setPolicies(
  //         Array.isArray(policyData) ? policyData : policyData.data || []
  //       );
  //     }
  //     if (uicRes.ok) {
  //       const uicData = await uicRes.json();
  //       setUics(uicData.data || []);
  //     } else {
  //       console.warn(
  //         "UIC API failed with status:",
  //         uicRes.status,
  //         "Continuing without UIC data"
  //       );
  //       setUics([]);
  //     }

  //     setIsDataFetched(true);
  //   } catch (error) {
  //     console.error("Error fetching dropdown data:", error);
  //   } finally {
  //     setLoadingData(false);
  //   }
  // }, [
  //   isDataFetched,
  //   loadingData,
  //   setChannels,
  //   setCategories,
  //   setAllCategories,
  //   setSources,
  //   setTerminals,
  //   setPriorities,
  //   setPolicies,
  //   setUics,
  //   setLoadingData,
  //   setIsDataFetched,
  // ]);

  // Fetch current user data
  // const fetchCurrentUser = useCallback(async () => {
  //   if (isUserFetched || currentEmployee) {
  //     return;
  //   }

  //   try {
  //     const Authorization = getAccessToken();

  //     if (!Authorization) {
  //       return;
  //     }

  //     const headers = {
  //       Accept: "application/json",
  //       Authorization: Authorization,
  //       "ngrok-skip-browser-warning": "true",
  //     };
  //       // 1) Try the profile first — usually contains the logged-in user
  //  try {
  //    const meRes = await fetch("/api/v1/me", { headers });
  //    if (meRes.ok) {
  //      const me = await meRes.json();
  //      // normalize & store
  //      const normalizedEmp = {
  //        ...me,
  //        full_name: me.full_name || me.fullName || me.name || me.username || "",
  //      };
  //      setCurrentEmployee(normalizedEmp);
  //      // role, if present
  //      const roleName =
  //        me.role_details?.role_name || me.role_name || me.role || "";
  //      setCurrentRole({ role_name: roleName });
  //      setIsUserFetched(true);
  //      return;
  //    }
  //  } catch (e) {
  //    console.warn("GET /api/v1/me failed, fallback to /employee", e);
  //  }

  //     console.log("Fetching current user data...");
  //     const employeeRes = await fetch("/api/v1/employee", { headers });
  //     if (employeeRes.ok) {
  //       const employeeData = await employeeRes.json();

  //       const employee = Array.isArray(employeeData)
  //         ? employeeData[0]
  //         : employeeData;

  //       // ✅ penting: simpan employee ke store
  //       if (employee) {
  //         setCurrentEmployee(employee);
  //       }

  //       if (employee?.role_id) {
  //         const roleRes = await fetch("/api/v1/role", { headers });
  //         if (roleRes.ok) {
  //           const roleData = await roleRes.json();
  //           const role = roleData.find((r) => r.role_id === employee.role_id);

  //           setCurrentRole(role);
  //         }
  //       }
  //       setIsUserFetched(true);
  //     } else {
  //       console.error("Failed to fetch employee data:", employeeRes.status);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching current user:", error);
  //   }
  // }, [
  //   isUserFetched,
  //   currentEmployee,
  //   setCurrentEmployee,
  //   setCurrentRole,
  //   setIsUserFetched,
  // ]);
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
        channelRes, categoryRes, sourceRes, terminalRes,
        priorityRes, policyRes, uicRes,
      ] = await Promise.all([
        fetch("/api/v1/channel", { headers }),
        fetch("/api/v1/complaint_category", { headers }),
        fetch("/api/v1/source", { headers }),
        fetch("/api/v1/terminals", { headers }),
        fetch("/api/v1/priority", { headers }),
        fetch("/api/v1/complaint_policy", { headers }),
        fetch("/api/v1/uics", { headers }),
      ]);

      if (channelRes.ok) setChannels(await channelRes.json());

      if (categoryRes.ok) {
        const cats = await categoryRes.json();
        setAllCategories(cats);
        setCategories(cats);
      }

      if (sourceRes.ok)   setSources(await sourceRes.json());
      if (terminalRes.ok) {
        const terminalData = await terminalRes.json();
        // Handle different response formats
        const terminals = Array.isArray(terminalData) ? terminalData : (terminalData.data || []);
        setTerminals(terminals);
      }
      if (priorityRes.ok) setPriorities(await priorityRes.json());

      if (policyRes.ok) {
        const policyData = await policyRes.json();
        setPolicies(Array.isArray(policyData) ? policyData : policyData.data || []);
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
  })().catch(err => {
    // kalau gagal, biar bisa retry
    dropdownOnce = null;
    throw err;
  });

  return dropdownOnce;
}, [
  isDataFetched, // aman meski undefined (falsy)
  setLoadingData,
  setChannels, setCategories, setAllCategories, setSources, setTerminals,
  setPriorities, setPolicies, setUics
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
      const meRes = await fetch("/api/v1/me", { headers });
      if (meRes.ok) {
        const me = await meRes.json();
        setCurrentEmployee({
          ...me,
          full_name: me.full_name || me.fullName || me.name || me.username || "",
        });
        const roleName = me.role_details?.role_name || me.role_name || me.role || "";
        setCurrentRole({ role_name: roleName });

        userLoaded = true;                 // flag lokal
        if (isFn(setIsUserFetched)) setIsUserFetched(true); // opsional
        return;
      }
    } catch (_) {}

    const employeeRes = await fetch("/api/v1/employee", { headers });
    if (employeeRes.ok) {
      const employeeData = await employeeRes.json();
      const employee = Array.isArray(employeeData) ? employeeData[0] : employeeData;
      if (employee) setCurrentEmployee(employee);

      if (employee?.role_id) {
        const roleRes = await fetch("/api/v1/role", { headers });
        if (roleRes.ok) {
          const roleData = await roleRes.json();
          const role = roleData.find(r => r.role_id === employee.role_id);
          setCurrentRole(role);
        }
      }

      userLoaded = true;                 // flag lokal
      if (isFn(setIsUserFetched)) setIsUserFetched(true); // opsional
    }
  })().catch(err => {
    userOnce = null;
    throw err;
  });

  return userOnce;
}, [isUserFetched, currentEmployee, setCurrentEmployee, setCurrentRole, setIsUserFetched]);


  // Filter categories based on selected channel
  const filterCategories = useCallback(
    (channelId) => {
      if (channelId && policies.length > 0 && allCategories.length > 0) {
        const allowedComplaintIds = policies
          .filter((policy) => policy.channel_id === Number(channelId))
          .map((policy) => policy.complaint_id);

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
    (channelId, categoryId) => {
      if (channelId && categoryId && policies.length > 0) {
        const policy = policies.find(
          (p) =>
            p.channel_id === Number(channelId) &&
            p.complaint_id === Number(categoryId)
        );

        if (policy && policy.uic_id) {
          if (uics.length > 0) {
            const uic = uics.find((u) => u.uic_id === policy.uic_id);
            return uic?.uic_name || "";
          } else {
            // Fallback when UIC data is not available
            return `UIC ID: ${policy.uic_id}`;
          }
        }
      }
      return "";
    },
    [policies, uics]
  );

  // Get SLA info based on channel and category
  const getSlaInfo = useCallback(
    (channelId, categoryId) => {
      if (channelId && categoryId && policies.length > 0) {
        const policy = policies.find(
          (p) =>
            p.channel_id === Number(channelId) &&
            p.complaint_id === Number(categoryId)
        );

        if (policy) {
          return {
            slaDays: policy.sla,
            slaHours: policy.sla * 24,
            description: policy.description,
          };
        }
      }
      return { slaDays: "", slaHours: "", description: "" };
    },
    [policies]
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

      const response = await fetch(`/api/v1/ticket/${ticketId}`, {
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
        throw new Error(`Failed to save ticket: ${response.status} - ${errorText}`);
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

      // Lookup account ID by account number from form
      if (customerData?.accountNumber) {
        const accountNum = customerData.accountNumber.split(",")[0].trim();
        
        try {
          const accountResponse = await fetch("/api/v1/account", {
            headers: {
              Accept: "application/json",
              Authorization: Authorization,
              "ngrok-skip-browser-warning": "true",
            },
          });

          if (accountResponse.ok) {
            const accounts = await accountResponse.json();
            const matchedAccount = accounts.find((acc) => 
              acc.account_number.toString() === accountNum
            );
            
            if (matchedAccount) {
              related_account_id = matchedAccount.account_id;
            }
          }
        } catch (error) {
          // Silent fail
        }
      }

      // Lookup card ID by card number from form
      if (customerData?.cardNumber) {
        const cardNum = customerData.cardNumber.split(",")[0].trim();
        
        try {
          const cardResponse = await fetch("/api/v1/card", {
            headers: {
              Accept: "application/json",
              Authorization: Authorization,
              "ngrok-skip-browser-warning": "true",
            },
          });

          if (cardResponse.ok) {
            const cards = await cardResponse.json();
            const matchedCard = cards.find((card) => 
              card.card_number.toString() === cardNum
            );
            
            if (matchedCard) {
              related_card_id = matchedCard.card_id;
            }
          }
        } catch (error) {
          // Silent fail
        }
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
          const committedDue = dataFormData?.committedDueAt || dataFormData?.committed_due_at;
          
          if (committedDue) {
            return new Date(committedDue).toISOString();
          }
          
          // Fallback: calculate from created_time + SLA if available
          if (dataFormData?.createdTime && dataFormData?.slaDays) {
            const createdDate = new Date(dataFormData.createdTime);
            const committedDate = new Date(createdDate);
            committedDate.setDate(committedDate.getDate() + parseInt(dataFormData.slaDays));
            committedDate.setHours(0, 0, 0, 0);
            return committedDate.toISOString();
          }
          
          return null;
        })(),
        amount: dataFormData?.amount ? Number(dataFormData.amount) : null,
        record: dataFormData?.record || "",
        related_account_id: related_account_id,
        related_card_id: related_card_id,
        terminal_id: dataFormData?.terminalId || null,
        intake_source_id: dataFormData?.sourceId
          ? Number(dataFormData.sourceId)
          : null,
        priority_id: dataFormData?.priorityId || null,
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

 const authz = getAccessToken();
 const jwtName = decodeNameFromJWT(authz);
 const authorName =
   currentEmployee?.full_name ||
   currentEmployee?.name ||
   currentEmployee?.fullName ||
   jwtName ||                       // ✅ JWT fallback
   "Unknown";
        const noteObject = {
          division: currentRole?.role_name || "Unknown",
          timestamp: new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          msg: notesFormData.newNote,
          author: authorName,              // ✅ use robust author
        };

        // Send as array of objects (backend expects this format)
        ticketData.division_notes = [noteObject];
      }

      // Don't remove any fields - send everything including null values
      // Backend should handle null values properly
      
      // 🔍 DEBUG: Log data yang dikirim ke backend
      console.log('=== TICKET DATA SENT TO BACKEND ===');
      console.log('📦 dataFormData from store:', dataFormData);
      console.log('📅 dataFormData.committedDueAt:', dataFormData?.committedDueAt);
      console.log('📅 dataFormData.transactionDate:', dataFormData?.transactionDate);
      console.log('📤 Full ticketData:', JSON.stringify(ticketData, null, 2));
      console.log('📅 committed_due_at value:', ticketData.committed_due_at);
      console.log('📅 transaction_date value:', ticketData.transaction_date);
      console.log('🎯 Key fields check:');
      console.log('   - action:', ticketData.action);
      console.log('   - customer_id:', ticketData.customer_id);
      console.log('   - issue_channel_id:', ticketData.issue_channel_id);
      console.log('   - complaint_id:', ticketData.complaint_id);
      console.log('   - priority_id:', ticketData.priority_id);
      console.log('   - terminal_id:', ticketData.terminal_id);
      console.log('=====================================');

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
        alert(
          `❌ Gagal membuat ticket (${response.status} ${response.statusText}).\n\n` +
          `${errorText?.slice(0, 500) || 'Tidak ada detail error dari server.'}`
        );
        throw new Error(
          `Failed to save ticket: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      
      // Alert sukses
      try {
        const d = result?.data ?? result ?? {};
        const ticketNumber = d.ticket_number ?? d.ticketNo ?? d.ticket ?? d.number ?? '-';
        const ticketId = d.ticket_id ?? d.id ?? d.ticketId ?? '-';
        alert(
          `✅ Ticket berhasil dibuat!\n\n` +
          `Ticket Number: ${ticketNumber}\n` +
          `Ticket ID: ${ticketId}`
        );
      } catch (e) {
        alert('✅ Ticket berhasil dibuat!');
      }


      resetAllForms();

      return result;
    } catch (error) {
      alert(`❌ Gagal membuat ticket.\n\n${error?.message || 'Unknown error'}`);
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
