"use client";
import React, { useEffect, useMemo, useState } from "react";

const CustomerForm = ({ detail, onChange, customerData, searchContext, inputType }) => {
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
  
  // Update form when customer data from API changes
  useEffect(() => {
    if (customerData) {
      const fetchRelatedData = async () => {
        let accountNumbers = [];
        let cardNumbers = [];
        let accounts = [];
        
        try {
          console.log('=== DEBUGGING CUSTOMER DATA ===');
          console.log('Customer data:', customerData);
          console.log('Looking for customer_id:', customerData.customer_id);
          
          // Fetch accounts for this customer
          const accountResponse = await fetch('/api/v1/account');
          console.log('Account API response status:', accountResponse.status);
          if (accountResponse.ok) {
            accounts = await accountResponse.json();
            console.log('All accounts from API:', accounts);
            const customerAccounts = accounts.filter(acc => {
              console.log(`Checking account ${acc.account_id}: customer_id ${acc.customer_id} === ${customerData.customer_id}?`, acc.customer_id === customerData.customer_id);
              return acc.customer_id === customerData.customer_id;
            });
            console.log('Filtered customer accounts:', customerAccounts);
            
            // Filter based on search context
            if (searchContext?.searchType === 'account') {
              // Only show the searched account number
              accountNumbers = [searchContext.searchedNumber];
            } else {
              // Show all account numbers for card searches
              accountNumbers = customerAccounts.map(acc => acc.account_number);
            }
            console.log('Final account numbers:', accountNumbers);
            
            // Fetch cards for this customer's accounts
            const cardResponse = await fetch('/api/v1/card');
            console.log('Card API response status:', cardResponse.status);
            if (cardResponse.ok) {
              const cards = await cardResponse.json();
              console.log('All cards from API:', cards);
              
              if (customerAccounts.length > 0) {
                // Get account_ids from customer's accounts
                const customerAccountIds = customerAccounts.map(acc => acc.account_id);
                console.log('Customer account IDs to match:', customerAccountIds);
                
                // Filter cards that belong to customer's accounts
                const customerCards = cards.filter(card => {
                  const belongsToCustomer = customerAccountIds.includes(card.account_id);
                  console.log(`Card ${card.card_number} (account_id: ${card.account_id}) belongs to customer:`, belongsToCustomer);
                  console.log('Checking if', card.account_id, 'is in', customerAccountIds);
                  return belongsToCustomer;
                });
                console.log('Filtered customer cards:', customerCards);
                
                // Filter based on search context
                if (searchContext?.searchType === 'debit' || searchContext?.searchType === 'credit') {
                  // Only show the searched card number
                  cardNumbers = [searchContext.searchedNumber];
                } else if (searchContext?.searchType === 'account') {
                  // For account search, show cards related to that specific account
                  const searchedAccount = customerAccounts.find(acc => acc.account_number.toString() === searchContext.searchedNumber);
                  if (searchedAccount) {
                    const relatedCards = customerCards.filter(card => card.account_id === searchedAccount.account_id);
                    cardNumbers = relatedCards.map(card => card.card_number);
                  }
                } else {
                  // Show all card numbers
                  cardNumbers = customerCards.map(card => card.card_number);
                }
                console.log('Final card numbers:', cardNumbers);
              } else {
                console.log('No customer accounts found, skipping card lookup');
              }
            }
          }
          console.log('=== END DEBUGGING ===');
        } catch (error) {
          console.error('Error fetching related data:', error);
        }
        
        const mappedData = {
          cif: customerData.cif || "",
          gender: customerData.gender_type || "",
          address: customerData.address || "",
          accountNumber: accountNumbers.join(', ') || "",
          placeOfBirth: customerData.place_of_birth || "",
          billingAddress: customerData.billing_address || "",
          cardNumber: cardNumbers.join(', ') || "",
          homePhone: customerData.home_phone || "",
          postalCode: customerData.postal_code || "",
          customerName: customerData.full_name || "",
          handphone: customerData.phone_number || "",
          officePhone: customerData.office_phone || "",
          personId: customerData.nik || "",
          email: customerData.email || "",
          faxPhone: customerData.fax_phone || "",
        };
        setForm(prev => ({ ...prev, ...mappedData }));
        onChange?.({ ...form, ...mappedData });
      };
      
      fetchRelatedData();
    } else {
      // Reset form when customerData is null (after reset)
      const resetData = toInitial({});
      setForm(resetData);
      onChange?.(resetData);
    }
  }, [customerData]);

  const update = (k, v) => setForm((prev) => { const n = { ...prev, [k]: v }; onChange?.(n); return n; });

  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm";

  const genderOptions = useMemo(() => [
    { label: "Select gender", value: "" },
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
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
                  customerData ? (
                    <input 
                      className={inputClassName + ' bg-gray-100'} 
                      value={value} 
                      readOnly
                    />
                  ) : (
                    <select className={inputClassName} value={value} onChange={(e) => update(key, e.target.value)}>
                      {genderOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  )
                ) : field.type === "textarea" ? (
                  <textarea 
                    className={inputClassName + " resize-none overflow-y-auto h-[40px]" + (customerData ? ' bg-gray-100' : '')} 
                    rows={1}
                    value={value} 
                    onChange={(e) => update(key, e.target.value)}
                    readOnly={customerData && ['address', 'billingAddress'].includes(key)}
                  />
                ) : (
                  <input 
                    className={inputClassName + (customerData ? ' bg-gray-100' : '')} 
                    value={value} 
                    onChange={(e) => update(key, e.target.value)}
                    readOnly={inputType === 'nasabah' && customerData && ['cif', 'customerName', 'email', 'handphone', 'address', 'personId', 'homePhone', 'officePhone', 'faxPhone', 'postalCode', 'placeOfBirth', 'billingAddress', 'accountNumber', 'cardNumber'].includes(key)}
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
