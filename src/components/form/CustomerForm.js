import React from "react";

const InputForm = () => {
  const formData = [
    { label: "CIF" },
    { label: "Gender", type: "select", required: true },
    { label: "Address", type: "textarea", required: true },
    { label: "Account Number" },
    { label: "Place Of Birth" },
    { label: "Billing Address", type: "textarea", required: false },
    { label: "Card Number" },
    { label: "Home Phone", required: true },
    { label: "Postal Code" },
    { label: "Customer Name", required: true },
    { label: "Handphone", required: true },
    { label: "Office Phone" },
    { label: "Person ID" },
    { label: "Email" },
    { label: "Fax Phone" },
    { label: "List Debit Card Number" },
  ];

  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm";

  return (
    <div className="w-full bg-[#CBE3BA] p-4 mb-4 relative rounded-lg border border-gray-300">
      <div className="bg-white border-gray-200 p-4 rounded-lg">

      <div className="grid grid-cols-3 gap-4 mt-6">
        {formData.map((field, index) => (
          <div key={index} className="flex items-center w-full min-h-[48px]">
            {/* Label tanpa kotak abu */}
            <label className="w-1/3 text-sm text-black font-medium whitespace-nowrap pr-3">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Input langsung, tanpa wrapper kotak putih */}
            {field.type === "select" ? (
              <select className={inputClassName} />
            ) : field.type === "textarea" ? (
              <textarea
                className={inputClassName + " resize-none overflow-y-auto"}
                rows={2}
              />
            ) : (
              <input className={inputClassName} readOnly={false} />
            )}
          </div>
        ))}
      </div>
      </div>
      {/* Form grid */}
    </div>
  );
};

export default InputForm;
