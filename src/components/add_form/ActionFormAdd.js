"use client";

import React, { useState, useEffect, useRef } from "react";
import useAddComplaint from "@/hooks/useAddComplaint";
import useUser from "@/hooks/useUser";
import Button from "@/components/ui/Button";

const InputForm = () => {
  const {
    dataFormData, policies, uics, getUicName, saveTicket, setActionFormData
  } = useAddComplaint();
  const { user } = useUser();
  
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
    const roleName = user?.role_details?.role_name || user?.role || "";
    if (roleName) {
      setFormData(prev => {
        const newData = { ...prev, formUnit: roleName };
        setTimeout(() => setActionFormData(newData), 0);
        return newData;
      });
    }
  }, [user, setActionFormData]);

  // Auto-fill Unit To based on channel and category selection
  useEffect(() => {
    const { channelId, categoryId } = dataFormData;

    if (channelId && categoryId) {
      const fetchUicName = async () => {
        const uicName = await getUicName(channelId, categoryId);
        if (uicName) {
          setFormData(prev => {
            const newData = { ...prev, unitTo: uicName };
            setTimeout(() => setActionFormData(newData), 0);
            return newData;
          });
        }
      };
      
      fetchUicName();
    }
  }, [dataFormData, getUicName, setActionFormData]);
  
  // Reset form when dataFormData is cleared
  useEffect(() => {
    if (!dataFormData.channelId && !dataFormData.categoryId) {
      const roleName = user?.role_details?.role_name || user?.role || "";
      const resetData = {
        action: "",
        formUnit: roleName,
        unitTo: "",
        closedTime: "",
        solution: "",
        reason: "",
      };
      setFormData(resetData);
      setActionFormData(resetData);
    }
  }, [dataFormData, user, setActionFormData]);

  // Listen for reset event
  useEffect(() => {
    const handleReset = () => {
      const roleName = user?.role_details?.role_name || user?.role || "";
      const resetData = {
        action: "",
        formUnit: roleName,
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
  }, [user, setActionFormData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
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

  // SearchableSelect component (same as DataFormAdd)
  const SearchableSelect = ({
    value,
    onChange,
    options,
    placeholder,
    getLabel,
    getValue,
    disabled = false,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    const filteredOptions = options.filter((opt) => {
      const haystack = (getLabel(opt) || "").toString().toLowerCase();
      return haystack.includes((search || "").toLowerCase());
    });

    const selectedOption = options.find((opt) => getValue(opt) === value);

    const displayValue =
      isOpen && search
        ? search
        : selectedOption
        ? getLabel(selectedOption)
        : search;

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
          setSearch("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm pr-8 ${
              disabled ? "bg-gray-50 text-gray-400" : ""
            }`}
            value={displayValue}
            onChange={(e) => {
              if (!disabled) {
                setSearch(e.target.value);
                setIsOpen(true);
              }
            }}
            onFocus={() => {
              if (!disabled) {
                setIsOpen(true);
                if (selectedOption) setSearch("");
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
          />
          <svg
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b max-h-40 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    onChange(getValue(opt));
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  {getLabel(opt)}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            )}
          </div>
        )}
      </div>
    );
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
                <SearchableSelect
                  value={formData.action}
                  onChange={(v) => handleInputChange("action", v)}
                  options={[
                    { value: "ESCALATED", label: "ESCALATED" },
                    { value: "CLOSED", label: "CLOSED" }
                  ]}
                  placeholder="Pilih Action"
                  getLabel={(opt) => opt.label}
                  getValue={(opt) => opt.value}
                />
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
