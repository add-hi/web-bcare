import React from "react";

const CustomerForm = ({ detail }) => {
  const getFieldValue = (label) => {
    if (!detail?.customer) return "";
    const fieldMap = {
      "CIF": detail.customer.cif,
      "Gender": detail.customer.gender,
      "Address": detail.customer.address,
      "Account Number": detail.customer.accountNumber,
      "Place Of Birth": detail.customer.placeOfBirth,
      "Billing Address": detail.customer.billingAddress,
      "Card Number": detail.customer.cardNumber,
      "Home Phone": detail.customer.homePhone,
      "Postal Code": detail.customer.postalCode,
      "Customer Name": detail.customer.customerName,
      "Handphone": detail.customer.handphone,
      "Office Phone": detail.customer.officePhone,
      "Person ID": detail.customer.personId,
      "Email": detail.customer.email,
      "Fax Phone": detail.customer.faxPhone,
      "List Debit Card Number": detail.customer.listDebitCardNumber,
    };
    return fieldMap[label] || "";
  };

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
    <div className="w-full bg-green-100 p-6 mb-6 relative rounded-lg border border-gray-300">

      <div className="bg-green-300 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Customer Info</h2>
      </div>
      <div className="bg-white border-gray-200 p-6 rounded-lg">
        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
          {formData.map((field, index) => (
            <div key={index} className="flex flex-col">
              {/* Label */}
              <label className="text-sm text-black font-medium mb-2 whitespace-nowrap">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* Input */}
              {field.type === "select" ? (
                <select className={inputClassName} value={getFieldValue(field.label)} readOnly>
                  <option>{getFieldValue(field.label)}</option>
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  className={inputClassName + " resize-none overflow-y-auto h-[40px]"}
                  rows={1}
                  value={getFieldValue(field.label)}
                  readOnly
                />
              ) : (
                <input className={inputClassName} value={getFieldValue(field.label)} readOnly />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;