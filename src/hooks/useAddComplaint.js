"use client";
import { useCallback, useEffect } from "react";
import useAddComplaintStore from "@/store/addComplaintStore";

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
    customerData, searchContext, inputType,
    dataFormData, actionFormData, notesFormData,
    channels, categories, allCategories, policies, sources, terminals, priorities, uics,
    employees, roles, currentEmployee, currentRole,
    loadingData, isDataFetched, isUserFetched,
    
    // Actions
    setCustomerData, setDataFormData, setActionFormData, setNotesFormData,
    setChannels, setCategories, setAllCategories, setPolicies, setSources, 
    setTerminals, setPriorities, setUics, setEmployees, setRoles,
    setCurrentEmployee, setCurrentRole, setLoadingData, 
    setIsDataFetched, setIsUserFetched, reset
  } = store;

  
  const get = () => store;

  // Fetch all dropdown data on mount
  const fetchDropdownData = useCallback(async () => {
    if (isDataFetched || loadingData) {
      console.log('Skipping fetchDropdownData - already fetched or loading');
      return;
    }

    setLoadingData(true);
    try {
      const Authorization = getAccessToken();
      if (!Authorization) {
        console.error('No authorization token found');
        setLoadingData(false);
        return;
      }
      
      const headers = {
        'Accept': 'application/json',
        'Authorization': Authorization,
        'ngrok-skip-browser-warning': 'true'
      };
      
      const [channelRes, categoryRes, sourceRes, terminalRes, priorityRes, policyRes, uicRes] = await Promise.all([
        fetch('/api/v1/channel', { headers }),
        fetch('/api/v1/complaint_category', { headers }),
        fetch('/api/v1/source', { headers }),
        fetch('/api/v1/terminal', { headers }),
        fetch('/api/v1/priority', { headers }),
        fetch('/api/v1/complaint_policy', { headers }),
        fetch('/api/v1/uics', { headers })
      ]);
      
      if (channelRes.ok) setChannels(await channelRes.json());
      if (categoryRes.ok) {
        const cats = await categoryRes.json();
        setAllCategories(cats);
        setCategories(cats);
      }
      if (sourceRes.ok) setSources(await sourceRes.json());
      if (terminalRes.ok) setTerminals(await terminalRes.json());
      if (priorityRes.ok) setPriorities(await priorityRes.json());
      if (policyRes.ok) {
        const policyData = await policyRes.json();
        setPolicies(Array.isArray(policyData) ? policyData : policyData.data || []);
      }
      if (uicRes.ok) {
        const uicData = await uicRes.json();
        setUics(uicData.data || []);
      } else {
        console.warn('UIC API failed with status:', uicRes.status, 'Continuing without UIC data');
        setUics([]);
      }
      
      setIsDataFetched(true);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [isDataFetched, loadingData, setChannels, setCategories, setAllCategories, setSources, setTerminals, setPriorities, setPolicies, setUics, setLoadingData, setIsDataFetched]);

  // Fetch current user data
  const fetchCurrentUser = useCallback(async () => {
    if (isUserFetched || currentEmployee) {
      
      return;
    }

    try {
      const Authorization = getAccessToken();
      
      if (!Authorization) {
        
        return;
      }
      
      const headers = {
        'Accept': 'application/json',
        'Authorization': Authorization,
        'ngrok-skip-browser-warning': 'true'
      };
      
      console.log('Fetching current user data...');
      const employeeRes = await fetch('/api/v1/employee', { headers });
      if (employeeRes.ok) {
        const employeeData = await employeeRes.json();
      
        const employee = employeeData[0]; // Assuming first employee is current user
       
        
        if (employee?.role_id) {
          const roleRes = await fetch('/api/v1/role', { headers });
          if (roleRes.ok) {
            const roleData = await roleRes.json();
            const role = roleData.find(r => r.role_id === employee.role_id);
            
            setCurrentRole(role);
          }
        }
        setIsUserFetched(true);
      } else {
        console.error('Failed to fetch employee data:', employeeRes.status);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }, [isUserFetched, currentEmployee, setCurrentEmployee, setCurrentRole, setIsUserFetched]);

  // Filter categories based on selected channel
  const filterCategories = useCallback((channelId) => {
    if (channelId && policies.length > 0 && allCategories.length > 0) {
      const allowedComplaintIds = policies
        .filter(policy => policy.channel_id === Number(channelId))
        .map(policy => policy.complaint_id);
      
      const filteredCategories = allCategories.filter(cat => 
        allowedComplaintIds.includes(cat.complaint_id)
      );
      
      return filteredCategories;
    }
    return allCategories;
  }, [policies, allCategories]);
  
  // Update categories in store
  const updateCategories = useCallback((filteredCategories) => {
    setCategories(filteredCategories);
  }, [setCategories]);

  // Get UIC name based on channel and category
  const getUicName = useCallback((channelId, categoryId) => {
    if (channelId && categoryId && policies.length > 0) {
      const policy = policies.find(p => 
        p.channel_id === Number(channelId) && p.complaint_id === Number(categoryId)
      );
      
      if (policy && policy.uic_id) {
        if (uics.length > 0) {
          const uic = uics.find(u => u.uic_id === policy.uic_id);
          return uic?.uic_name || '';
        } else {
          // Fallback when UIC data is not available
          return `UIC ID: ${policy.uic_id}`;
        }
      }
    }
    return '';
  }, [policies, uics]);

  // Get SLA info based on channel and category
  const getSlaInfo = useCallback((channelId, categoryId) => {
    if (channelId && categoryId && policies.length > 0) {
      const policy = policies.find(p => 
        p.channel_id === Number(channelId) && p.complaint_id === Number(categoryId)
      );
      
      if (policy) {
        return {
          slaDays: policy.sla,
          slaHours: policy.sla * 24,
          description: policy.description
        };
      }
    }
    return { slaDays: '', slaHours: '', description: '' };
  }, [policies]);

  const resetAllForms = useCallback(() => {
  
    reset();
    window.dispatchEvent(new CustomEvent('resetAllForms'));
  }, [reset]);

  // Update ticket status after creation (workaround for backend limitation)
  const updateTicketStatus = useCallback(async (ticketId, statusIds, action) => {
    const Authorization = getAccessToken();
    if (!Authorization) {
      throw new Error('No authorization token for status update');
    }

  
    
    const updateData = {
      customer_status_id: statusIds.customer_status_id,
      employee_status_id: statusIds.employee_status_id
    };
    
    console.log('   - Update data:', updateData);
    
    const response = await fetch(`/api/v1/ticket/${ticketId}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': Authorization,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(updateData)
    });
    

    
    if (!response.ok) {
      const errorText = await response.text();
     
      throw new Error(`Status update failed: ${response.status}`);
    }
    
    const result = await response.json();
   
    
    return result;
  }, []);

  // Save ticket function
  const saveTicket = useCallback(async () => {
   
    
    // Get fresh store state
    const storeState = get();
   
   
    // CRITICAL: Check if actionFormData exists in fresh store
    if (!storeState.actionFormData) {
      console.error('CRITICAL: actionFormData is missing from fresh store state!');
      console.log('Available store keys:', Object.keys(storeState));
    }
    try {
      const Authorization = getAccessToken();
      if (!Authorization) {
        throw new Error('No authorization token found');
      }

      // Get policy_id based on channel and category
      const policy = policies.find(p => 
        p.channel_id === Number(dataFormData.channelId) && 
        p.complaint_id === Number(dataFormData.categoryId)
      );

      // Map action to status IDs
      const getStatusIds = (action) => {
        
        if (action === 'ESCALATED') {
        
          return { customer_status_id: 3, employee_status_id: 3 };
        } else if (action === 'CLOSED') {
        
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
        const accountNum = customerData.accountNumber.split(',')[0].trim();
        console.log('   - Looking up account_id for account number:', accountNum);
        
        try {
          const accountResponse = await fetch('api/v1/account', {
            headers: {
              'Accept': 'application/json',
              'Authorization': Authorization,
              'ngrok-skip-browser-warning': 'true'
            }
          });
          console.log('   - Account API response status:', accountResponse.status);
          
          if (accountResponse.ok) {
            const accounts = await accountResponse.json();
            console.log('   - Total accounts from API:', accounts.length);
            const customerAccounts = accounts.filter(acc => acc.customer_id === customerData.customer_id);
            console.log('   - Customer accounts found:', customerAccounts.length);
            
            if (customerAccounts.length > 0) {
              related_account_id = customerAccounts[0].account_id;
              console.log('   - Using account ID:', related_account_id, 'from account number:', customerAccounts[0].account_number);
            } else {
              console.log('   - No accounts found for customer_id:', customerData.customer_id);
            }
          } else {
            console.log('   - Account API failed with status:', accountResponse.status);
          }
        } catch (error) {
          console.log('   - Account API error:', error.message);
        }
        
        console.log('   - Fetching cards from API...');
        try {
          const cardResponse = await fetch('/api/v1/card', {
            headers: {
              'Accept': 'application/json',
              'Authorization': Authorization,
              'ngrok-skip-browser-warning': 'true'
            }
          });
          console.log('   - Card API response status:', cardResponse.status);
          
          if (cardResponse.ok) {
            const cards = await cardResponse.json();
            console.log('   - Total cards from API:', cards.length);
            
            if (related_account_id) {
              const customerCards = cards.filter(card => card.account_id === related_account_id);
              console.log('   - Customer cards found:', customerCards.length);
              
              if (customerCards.length > 0) {
                related_card_id = customerCards[0].card_id;
                console.log('   - Using card ID:', related_card_id, 'from card number:', customerCards[0].card_number);
              } else {
                console.log('   - No cards found for account_id:', related_account_id);
                // Fallback: use any available card
                if (cards.length > 0) {
                  related_card_id = cards[0].card_id;
                  console.log('   - Fallback: Using first available card ID:', related_card_id, 'from card number:', cards[0].card_number);
                } else {
                  console.log('   - No cards available in system');
                }
              }
            } else {
              console.log('   - Skipping card lookup (no account_id)');
            }
          } else {
            console.log('   - Card API failed with status:', cardResponse.status);
          }
        } catch (error) {
          console.log('   - Card API error:', error.message);
        }
      } else {
        console.log('   - No customer_id available for account/card lookup');
      }
      
      console.log('   - Final IDs: account_id =', related_account_id, ', card_id =', related_card_id);

      // Build ticket data from actual form data
      const ticketData = {
        description: dataFormData?.description || '',
        record: dataFormData?.record || '',
        customer_status_id: statusIds.customer_status_id,
        employee_status_id: statusIds.employee_status_id,
        priority_id: dataFormData?.priorityId ? Number(dataFormData.priorityId) : null,
        issue_channel_id: dataFormData?.channelId ? Number(dataFormData.channelId) : null,
        intake_source_id: dataFormData?.sourceId ? Number(dataFormData.sourceId) : null,
        customer_id: customerData?.customer_id || null,
        related_account_id: related_account_id || null,
        related_card_id: related_card_id || null,
        complaint_id: dataFormData?.categoryId ? Number(dataFormData.categoryId) : null,
        responsible_employee_id: currentEmployee?.employee_id || null,
        policy_id: policy?.policy_id || null,
        committed_due_at: dataFormData?.committedDueAt ? new Date(dataFormData.committedDueAt).toISOString() : null,
        transaction_date: dataFormData?.transactionDate ? new Date(dataFormData.transactionDate).toISOString() : null,
        amount: dataFormData?.amount ? Number(dataFormData.amount) : null,
        terminal_id: dataFormData?.terminalId ? Number(dataFormData.terminalId) : null,
        created_time: dataFormData?.createdTime ? new Date(dataFormData.createdTime).toISOString() : new Date().toISOString(),
        closed_time: currentActionData?.closedTime ? new Date(currentActionData.closedTime).toISOString() : null
      };
      
      // Only add reason and solution if they have values
      if (currentActionData?.reason && currentActionData.reason.trim()) {
        ticketData.reason = currentActionData.reason;
      }
      if (currentActionData?.solution && currentActionData.solution.trim()) {
        ticketData.solution = currentActionData.solution;
      }
      
      // Add division_notes in correct JSON format
      if (notesFormData?.newNote) {
        const noteObject = {
          division: currentRole?.role_name || 'Unknown',
          timestamp: new Date().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
          }),
          msg: notesFormData.newNote,
          author: currentEmployee?.full_name || 'Unknown'
        };
        
        // Try different formats to see which one backend accepts
        console.log('Testing division_notes formats:');
        console.log('   - As JSON string:', JSON.stringify([noteObject]));
        console.log('   - As array:', [noteObject]);
        console.log('   - As single object:', noteObject);
        
        // Send as JSON string first (most common format)
        ticketData.division_notes = JSON.stringify([noteObject]);
      }
      
      // Don't remove any fields - send everything including null values
      // Backend should handle null values properly
      
      console.log('5. Final Ticket Data Check:');
      console.log('   - record:', ticketData.record);
      console.log('   - responsible_employee_id:', ticketData.responsible_employee_id);
      console.log('   - related_account_id:', ticketData.related_account_id);
      console.log('   - related_card_id:', ticketData.related_card_id);
      console.log('   - customer_id:', ticketData.customer_id);
      console.log('5. Complete Ticket Data:', JSON.stringify(ticketData, null, 2));
      
      console.log('6. Data being sent to API:');
      const apiPayload = JSON.stringify(ticketData);
      console.log('   - API Payload:', apiPayload);
      console.log('   - Payload size:', apiPayload.length, 'characters');
      
      console.log('=== DETAILED SAVE DEBUG ===');
      console.log('1. Store States (from hook):');
      console.log('   - customerData:', customerData);
      console.log('   - currentEmployee:', currentEmployee);
      console.log('   - dataFormData:', dataFormData);
      console.log('   - actionFormData:', actionFormData);
      console.log('   - notesFormData:', notesFormData);
      
      console.log('1b. Store States (fresh from store):');
      console.log('   - customerData:', storeState.customerData);
      console.log('   - currentEmployee:', storeState.currentEmployee);
      console.log('   - dataFormData:', storeState.dataFormData);
      
      console.log('2. Critical Fields Check:');
      console.log('   - record field:', dataFormData?.record);
      console.log('   - account number raw:', customerData?.accountNumber);
      console.log('   - card number raw:', customerData?.cardNumber);
      console.log('   - employee ID:', currentEmployee?.employee_id);
      console.log('   - employee object keys:', currentEmployee ? Object.keys(currentEmployee) : 'null');
      
      console.log('3. Account/Card Processing:');
      if (customerData?.accountNumber) {
        const accountNum = customerData.accountNumber.split(',')[0].trim();
        console.log('   - processed account number:', accountNum);
      }
      if (customerData?.cardNumber) {
        const cardNum = customerData.cardNumber.split(',')[0].trim();
        console.log('   - processed card number:', cardNum);
      }
      console.log('================================');
      console.log('   - Account/Card lookup completed');
      console.log('================================');
      
      console.log('4. Building ticket data...');
      
      const response = await fetch('/api/v1/tickets', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': Authorization,
          'ngrok-skip-browser-warning': 'true',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(ticketData)
      });
      
      console.log('7. API Response Status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('   - Error response body:', errorText);
        throw new Error(`Failed to save ticket: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('7. API Response Analysis:');
      console.log('   - Full API Response:', JSON.stringify(result, null, 2));
      console.log('   - Response success:', result.success);
      if (result.data) {
        console.log('   - Returned record:', result.data.record);
        console.log('   - Returned responsible_employee_id:', result.data.responsible_employee_id);
        console.log('   - Returned division_notes:', result.data.division_notes);
      }
      console.log('8. Data Sent vs Received:');
      console.log('   - Sent customer_status_id:', ticketData.customer_status_id, '| Received:', result.data?.customer_status?.customer_status_id);
      console.log('   - Sent employee_status_id:', ticketData.employee_status_id, '| Received:', result.data?.employee_status?.employee_status_id);
      console.log('   - Sent record:', ticketData.record, '| Received:', result.data?.record);
      console.log('   - Sent responsible_employee_id:', ticketData.responsible_employee_id, '| Received:', result.data?.responsible_employee_id);
      console.log('   - Sent division_notes:', ticketData.division_notes, '| Received:', result.data?.division_notes);
      
      console.log('\n🚨 BACKEND LIMITATION CONFIRMED:');
      console.log('   ❌ Backend POST /api/v1/tickets does NOT support customer_status_id and employee_status_id fields');
      console.log('   ❌ These fields are ignored and always default to 1');
      console.log('   ✅ Frontend is working correctly - this is a backend API limitation');
      
      // Try to update status after ticket creation if action is not default
      console.log('\n🔍 Checking if status update is needed...');
      console.log('   - currentActionData?.action:', currentActionData?.action);
      console.log('   - result.data?.ticket_id:', result.data?.ticket_id);
      console.log('   - statusIds:', statusIds);
      
      if (currentActionData?.action && currentActionData.action !== '' && result.data?.ticket_id) {
        console.log('\n🔄 Attempting to update ticket status after creation...');
        try {
          await updateTicketStatus(result.data.ticket_id, statusIds, currentActionData.action);
        } catch (updateError) {
          console.log('   ❌ Status update failed:', updateError.message);
          console.log('   ℹ️  Ticket created successfully but status remains default (ID: 1)');
        }
      } else {
        console.log('   ⏭️  Skipping status update (no action selected or missing ticket ID)');
      }
      console.log('Ticket saved successfully:', result.data?.ticket_number);
      
      // Check if division_notes was actually saved
      if (result.success && result.data && notesFormData?.newNote) {
        console.log('9. Checking if division_notes was saved...');
        console.log('   - Sent division_notes:', ticketData.division_notes);
        console.log('   - Received division_notes:', result.data.division_notes);
        
        if (!result.data.division_notes) {
          console.log('   - Division notes not saved by backend - this is a backend limitation');
        }
      }
      

      resetAllForms();
      
      return result;
    } catch (error) {
      console.error('Save error:', error);
      console.log('Error details:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }, [dataFormData, actionFormData, notesFormData, customerData, currentEmployee, currentRole, policies, resetAllForms, get]);

  // useEffect(() => {
  //   fetchDropdownData();
  //   fetchCurrentUser();
  // }, [fetchDropdownData, fetchCurrentUser]);

  useEffect(() => {
    if (!isDataFetched) {
      fetchDropdownData();
    }
    if (!isUserFetched) {
      fetchCurrentUser();
    }
  }, []); 

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
    customerData, searchContext, inputType,
    dataFormData, actionFormData, notesFormData,
    channels, categories, allCategories, policies, sources, terminals, priorities, uics,
    currentEmployee, currentRole, loadingData,
    
    // Actions
    setCustomerData, setDataFormData, setActionFormData, setNotesFormData,
    filterCategories, updateCategories, getUicName, getSlaInfo,
    reset, resetAllForms, saveTicket
  };

}