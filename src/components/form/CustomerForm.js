"use client";
import React, { useEffect, useMemo, useState } from "react";

const CustomerForm = ({ detail, onChange }) => {
  // field statis
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

  const fieldKeyMap = {
    "CIF": "cif",
    "Gender": "gender",
    "Address": "address",
    "Account Number": "accountNumber",
    "Place Of Birth": "placeOfBirth",
    "Billing Address": "billingAddress",
    "Card Number": "cardNumber",
    "Home Phone": "homePhone",
    "Postal Code": "postalCode",
    "Customer Name": "customerName",
    "Handphone": "handphone",
    "Office Phone": "officePhone",
    "Person ID": "personId",
    "Email": "email",
    "Fax Phone": "faxPhone",
    "List Debit Card Number": "listDebitCardNumber",
  };

  // ambil dari detail.customer
  const toInitial = (d = {}) => ({
    cif: d.cif ?? "",
    gender: d.gender ?? "",
    address: d.address ?? "",
    accountNumber: d.accountNumber ?? "",
    placeOfBirth: d.placeOfBirth ?? "",
    billingAddress: d.billingAddress ?? "",
    cardNumber: d.cardNumber ?? "",
    homePhone: d.homePhone ?? "",
    postalCode: d.postalCode ?? "",
    customerName: d.customerName ?? "",
    handphone: d.handphone ?? "",
    officePhone: d.officePhone ?? "",
    personId: d.personId ?? "",
    email: d.email ?? "",
    faxPhone: d.faxPhone ?? "",
    listDebitCardNumber: d.listDebitCardNumber ?? "",
  });

  const [form, setForm] = useState(toInitial(detail?.customer));
  useEffect(() => {
    const next = toInitial(detail?.customer);
    setForm(next);
    onChange?.(next);
  }, [detail?.customer]); // remap saat ganti tiket

  const update = (k, v) => setForm((prev) => { const n = { ...prev, [k]: v }; onChange?.(n); return n; });

  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm";

  const genderOptions = useMemo(() => [
    { label: "Select gender", value: "" },
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
    { label: "Other", value: "OTHER" },
  ], []);

  return (
    <div className="w-full bg-green-100 p-6 mb-6 relative rounded-lg border border-gray-300">
      <div className="bg-green-300 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Customer Info</h2>
      </div>
      <div className="bg-white border-gray-200 p-6 rounded-lg">
        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
          {formData.map((field, idx) => {
            const key = fieldKeyMap[field.label];
            const value = form[key] ?? "";
            return (
              <div key={idx} className="flex flex-col">
                <label className="text-sm text-black font-medium mb-2 whitespace-nowrap">
                  {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === "select" ? (
                  <select className={inputClassName} value={value} onChange={(e) => update(key, e.target.value)}>
                    {genderOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea className={inputClassName + " resize-none overflow-y-auto h-[40px]"} rows={1}
                    value={value} onChange={(e) => update(key, e.target.value)} />
                ) : (
                  <input className={inputClassName} value={value} onChange={(e) => update(key, e.target.value)} />
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
