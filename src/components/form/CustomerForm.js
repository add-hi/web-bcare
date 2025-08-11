import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react"; // ikon panah atas-bawah

const InputForm = () => {
  const formData = [
    { label: "CIF" },
    { label: "Gender", type: "select", required: true },
    { label: "Address", type: "textarea", required: true },
    { label: "Account Number" },
    { label: "Place Of Birth" },
    { label: "Billing Address", type: "textarea", required: false },
    { label: "Card Number" },
    { label: "Home Phone", required: true  },
    { label: "Postal Code" },
    { label: "Customer Name", required: true },
    { label: "Handphone", required: true },
    { label: "Office Phone" },
    { label: "Person ID" },
    { label: "Email" },
    { label: "Fax Phone" },
    { label: "List Debit Card Number" }
  ];

  return (
    <div className="w-full bg-[#CBE3BA] p-4 mb-4 relative rounded-md border border-gray-300">
      {/* Header */}

      {/* <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#c55a11] text-white font-semibold px-6 py-1 rounded shadow">
        No. Tiket:
      </div> */}

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
                <div className="relative w-full flex items-center">
                  <textarea
                    className="w-full text-sm border border-gray-300 focus:ring-0 bg-gray-100 text-black resize-none overflow-y-auto pr-6"
                    rows={2}
                  />
                  
                </div>
              ) : (
                <input
                  className="w-full text-sm border border-gray-300 focus:ring-0 bg-gray-100 text-black"
                  readOnly={false}
                />
              )}
            </div>
          </div>
        ))}
        
      </div>
    </div>
  );
};

export default InputForm;
