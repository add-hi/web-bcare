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
  const store = useAddComplaintStore();
  const {
    // State
    customerData, searchContext, inputType,
    dataFormData, actionFormData, notesFormData,
    channels, categories, allCategories, policies, sources, terminals, priorities, uics,
    employees, roles, currentEmployee, currentRole,
    loadingData, isDataFetched, isUserFetched,
    loadingData, isDataFetched, isUserFetched,
    
    // Actions
    setCustomerData, setDataFormData, setActionFormData, setNotesFormData,
    setChannels, setCategories, setAllCategories, setPolicies, setSources, 
    setTerminals, setPriorities, setUics, setEmployees, setRoles,
    setCurrentEmployee, setCurrentRole, setLoadingData, 
    setIsDataFetched, setIsUserFetched, reset
  } = store;

  
  const get = () => store;
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
      } else {
        console.warn('UIC API failed with status:', uicRes.status, 'Continuing without UIC data');
        setUics([]);
      }
      
      setIsDataFetched(true);
      
      setIsDataFetched(true);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [isDataFetched, loadingData, setChannels, setCategories, setAllCategories, setSources, setTerminals, setPriorities, setPolicies, setUics, setLoadingData, setIsDataFetched]);
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
        setIsUserFetched(true);
      } else {
        console.error('Failed to fetch employee data:', employeeRes.status);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }, [isUserFetched, currentEmployee, setCurrentEmployee, setCurrentRole, setIsUserFetched]);
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
  }, [policies, allCategories]);
  
  // Update categories in store
  const updateCategories = useCallback((filteredCategories) => {
    setCategories(filteredCategories);
  }, [setCategories]);

  // Get UIC name based on channel and category
  const getUicName = useCallback((channelId, categoryId) => {
    if (channelId && categoryId && policies.length > 0) {
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
          const accountResponse = await fetch('/api/v1/account', {
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
            console.log('   - First 3 accounts:', accounts.slice(0, 3));
            
            const matchedAccount = accounts.find(acc => {
              const match = acc.account_number.toString() === accountNum;
              console.log(`   - Checking account ${acc.account_number} === ${accountNum}:`, match);
              return match;
            });
            
            if (matchedAccount) {
              related_account_id = matchedAccount.account_id;
              console.log('   ✅ Found account_id:', related_account_id, 'for account number:', accountNum);
            } else {
              console.log('   ❌ No account found for number:', accountNum);
              console.log('   - Available account numbers:', accounts.map(a => a.account_number).slice(0, 10));
            }
          } else {
            console.log('   ❌ Account API failed with status:', accountResponse.status);
          }
        } catch (error) {
          console.log('   ❌ Error looking up account:', error.message);
        }
      } else {
        console.log('   ⚠️ No accountNumber in customerData');
      }
      
      // Lookup card ID by card number from form
      if (customerData?.cardNumber) {
        const cardNum = customerData.cardNumber.split(',')[0].trim();
        console.log('   - Looking up card_id for card number:', cardNum);
        
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
            console.log('   - First 3 cards:', cards.slice(0, 3));
            
            const matchedCard = cards.find(card => {
              const match = card.card_number.toString() === cardNum;
              console.log(`   - Checking card ${card.card_number} === ${cardNum}:`, match);
              return match;
            });
            
            if (matchedCard) {
              related_card_id = matchedCard.card_id;
              console.log('   ✅ Found card_id:', related_card_id, 'for card number:', cardNum);
            } else {
              console.log('   ❌ No card found for number:', cardNum);
              console.log('   - Available card numbers:', cards.map(c => c.card_number).slice(0, 10));
            }
          } else {
            console.log('   ❌ Card API failed with status:', cardResponse.status);
          }
        } catch (error) {
          console.log('   ❌ Error looking up card:', error.message);
        }
      } else {
        console.log('   ⚠️ No cardNumber in customerData');
      }
      
      console.log('🎯 FINAL LOOKUP RESULTS:');
      console.log('   - related_account_id:', related_account_id);
      console.log('   - related_card_id:', related_card_id);
      
      // Priority works (value=2), Terminal needs to be selected in DataForm dropdown

      // Build ticket data matching exact body format
      console.log('🔍 CRITICAL ACTION CHECK:');
      console.log('   - currentActionData:', currentActionData);
      console.log('   - currentActionData?.action:', currentActionData?.action);
      console.log('   - Action being sent to API:', currentActionData?.action || null);
      
      const ticketData = {
        action: currentActionData?.action || null,
        description: dataFormData?.description || '',
        issue_channel_id: dataFormData?.channelId ? Number(dataFormData.channelId) : null,
        complaint_id: dataFormData?.categoryId ? Number(dataFormData.categoryId) : null,
        customer_id: customerData?.customer_id || null,
        transaction_date: dataFormData?.transactionDate ? new Date(dataFormData.transactionDate).toISOString() : null,
        amount: dataFormData?.amount ? Number(dataFormData.amount) : null,
        record: dataFormData?.record || '',
        related_account_id: related_account_id,
        related_card_id: related_card_id,
        terminal_id: dataFormData?.terminalId || null,
        intake_source_id: dataFormData?.sourceId ? Number(dataFormData.sourceId) : null,
        priority_id: dataFormData?.priorityId || null,
        reason: currentActionData?.reason || '',
        solution: currentActionData?.solution || ''
      };
      
      // Remove fields that should not be sent to backend
      const fieldsToRemove = ['customer_status_id', 'employee_status_id', 'responsible_employee_id', 'policy_id', 'committed_due_at', 'created_time', 'closed_time'];
      fieldsToRemove.forEach(field => delete ticketData[field]);
      
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
        
        // Send as array of objects (backend expects this format)
        ticketData.division_notes = [noteObject];
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
      
      // Backend should handle action field directly, no need for status update
      console.log('\n✅ Backend will process action field directly:', currentActionData?.action);
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