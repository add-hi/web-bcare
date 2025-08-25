"use client";

import React, { useState, useEffect } from "react";
import useAddComplaint from "@/hooks/useAddComplaint";
import Button from "@/components/ui/Button";

const InputForm = () => {
  const {
    dataFormData, currentEmployee, currentRole, policies, uics, getUicName, saveTicket, setActionFormData
  } = useAddComplaint();
  
  const [formData, setFormData] = useState({
    action: "",
    formUnit: "",
    unitTo: "",
    closedTime: "",
    solution: "",
    reason: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);



  // Auto-fill Form Unit with current user role
  useEffect(() => {
    if (currentRole?.role_name) {
      setFormData(prev => {
        const newData = { ...prev, formUnit: currentRole.role_name };
        setTimeout(() => setActionFormData(newData), 0);
        return newData;
      });
    }
  }, [currentRole, setActionFormData]);

  // Auto-fill Unit To based on channel and category selection
  useEffect(() => {
    const { channelId, categoryId } = dataFormData;
    // console.log('ActionForm - dataFormData:', dataFormData);
    // console.log('ActionForm - channelId:', channelId, 'categoryId:', categoryId);
    // console.log('ActionForm - policies length:', policies.length, 'uics length:', uics.length);
    
    if (channelId && categoryId) {
      const uicName = getUicName(channelId, categoryId);
      // console.log('ActionForm - getUicName result:', uicName);
      
      if (uicName) {
        setFormData(prev => {
          const newData = { ...prev, unitTo: uicName };
          setTimeout(() => setActionFormData(newData), 0);
          return newData;
        });
      }
    }
  }, [dataFormData, getUicName, policies, uics, setActionFormData]);
  
  // Reset form when dataFormData is cleared
  useEffect(() => {
    if (!dataFormData.channelId && !dataFormData.categoryId) {
      const resetData = {
        action: "",
        formUnit: currentRole?.role_name || "",
        unitTo: "",
        closedTime: "",
        solution: "",
        reason: "",
      };
      setFormData(resetData);
      setActionFormData(resetData);
    }
  }, [dataFormData, currentRole, setActionFormData]);

  // Listen for reset event
  useEffect(() => {
    const handleReset = () => {
      const resetData = {
        action: "",
        formUnit: currentRole?.role_name || "",
        unitTo: "",
        closedTime: "",
        solution: "",
        reason: "",
      };
      setFormData(resetData);
      setActionFormData(resetData);
    };

    window.addEventListener('resetAllForms', handleReset);
    return () => window.removeEventListener('resetAllForms', handleReset);
  }, [currentRole, setActionFormData]);

  const handleInputChange = (field, value) => {
    console.log('🔄 ActionForm handleInputChange:', field, '=', value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        console.log('💾 ActionForm setActionFormData called with:', newData);
        console.log('🎯 ActionForm - action value being set:', newData.action);
        setActionFormData(newData);
      }, 0);
      return newData;
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveTicket();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-green-100 rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      {/* Header */}

      <div className="bg-green-600 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Action</h2>
      </div>
      <div className="w-full bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="p-1  text-black mt-3">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Action */}
            <div className="flex gap-3 items-end min-w-[140px] flex-grow min-w-0">
              <label className="text-sm font-medium text-black whitespace-nowrap self-center">
                Action
              </label>
              <div className="flex-1">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm"
                  value={formData.action}
                  onChange={(e) => handleInputChange("action", e.target.value)}
                >
                  <option value="" disabled>
                    Pilih Action 
                  </option>
                  <option value="ESCALATED">ESCALATED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            {/* Form Unit */}
            <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0">
              <label className="text-sm font-medium text-black whitespace-nowrap">
                From Unit
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm bg-gray-100"
                value={formData.formUnit}
                onChange={(e) => handleInputChange("formUnit", e.target.value)}
                placeholder="Auto-filled from user role"
                readOnly
              />
            </div>

            {/* Unit to */}
            <div className="flex items-center space-x-2 min-w-[180px] flex-grow min-w-0">
              <label className="text-sm font-medium text-black whitespace-nowrap">
                Unit to <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm bg-gray-100"
                value={formData.unitTo}
                onChange={(e) => handleInputChange("unitTo", e.target.value)}
                placeholder="Auto-filled from policy"
                readOnly
              />
            </div>

            {/* Closed Time - hanya muncul kalau action === "CLOSED" */}
            {formData.action === "CLOSED" && (
              <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0">
                <label className="text-sm font-medium text-black whitespace-nowrap">
                  Closed Time
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm"
                  value={formData.closedTime}
                  onChange={(e) =>
                    handleInputChange("closedTime", e.target.value)
                  }
                />
              </div>
            )}
          </div>

          {/* Solution - muncul kalau action === "CLOSED" */}
          {formData.action === "CLOSED" && (
            <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0 mt-3">
              <label className="text-sm font-medium text-black whitespace-nowrap">
                Solution
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black "
                value={formData.solution}
                onChange={(e) => handleInputChange("solution", e.target.value)}
                placeholder="Isi Solution"
              />
            </div>
          )}

          {/* Reason - muncul kalau action === "Decline" */}
          {formData.action === "Decline" && (
            <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0 mt-3">
              <label className="text-sm font-medium text-black whitespace-nowrap">
                Reason
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm"
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Isi Reason"
              />
            </div>
          )}
          
          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <Button
              variant="success"
              onClick={handleSave}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
