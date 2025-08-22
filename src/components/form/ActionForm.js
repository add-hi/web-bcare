"use client";

import React, { useState } from "react";
import SearchableSelect from "../SearchableSelect";

const InputForm = ({ detail }) => {
  const [formData, setFormData] = useState({
    action: detail?.statuses?.employee?.name || "",
    formUnit: detail?.ticket?.employee?.fullName || "",
    unitTo: detail?.policy?.uicName || "",
    closedTime: detail?.timestamps?.closedTime ? new Date(detail.timestamps.closedTime).toISOString().split('T')[0] : "",
    solution: detail?.ticket?.solution || "",
    reason: detail?.ticket?.reason || "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving data:", formData);
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
                  options={["Decline", "Eskalasi", "Closed"]}
                  value={formData.action}
                  onChange={(value) => handleInputChange("action", value)}
                  placeholder="-- Pilih Action --"
                />
              </div>
            </div>

            {/* Form Unit */}
            <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0">
              <label className="text-sm font-medium text-black whitespace-nowrap">
                Form Unit
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm"
                value={formData.formUnit}
                onChange={(e) => handleInputChange("formUnit", e.target.value)}
                placeholder="Isi Form Unit"
              />
            </div>

            {/* Unit to */}
            <div className="flex items-center space-x-2 min-w-[180px] flex-grow min-w-0">
              <label className="text-sm font-medium text-black whitespace-nowrap">
                Unit to <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={[
                  "BCC - Customer Care", "DGO USER 1 (UIC1)",
                  "BCC - Customer Care / DGO USER 1 (UIC1)", "DGO USER 1 (UIC3)",
                  "DGO USER 1 (UIC6)", "DGO USER 1 (UIC7)",
                  "BCC - Customer Care / DGO USER 1 (UIC8)", "DGO USER 1 (UIC10)",
                  "DGO USER 1 (UIC11)", "Divisi OPR", "Divisi TBS"
                ]}
                value={formData.unitTo}
                onChange={(value) => handleInputChange("unitTo", value)}
                placeholder="-- Pilih Unit --"
              />
            </div>

            {/* Closed Time */}
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

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm font-medium transition-colors duration-200 ml-auto flex-shrink-0"
            >
              Save
            </button>
          </div>

          {/* Solution - muncul kalau action === "Closed" */}
          {formData.action === "Closed" && (
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
        </div>
      </div>
    </div>
  );
};

export default InputForm;
