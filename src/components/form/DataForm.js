import React from "react";

const InputForm = () => {
  const formData = [
    { label: "Service", type: "select", required: true },
    { label: "Priority", type: "select" },
    { label: "Record", type: "textarea" },
    { label: "Channel", type: "select", required: true },
    { label: "Source", type: "select", required: true },
    { label: "Nominal" },
    { label: "Category", type: "select", required: true },
    { label: "Transaction Date", type: "date" },
    { label: "Commited Date", type: "date", required: true },
    { label: "Created Time", type: "date" },
    { label: "ID Terminal ATM" },
    { label: "SLA", required: true },
    { label: "Description", required: true }
  ];

  return (
    <div className="w-full bg-[#FECBA3] p-4 mb-4 relative rounded-md border border-gray-300">
      {/* Header */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 
        bg-[#c55a11] text-white font-semibold px-6 py-1 rounded shadow 
        w-[200px] text-center">
        Data
      </div>

      {/* Form grid */}
      <div className="grid grid-cols-3 mt-6">
        {formData.map((field, index) => (
          <div key={index} className="flex w-full h-12">
            {/* Label */}
            <div className="bg-[#D9D9D9] px-2 w-1/3 text-sm flex items-center border border-gray-300 text-black">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </div>

            {/* Input wrapper */}
            <div className="bg-gray-100 w-2/3 flex items-center px-2">
              {field.type === "select" ? (
                <select className="w-full text-sm border border-gray-300 focus:ring-0 bg-gray-100 text-black" />
              ) : field.type === "textarea" ? (
                <textarea
                  className="w-full text-sm border border-gray-300 focus:ring-0 bg-gray-100 text-black resize-none overflow-y-auto pr-6"
                  rows={2}
                />
              ) : field.type === "date" ? (
                <input
                  type="date"
                  className="w-full text-sm border border-gray-300 focus:ring-0 bg-gray-100 text-black"
                />
              ) : (
                <input
                  type="text"
                  className="w-full text-sm border border-gray-300 focus:ring-0 bg-gray-100 text-black"
                  readOnly={false}
                />
              )}
            </div>
          </div>
        ))}
      </div>

        {/* Keterangan Data */}
    <div className="w-full bg-white p-4 mb-4 relative rounded-md border border-gray-300 min-h-[100px] mt-6">
      
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 
        bg-[#c55a11] text-white font-semibold px-6 py-1 rounded shadow 
        w-[200px] text-center">
        Keterangan Data
      </div>
      </div>
    </div>
  );
};

export default InputForm;
