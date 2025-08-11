import React from 'react';

const InputFormRow = () => {
  return (
    <div className="w-full bg-teal-100 p-4 rounded">
      {/* Kotak putih utama dengan border dan shadow */}
      <div className="bg-white border border-gray-300 rounded shadow p-4 flex items-center gap-6">
        {/* Input Type */}
        <div className="flex flex-col min-w-[130px] border border-gray-300 rounded p-2">
          <label className="text-xs font-medium text-gray-800 whitespace-nowrap mb-1">
            Input Type <span className="text-red-500">*</span>
          </label>
          <select
            defaultValue="Nasabah"
            className="text-xs px-2 py-1.5 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:border-blue-400"
          >
            <option value="Nasabah">Nasabah</option>
            <option value="Corporate">Corporate</option>
            <option value="Agent">Agent</option>
          </select>
        </div>

        {/* Source Type */}
        <div className="flex flex-col min-w-[130px] border border-gray-300 rounded p-2">
          <label className="text-xs font-medium text-gray-800 whitespace-nowrap mb-1">
            Source Type <span className="text-red-500">*</span>
          </label>
          <select
            defaultValue="Account"
            className="text-xs px-2 py-1.5 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:border-blue-400"
          >
            <option value="Account">Account</option>
            <option value="Phone">Phone</option>
            <option value="Email">Email</option>
            <option value="ID Number">ID Number</option>
          </select>
        </div>

        {/* Number */}
        <div className="flex flex-col min-w-[140px] border border-gray-300 rounded p-2">
          <label className="text-xs font-medium text-gray-800 whitespace-nowrap mb-1">
            Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            defaultValue="987654321"
            className="text-xs px-2 py-1.5 border border-gray-300 rounded text-gray-700 focus:outline-none focus:border-blue-400"
            placeholder="Enter number"
          />
        </div>

        {/* Exp Date */}
        <div className="flex flex-col min-w-[160px] border border-gray-300 rounded p-2">
          <label className="text-xs font-medium text-gray-800 whitespace-nowrap mb-1">
            Exp Date
          </label>
          <select
            defaultValue="yyyy/MM dd/mm(18:01)"
            className="text-xs px-2 py-1.5 border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:border-blue-400"
          >
            <option value="yyyy/MM dd/mm(18:01)">yyyy/MM dd/mm(18:01)</option>
            <option value="yyyy/MM dd/mm(12:00)">yyyy/MM dd/mm(12:00)</option>
            <option value="yyyy/MM dd/mm(24:00)">yyyy/MM dd/mm(24:00)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default InputFormRow;
