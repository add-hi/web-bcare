"use client";

import React, { useState } from "react";

const InputFormRow = () => {
  const [inputType, setInputType] = useState("");
  const [sourceType, setSourceType] = useState("");

  const sourceOptions = {
    nasabah: [
      { value: "account", label: "Account" },
      { value: "debit", label: "Debit Card" },
      { value: "credit", label: "Credit Card" },
    ],
    non_nasabah: [],
  };

  const getNumberLabel = () => {
    switch (sourceType) {
      case "account":
        return "Number";
      case "debit":
        return "Debit Card Number";
      case "credit":
        return "Credit Card Number";
      default:
        return "Number";
    }
  };

  return (
    <div className="w-full bg-[#B5EFE1] p-4 mb-4 mt-1 rounded-md">
      <div className="bg-gray-50 border-l-4 border-gray-200 p-4">
        <div className="flex gap-6 items-center">

          {/* Input Type */}
          <div className="flex items-center min-w-[220px]">
            <label className="text-xs font-medium text-gray-800 w-28 whitespace-nowrap">
              Input Type <span className="text-red-500">*</span>
            </label>
            <select
              value={inputType}
              onChange={(e) => {
                setInputType(e.target.value);
                setSourceType("");
              }}
              className="text-xs px-3 py-2 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:border-blue-400 flex-grow"
            >
              <option value="" disabled>
                -- Select Input Type --
              </option>
              <option value="nasabah">Nasabah</option>
              <option value="non_nasabah">Non Nasabah</option>
            </select>
          </div>

          {/* Source Type */}
          <div className="flex items-center min-w-[220px]">
            <label className="text-xs font-medium text-gray-800 w-28 whitespace-nowrap">
              Source Type <span className="text-red-500">*</span>
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              disabled={!inputType}
              className="text-xs px-3 py-2 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:border-blue-400 flex-grow"
            >
              <option value="" disabled>
                -- Select Source Type --
              </option>
              {sourceOptions[inputType]?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Number */}
          <div className="flex items-center flex-grow min-w-[240px]">
            <label className="text-xs font-medium text-gray-800 w-36 whitespace-nowrap">
              {getNumberLabel()} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={`Enter ${getNumberLabel()}`}
              className="text-xs px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:border-blue-400 flex-grow"
            />
          </div>

          {/* Exp Date */}
          <div className="flex items-center min-w-[140px]">
            <label className="text-xs font-medium text-gray-800 w-28 whitespace-nowrap">
              Exp Date
            </label>
            <input
              type="number"
              min={0}
              max={24}
              step={1}
              className="text-xs px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:border-blue-400 flex-grow"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default InputFormRow;
