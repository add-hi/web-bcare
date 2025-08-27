"use client";
import { useCallback, useEffect } from "react";
import useAddComplaintStore from "@/store/addComplaintStore";
import useUser from "@/hooks/useUser";
import httpClient from "@/lib/httpClient";
import toast from "react-hot-toast";

export default function useAddComplaint() {
  const store = useAddComplaintStore();
  const { user, accessToken } = useUser();
  
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
    loadingData,
    isDataFetched,

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
    setLoadingData,
    setIsDataFetched,
    reset,
  } = store;

  // Fetch specific policy for channel and category
  const fetchPolicyInfo = useCallback(async (channelId, categoryId) => {
    if (!accessToken) return null;
    
    try {
      const { data } = await httpClient.get(`/v1/policies`, {
        params: { channel_id: channelId, complaint_id: categoryId, limit: 1 },
        headers: { Authorization: accessToken }
      });
      
      const policies = Array.isArray(data) ? data : data?.data || [];
      return policies[0] || null;
    } catch (error) {
      console.error('Failed to fetch policy:', error);
      return null;
    }
  }, [accessToken]);

  // Fetch dropdown data
  const fetchDropdownData = useCallback(async () => {
    if (isDataFetched || !accessToken) return;
    
    setLoadingData(true);
    try {
      const [channels, categories, sources, terminals, priorities, policies, uics] = await Promise.all([
        httpClient.get('/v1/channels', { headers: { Authorization: accessToken } }),
        httpClient.get('/v1/complaint-categories', { headers: { Authorization: accessToken } }),
        httpClient.get('/v1/sources', { headers: { Authorization: accessToken } }),
        httpClient.get('/v1/terminals', { headers: { Authorization: accessToken } }),
        httpClient.get('/v1/priorities', { headers: { Authorization: accessToken } }),
        httpClient.get('/v1/policies', { headers: { Authorization: accessToken } }),
        httpClient.get('/v1/uics', { headers: { Authorization: accessToken } })
      ]);

      setChannels(channels.data?.data || channels.data || []);
      const cats = categories.data?.data || categories.data || [];
      setAllCategories(cats);
      setCategories(cats);
      setSources(sources.data?.data || sources.data || []);
      setTerminals(terminals.data?.data || terminals.data || []);
      setPriorities(priorities.data?.data || priorities.data || []);
      setPolicies(policies.data?.data || policies.data || []);
      setUics(uics.data?.data || uics.data || []);
      
      setIsDataFetched(true);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [isDataFetched, accessToken, setLoadingData, setChannels, setCategories, setAllCategories, setSources, setTerminals, setPriorities, setPolicies, setUics, setIsDataFetched]);



  // Fetch policies by channel and filter categories
  const fetchPoliciesByChannel = useCallback(async (channelId) => {
    if (!accessToken || !channelId) return allCategories;
    
    try {
      const { data } = await httpClient.get('/v1/policies', {
        params: { channel_id: channelId, limit: 50 },
        headers: { Authorization: accessToken }
      });
      
      const channelPolicies = Array.isArray(data) ? data : data?.data || [];
      const allowedComplaintIds = channelPolicies.map(p => 
        p.complaint_category?.complaint_id || p.complaint_id
      );
      
      return allCategories.filter(cat => 
        allowedComplaintIds.includes(cat.complaint_id)
      );
    } catch (error) {
      console.error('Failed to fetch policies by channel:', error);
      return allCategories;
    }
  }, [accessToken, allCategories]);

  // Filter categories based on selected channel
  const filterCategories = useCallback(
    (channelId) => {
      if (channelId && policies.length > 0 && allCategories.length > 0) {
        const allowedComplaintIds = policies
          .filter((policy) => {
            const policyChannelId = policy.channel?.channel_id || policy.channel_id;
            return policyChannelId === Number(channelId);
          })
          .map((policy) => {
            return policy.complaint_category?.complaint_id || policy.complaint_id;
          });

        return allCategories.filter((cat) =>
          allowedComplaintIds.includes(cat.complaint_id)
        );
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



  // Save ticket function
  const saveTicket = useCallback(async () => {
    if (!accessToken) {
      throw new Error("No authorization token found");
    }
    
    try {

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
        const authorName = user?.full_name || user?.name || user?.email || "Unknown";
        const divisionName = user?.role_details?.role_name || user?.role || "Unknown";
          
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

      const response = await httpClient.post('/v1/tickets', ticketData, {
        headers: { Authorization: accessToken }
      });

      const result = response.data;

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
  }, [dataFormData, actionFormData, notesFormData, customerData, user, policies, resetAllForms, accessToken]);

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
    fetchDropdownData();
  }, [fetchDropdownData]);

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
    fetchPoliciesByChannel,
    updateCategories,
    getUicName,
    getSlaInfo,
    reset,
    resetAllForms,
    saveTicket,
  };
}
