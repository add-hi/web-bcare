import React from "react";

const CustomerForm = ({ detail }) => {
  const getFieldValue = (label) => {
    if (!detail?.customer) return "";
    const c = detail.customer;
    const map = {
      CIF: c.cif,
      Gender: c.gender,
      Address: c.address,
      "Account Number": c.accountNumber,
      "Place Of Birth": c.placeOfBirth,
      "Billing Address": c.billingAddress,
      "Card Number": c.cardNumber,
      "Home Phone": c.homePhone,
      "Postal Code": c.postalCode,
      "Customer Name": c.customerName,
      Handphone: c.handphone,
      "Office Phone": c.officePhone,
      "Person ID": c.personId,
      Email: c.email,
      "Fax Phone": c.faxPhone,
      "List Debit Card Number": c.listDebitCardNumber,
    };
    return map[label] ?? "";
  };

  // Tambahkan hint untuk span kolom responsif.
  const formData = [
    { label: "CIF" },
    { label: "Gender", type: "select", required: true },
    { label: "Address", type: "textarea", required: true, wide: true },
    { label: "Account Number" },
    { label: "Place Of Birth" },
    { label: "Billing Address", type: "textarea", required: false, wide: true },
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

  const inputBase =
    "w-full px-3 py-2 border border-gray-300 rounded outline-none text-black text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50";

  return (
    <div className="w-full bg-green-100 p-4 sm:p-5 lg:p-6 mb-6 relative rounded-lg border border-gray-300">
      <div className="-m-4 sm:-m-5 lg:-m-6 mb-6 bg-green-300 text-white text-center py-2 px-4 rounded-t-lg">
        <h2 className="text-base sm:text-lg font-semibold">Customer Info</h2>
      </div>

      <div className="bg-white border border-gray-200 p-4 sm:p-6 lg:p-6 rounded-lg">
        {/* Grid responsif: 1 col (mobile), 2 col (tablet), 3 col (desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-5">
          {formData.map((field, idx) => {
            // Textarea melebar: full di mobile, 2 kolom di sm, kembali 1 kolom di lg (supaya desktop existing)
            const spanClass = field.wide
              ? "col-span-1 sm:col-span-2 lg:col-span-1"
              : "col-span-1";

            return (
              <div key={idx} className={`flex flex-col ${spanClass} min-w-0`}>
                {/* Label (boleh wrap) */}
                <label className="text-xs sm:text-sm text-black font-medium mb-2 break-words">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                {/* Input */}
                {field.type === "select" ? (
                  <select
                    className={inputBase}
                    value={getFieldValue(field.label)}
                    disabled
                    aria-readonly="true"
                  >
                    <option>{getFieldValue(field.label) || "-"}</option>
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    className={`${inputBase} min-h-10 sm:min-h-[52px] break-words`}
                    rows={2}
                    value={getFieldValue(field.label)}
                    readOnly
                  />
                ) : (
                  <input
                    className={inputBase}
                    value={getFieldValue(field.label)}
                    readOnly
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;