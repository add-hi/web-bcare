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
    { label: "Description", required: true },
  ];

  return (
    <div className="w-full bg-orange-100 rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      {/* Header */}
      <div className="bg-orange-500 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Data</h2>
      </div>

      {/* Form grid */}
      <div className="w-full bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-3 gap-6">
          {formData.map((field, index) => (
            <div key={index} className="flex items-center gap-4">
              {/* Label */}
              <label
                className="w-1/3 text-sm font-medium text-black select-none"
                htmlFor={`field-${index}`}
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* Input wrapper */}
              <div className="w-2/3">
                {field.type === "select" ? (
                  <select
                    id={`field-${index}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    <option value="">-- Select --</option>
                    {/* Kamu bisa tambah opsi sesuai kebutuhan */}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={`field-${index}`}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none overflow-y-auto text-black"
                  />
                ) : field.type === "date" ? (
                  <input
                    id={`field-${index}`}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black"
                  />
                ) : (
                  <input
                    id={`field-${index}`}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black"
                    readOnly={false}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InputForm;
