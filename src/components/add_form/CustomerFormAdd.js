"use client";
import React, { useEffect, useMemo, useState } from "react";

const CustomerForm = ({
  detail,
  onChange,
  customerData,
  searchContext,
  inputType,
}) => {
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

// Kunci jika sudah ada data dari hasil search (customerData terisi)
const autoFilled = useMemo(() => {
  return Boolean(customerData && Object.keys(customerData).length > 0);
}, [customerData]);


  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(autoFilled); // kunci otomatis saat hasil search mengisi form
  }, [autoFilled]);

  // Update form when customer data from API changes
  useEffect(() => {
    // Skip API calls for non_nasabah input type
    if (inputType === "non_nasabah") {
      return;
    }
    
    if (customerData) {
      const fetchRelatedData = async () => {
        let accountNumbers = [];
        let cardNumbers = [];
        let accounts = [];

        try {
          console.log("=== DEBUGGING CUSTOMER DATA ===");
          console.log("Customer data:", customerData);
          console.log("Looking for customer_id:", customerData.customer_id);

          // Get authorization token
          const getAccessToken = () => {
            try {
              const raw = localStorage.getItem("auth");
              if (!raw) return "";
              const parsed = JSON.parse(raw);
              const token = parsed?.state?.accessToken || "";
              return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
            } catch {
              return "";
            }
          };

          const headers = {
            Accept: "application/json",
            Authorization: getAccessToken(),
            "ngrok-skip-browser-warning": "true",
          };

          // Fetch accounts for this customer
          const accountResponse = await fetch("/api/v1/account", { headers });
          console.log("Account API response status:", accountResponse.status);
          if (accountResponse.ok) {
            accounts = await accountResponse.json();
            console.log("All accounts from API:", accounts);
            const customerAccounts = accounts.filter((acc) => {
              console.log(
                `Checking account ${acc.account_id}: customer_id ${acc.customer_id} === ${customerData.customer_id}?`,
                acc.customer_id === customerData.customer_id
              );
              return acc.customer_id === customerData.customer_id;
            });
            console.log("Filtered customer accounts:", customerAccounts);

            // Filter based on search context
            if (
              searchContext?.searchType === "account" &&
              searchContext?.searchedNumber
            ) {
              // Only show the searched account number
              accountNumbers = [searchContext.searchedNumber];
            } else if (customerAccounts.length > 0) {
              // Show first account as fallback
              accountNumbers = [customerAccounts[0].account_number];
            } else {
              accountNumbers = [];
            }
            console.log("Final account numbers:", accountNumbers);

            // Fetch cards for this customer's accounts
            const cardResponse = await fetch("/api/v1/card", { headers });
            console.log("Card API response status:", cardResponse.status);
            if (cardResponse.ok) {
              const cards = await cardResponse.json();
              console.log("All cards from API:", cards);

              if (customerAccounts.length > 0) {
                // Get account_ids from customer's accounts
                const customerAccountIds = customerAccounts.map(
                  (acc) => acc.account_id
                );
                console.log(
                  "Customer account IDs to match:",
                  customerAccountIds
                );

                // Filter cards that belong to customer's accounts
                const customerCards = cards.filter((card) => {
                  const belongsToCustomer = customerAccountIds.includes(
                    card.account_id
                  );
                  console.log(
                    `Card ${card.card_number} (account_id: ${card.account_id}) belongs to customer:`,
                    belongsToCustomer
                  );
                  console.log(
                    "Checking if",
                    card.account_id,
                    "is in",
                    customerAccountIds
                  );
                  return belongsToCustomer;
                });
                console.log("Filtered customer cards:", customerCards);

                // Filter based on search context
                if (
                  searchContext?.searchType === "debit" ||
                  searchContext?.searchType === "credit"
                ) {
                  // Only show the searched card number
                  cardNumbers = [searchContext.searchedNumber];
                } else if (
                  searchContext?.searchType === "account" &&
                  searchContext?.searchedNumber
                ) {
                  // For account search, show only the first card related to that specific searched account
                  const searchedAccount = accounts.find(
                    (acc) =>
                      acc.account_number.toString() ===
                      searchContext.searchedNumber
                  );
                  if (searchedAccount) {
                    const relatedCards = cards.filter(
                      (card) => card.account_id === searchedAccount.account_id
                    );
                    cardNumbers =
                      relatedCards.length > 0
                        ? [relatedCards[0].card_number]
                        : [];
                  }
                } else if (customerCards.length > 0) {
                  // Show first card as fallback
                  cardNumbers = [customerCards[0].card_number];
                } else {
                  cardNumbers = [];
                }
                console.log("Final card numbers:", cardNumbers);
              } else {
                console.log("No customer accounts found, skipping card lookup");
              }
            }
          }
          console.log("=== END DEBUGGING ===");
        } catch (error) {
          console.error("Error fetching related data:", error);
        }

        const mappedData = {
          cif: customerData.cif || "",
          gender: customerData.gender_type || "",
          address: customerData.address || "",
          accountNumber: accountNumbers.join(", ") || "",
          placeOfBirth: customerData.place_of_birth || "",
          billingAddress: customerData.billing_address || "",
          cardNumber: cardNumbers.join(", ") || "",
          homePhone: customerData.home_phone || "",
          postalCode: customerData.postal_code || "",
          customerName: customerData.full_name || "",
          handphone: customerData.phone_number || "",
          officePhone: customerData.office_phone || "",
          personId: customerData.nik || "",
          email: customerData.email || "",
          faxPhone: customerData.fax_phone || "",
        };
        const newFormData = { ...form, ...mappedData };
        setForm(newFormData);
        onChange?.(newFormData);
      };

      fetchRelatedData();
    } else {
      // Reset form when customerData is null (after reset)
      const resetData = toInitial({});
      setForm(resetData);
      onChange?.(resetData);
    }
  }, [customerData, inputType]);

  // const update = (k, v) => setForm((prev) => { const n = { ...prev, [k]: v }; onChange?.(n); return n; });

  const update = (k, v) =>
    setForm((prev) => {
      if (!inputType || inputType !== "non_nasabah") return prev;
      const n = { ...prev, [k]: v };
      onChange?.(n);
      return n;
    });

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
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
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
                        inputClassName +
                        " resize-none overflow-y-auto h-[40px]" +
                        fieldBgClass
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
