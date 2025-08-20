"use client";
import { useCallback, useEffect } from "react";
import useAddComplaintStore from "@/store/addComplaintStore";

export default function useAddComplaint() {
  const {
    // State
    customerData, searchContext, inputType,
    dataFormData, actionFormData, notesFormData,
    channels, categories, allCategories, policies, sources, terminals, priorities, uics,
    employees, roles, currentEmployee, currentRole,
    loadingData,
    
    // Actions
    setCustomerData, setDataFormData, setActionFormData, setNotesFormData,
    setChannels, setCategories, setAllCategories, setPolicies, setSources, 
    setTerminals, setPriorities, setUics, setEmployees, setRoles,
    setCurrentEmployee, setCurrentRole, setLoadingData, reset
  } = useAddComplaintStore();

  // Fetch all dropdown data on mount
  const fetchDropdownData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [channelRes, categoryRes, sourceRes, terminalRes, priorityRes, policyRes, uicRes] = await Promise.all([
        fetch('/api/v1/channel'),
        fetch('/api/v1/complaint_category'),
        fetch('/api/v1/source'),
        fetch('/api/v1/terminal'),
        fetch('/api/v1/priority'),
        fetch('/api/v1/complaint_policy'),
        fetch('/api/v1/uics')
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
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [setChannels, setCategories, setAllCategories, setSources, setTerminals, setPriorities, setPolicies, setUics, setLoadingData]);

  // Fetch current user data
  const fetchCurrentUser = useCallback(async () => {
    try {
      const employeeRes = await fetch('/api/v1/employee');
      if (employeeRes.ok) {
        const employeeData = await employeeRes.json();
        const employee = employeeData[0]; // Assuming first employee is current user
        setCurrentEmployee(employee);
        
        if (employee?.role_id) {
          const roleRes = await fetch('/api/v1/role');
          if (roleRes.ok) {
            const roleData = await roleRes.json();
            const role = roleData.find(r => r.role_id === employee.role_id);
            setCurrentRole(role);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }, [setCurrentEmployee, setCurrentRole]);

  // Filter categories based on selected channel
  const filterCategories = useCallback((channelId) => {
    if (channelId && policies.length > 0 && allCategories.length > 0) {
      const allowedComplaintIds = policies
        .filter(policy => policy.channel_id === Number(channelId))
        .map(policy => policy.complaint_id);
      
      const filteredCategories = allCategories.filter(cat => 
        allowedComplaintIds.includes(cat.complaint_id)
      );
      
      setCategories(filteredCategories);
      return filteredCategories;
    }
    return allCategories;
  }, [policies, allCategories, setCategories]);

  // Get UIC name based on channel and category
  const getUicName = useCallback((channelId, categoryId) => {
    if (channelId && categoryId && policies.length > 0 && uics.length > 0) {
      const policy = policies.find(p => 
        p.channel_id === Number(channelId) && p.complaint_id === Number(categoryId)
      );
      
      if (policy && policy.uic_id) {
        const uic = uics.find(u => u.uic_id === policy.uic_id);
        return uic?.uic_name || '';
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

  return {
    // State
    customerData, searchContext, inputType,
    dataFormData, actionFormData, notesFormData,
    channels, categories, allCategories, policies, sources, terminals, priorities, uics,
    currentEmployee, currentRole, loadingData,
    
    // Actions
    setCustomerData, setDataFormData, setActionFormData, setNotesFormData,
    fetchDropdownData, fetchCurrentUser, filterCategories, getUicName, getSlaInfo,
    reset
  };
}