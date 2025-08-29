"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import useCustomerSearch from "@/hooks/useCustomerSearch";

const CustomerForm = ({
  detail,
  onChange,
  customerData,
  searchContext,
  inputType,
  reset, // boolean
}) => {
  const { processCustomerData } = useCustomerSearch();

  // --- definisi field ---
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
    CIF: "cif",
    Gender: "gender",
    Address: "address",
    "Account Number": "accountNumber",
    "Place Of Birth": "placeOfBirth",
    "Billing Address": "billingAddress",
    "Card Number": "cardNumber",
    "Home Phone": "homePhone",
    "Postal Code": "postalCode",
    "Customer Name": "customerName",
    Handphone: "handphone",
    "Office Phone": "officePhone",
    "Person ID": "personId",
    Email: "email",
    "Fax Phone": "faxPhone",
    "List Debit Card Number": "listDebitCardNumber",
  };

  // --- helpers ---
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

  const jsonEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const [form, setForm] = useState(toInitial(detail?.customer));
  const autoFilled = useMemo(
    () => Boolean(customerData && Object.keys(customerData).length > 0),
    [customerData]
  );
  const [locked, setLocked] = useState(false);

  // Flag untuk "programmatic updates" (reset/prefill) supaya tidak memanggil onChange
  const silentRef = useRef(false);

  // --- RESET: kosongkan form SEKALI saat reset=true, tanpa trigger onChange ---
  useEffect(() => {
    if (!reset) return;
    const cleared = toInitial({});
    if (!jsonEq(form, cleared)) {
      silentRef.current = true;
      setForm(cleared);
      setLocked(false);
      // TIDAK panggil onChange di sini agar tidak memicu loop ke parent
      silentRef.current = false;
    } else {
      setLocked(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]); // cukup tergantung reset

  // --- LOCK mengikuti autoFilled, tapi jangan meng-influence reset ---
  useEffect(() => {
    if (reset) {
      setLocked(false);
    } else {
      setLocked(autoFilled);
    }
  }, [autoFilled, reset]);

  // --- PREFILL dari detail (silent) ---
  useEffect(() => {
    if (reset) return; // saat reset aktif, jangan override kosong
    const next = toInitial(detail?.customer);
    if (!jsonEq(form, next)) {
      silentRef.current = true;
      setForm(next);
      // silent: tidak panggil onChange
      silentRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.customer, reset]);

  // --- PREFILL dari customerData (silent), tetap jalan setelah reset ---
  useEffect(() => {
    if (inputType === "non_nasabah") return; // non_nasabah = manual input

    // Jika customerData kosong -> kosongkan form (silent)
    if (!customerData || Object.keys(customerData).length === 0) {
      const empty = toInitial({});
      if (!jsonEq(form, empty)) {
        silentRef.current = true;
        setForm(empty);
        silentRef.current = false;
      }
      return;
    }

    // Map & isi (silent)
    const mapped = processCustomerData(customerData, searchContext) || {};
    const next = { ...toInitial({}), ...mapped };
    if (!jsonEq(form, next)) {
      silentRef.current = true;
      setForm(next);
      // silent: tidak panggil onChange
      silentRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerData, searchContext, inputType, processCustomerData]);

  // --- UPDATE oleh user (hanya non_nasabah), ini yang BUKAN silent ---
  const update = (k, v) =>
    setForm((prev) => {
      if (!inputType || inputType !== "non_nasabah") return prev;
      const n = { ...prev, [k]: v };
      if (!silentRef.current) {
        onChange?.(n); // hanya kirim ke parent saat user mengetik
      }
      return n;
    });

  // --- UI ---
  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm";

  const genderOptions = useMemo(
    () => [
      { label: "Select gender", value: "" },
      { label: "Male", value: "MALE" },
      { label: "Female", value: "FEMALE" },
    ],
    []
  );

  return (
    <div className="w-full bg-green-100 p-6 mb-6 relative rounded-lg border border-gray-300">
      <div className="bg-green-300 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Customer Info</h2>
      </div>

      <div className={inputType !== "non_nasabah" && locked ? "opacity-75" : ""}>
        <div className="bg-white border-gray-200 p-6 rounded-lg">
          <div className="grid grid-cols-3 gap-x-6 gap-y-5">
            {formData.map((field, idx) => {
              const key = fieldKeyMap[field.label];
              const value = form[key] ?? "";
              const isDisabled = !inputType || inputType !== "non_nasabah";
              const fieldBgClass = isDisabled ? " bg-gray-100" : "";

              return (
                <div key={idx} className="flex flex-col">
                  <label className="text-sm text-black font-medium mb-2 whitespace-nowrap">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === "select" ? (
                    <select
                      className={inputClassName + fieldBgClass}
                      value={value}
                      onChange={(e) => update(key, e.target.value)}
                      disabled={isDisabled}
                    >
                      {genderOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      className={
                        inputClassName + " resize-none overflow-y-auto h-[40px]" + fieldBgClass
                      }
                      rows={1}
                      value={value}
                      onChange={(e) => update(key, e.target.value)}
                      disabled={isDisabled}
                    />
                  ) : (
                    <input
                      className={inputClassName + fieldBgClass}
                      value={value}
                      onChange={(e) => update(key, e.target.value)}
                      disabled={isDisabled}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
