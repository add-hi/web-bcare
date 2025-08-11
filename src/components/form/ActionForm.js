"use client";

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const InputForm = () => {
  const [formData, setFormData] = useState({
    action: '',    // kosong
    formUnit: '',  // kosong
    unitTo: '',    // kosong
    closedTime: '',// kosong
    solution: ''   // tambahan untuk solution
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving data:', formData);
  };

  return (
    <div className="w-full bg-[#52CE68] p-4 mb-4 relative rounded-md border border-gray-300 mt-6">
      {/* Header */}
      <div
        className="absolute -top-4 left-1/2 transform -translate-x-1/2 
        bg-[#c55a11] text-white font-semibold px-6 py-1 rounded shadow 
        w-[200px] text-center"
      >
        Action
      </div>

      <div className="bg-gray-100 p-1 border border-gray-300 text-black mt-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Action */}
          <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0">
            <label className="text-sm font-medium text-black whitespace-nowrap">Action</label>
            <select
              className="border border-gray-300 rounded px-3 py-1 bg-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
              value={formData.action}
              onChange={(e) => handleInputChange('action', e.target.value)}
            >
              <option value="" disabled>-- Pilih Action --</option>
              <option value="Decline">Decline</option>
              <option value="Eskalasi">Eskalasi</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Form Unit */}
          <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0">
            <label className="text-sm font-medium text-black whitespace-nowrap">Form Unit</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-1 bg-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
              value={formData.formUnit}
              onChange={(e) => handleInputChange('formUnit', e.target.value)}
              placeholder="Isi Form Unit"
            />
          </div>

          {/* Unit to */}
          <div className="flex items-center space-x-2 min-w-[180px] flex-grow min-w-0">
            <label className="text-sm font-medium text-black whitespace-nowrap">
              Unit to <span className="text-red-500">*</span>
            </label>
            <select
              className="border border-gray-300 rounded px-3 py-1 bg-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
              value={formData.unitTo}
              onChange={(e) => handleInputChange('unitTo', e.target.value)}
            >
              <option value="" disabled>-- Pilih Unit --</option>
              {/* nanti option bisa dari DB */}
            </select>
          </div>

          {/* Closed Time */}
          <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0">
            <label className="text-sm font-medium text-black whitespace-nowrap">Closed Time</label>
            <input
              type="date"
              className="border border-gray-300 rounded px-3 py-1 bg-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8 text-black"
              value={formData.closedTime}
              onChange={(e) => handleInputChange('closedTime', e.target.value)}
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

        {/* Solution - hanya muncul kalau action === "Closed" */}
        {formData.action === 'Closed' && (
          <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0 mt-3">
            <label className="text-sm font-medium text-black whitespace-nowrap">Solution</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-1 bg-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
              value={formData.solution}
              onChange={(e) => handleInputChange('solution', e.target.value)}
              placeholder="Isi Solution"
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default InputForm;
