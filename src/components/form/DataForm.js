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

  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm";

  return (
    <div className="w-full bg-orange-100 p-6 mb-6 relative rounded-lg border border-gray-300">
      <div className="bg-orange-500 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Data</h2>
      </div>

      <div className="bg-white border-gray-200 p-6 rounded-lg">
        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
          {formData.map((field, index) => (
            <div key={index} className="flex flex-col">
              {/* Label */}
              <label className="text-sm text-black font-medium mb-2 whitespace-nowrap" htmlFor={`field-${index}`}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* Input */}
              {field.type === "select" ? (
                <select id={`field-${index}`} className={inputClassName}>
                  <option value="">-- Select --</option>
                  {/* Tambah opsi di sini jika perlu */}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  id={`field-${index}`}
                  className={inputClassName + " resize-none overflow-y-auto h-[40px]"}
                  rows={1}
                />
              ) : field.type === "date" ? (
                <input
                  id={`field-${index}`}
                  type="date"
                  className={inputClassName}
                />
              ) : (
                <input
                  id={`field-${index}`}
                  type="text"
                  className={inputClassName}
                  readOnly={false}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InputForm;
