import React from 'react';

const InputFormRow = () => {
  return (
   <div className="w-full bg-[#B5EFE1] p-4 mb-4">
  <div className="bg-gray-50 border-l-4 border-gray-200 p-3">
    <div className="flex items-center gap-6 w-full">

      {/* Input Type */}
      <div className="flex items-center gap-2 min-w-0 flex-grow">
        <label className="text-xs font-medium text-gray-800 whitespace-nowrap w-24">
          Input Type <span className="text-red-500">*</span>
        </label>
        <div className="relative flex-grow min-w-0">
          <select
            defaultValue="Nasabah"
            className="text-xs px-2 py-1.5 pr-6 border border-gray-300 rounded bg-white text-gray-700 w-full focus:outline-none focus:border-blue-400"
          >
            <option value="Nasabah">Nasabah</option>
            <option value="Corporate">Corporate</option>
            <option value="Agent">Agent</option>
          </select>
          <svg
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Source Type */}
      <div className="flex items-center gap-2 min-w-0 flex-grow">
        <label className="text-xs font-medium text-gray-800 whitespace-nowrap w-24">
          Source Type <span className="text-red-500">*</span>
        </label>
        <div className="relative flex-grow min-w-0">
          <select
            defaultValue="Account"
            className="text-xs px-2 py-1.5 pr-6 border border-gray-300 rounded bg-white text-gray-700 w-full focus:outline-none focus:border-blue-400"
          >
            <option value="Account">Account</option>
            <option value="Phone">Phone</option>
            <option value="Email">Email</option>
            <option value="ID Number">ID Number</option>
          </select>
          <svg
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Number */}
      <div className="flex items-center gap-2 min-w-0 flex-grow">
        <label className="text-xs font-medium text-gray-800 whitespace-nowrap w-24">
          Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          defaultValue="987654321"
          className="text-xs px-2 py-1.5 border border-gray-300 rounded text-gray-700 flex-grow min-w-0 focus:outline-none focus:border-blue-400"
          placeholder="Enter number"
        />
      </div>

      {/* Exp Date */}
      <div className="flex items-center gap-2 min-w-0 flex-grow">
  <label className="text-xs font-medium text-gray-800 whitespace-nowrap w-24">
    Exp Date
  </label>
  <div className="relative flex-grow min-w-0">
    <input
      type="number"
      defaultValue={18}
      min={0}
      max={24}
      step={1}
      className="text-xs px-2 py-1.5 pr-6 border border-gray-300 rounded bg-white text-gray-700 w-full focus:outline-none focus:border-blue-400"
    />
  </div>
</div>

    </div>
  </div>
</div>

  );
};

export default InputFormRow;
