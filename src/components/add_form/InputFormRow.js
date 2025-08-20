"use client";

import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const InputFormRow = forwardRef(({ onCustomerData }, ref) => {
  const [inputType, setInputType] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [expDate, setExpDate] = useState("");
  const [numberValue, setNumberValue] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const sourceOptions = {
    nasabah: [
      { value: "account", label: "Account" },
      { value: "debit", label: "Debit Card" },
      { value: "credit", label: "Credit Card" },
    ],
    non_nasabah: [],
  };

  const showExp = sourceType === "debit" || sourceType === "credit";

  // Bersihin expDate kalau bukan debit/credit
  useEffect(() => {
    if (!showExp) setExpDate("");
  }, [showExp]);

  const fetchCustomerData = async () => {
    if (!numberValue.trim()) return;
    
    setLoading(true);
    try {
      let customerId = null;
      
      if (sourceType === 'account') {
        // Search in accounts
        const accountResponse = await fetch(`/api/v1/account`);
        if (accountResponse.ok) {
          const accounts = await accountResponse.json();
          const account = accounts.find(acc => acc.account_number.toString() === numberValue.trim());
          if (account) {
            customerId = account.customer_id;
          }
        }
      } else if (sourceType === 'debit' || sourceType === 'credit') {
        // Search in cards with proper type validation
        const cardResponse = await fetch(`/api/v1/card`);
        if (cardResponse.ok) {
          const cards = await cardResponse.json();
          console.log('All cards:', cards);
          console.log('Looking for card number:', numberValue.trim());
          console.log('Expected card type:', sourceType.toUpperCase());
          
          const card = cards.find(c => {
            const cardNumberMatch = c.card_number.toString() === numberValue.trim();
            // Handle different card type naming: credit -> KREDIT, debit -> DEBIT
            const expectedType = sourceType === 'credit' ? 'KREDIT' : sourceType.toUpperCase();
            const cardTypeMatch = c.card_type.toUpperCase() === expectedType;
            
            // Exp date validation - if expDate is filled, it must match
            let expDateMatch = true;
            if (expDate.trim()) {
              expDateMatch = c.exp_date === expDate.trim();
              console.log(`Exp date check: ${c.exp_date} === ${expDate.trim()} = ${expDateMatch}`);
            }
            
            console.log(`Card ${c.card_number}: number=${cardNumberMatch}, type=${cardTypeMatch}, exp=${expDateMatch}`);
            return cardNumberMatch && cardTypeMatch && expDateMatch;
          });
          
          console.log('Found card:', card);
          
          if (card) {
            // Get account to find customer_id
            const accountResponse = await fetch(`/api/v1/account`);
            if (accountResponse.ok) {
              const accounts = await accountResponse.json();
              const account = accounts.find(acc => acc.account_id === card.account_id);
              if (account) {
                customerId = account.customer_id;
              }
            }
          }
        }
      }
      
      if (customerId) {
        // Fetch customer data
        const customerResponse = await fetch(`/api/v1/customer`);
        if (customerResponse.ok) {
          const customers = await customerResponse.json();
          const customer = customers.find(c => c.customer_id === customerId);
          if (customer) {
            setCustomerData(customer);
            setIsReadOnly(true);
            const searchContext = {
              searchedNumber: numberValue.trim(),
              searchType: sourceType
            };
            onCustomerData?.(customer, searchContext, inputType);
          } else {
            alert('Customer data not found');
          }
        } else {
          alert('Error fetching customer data');
        }
      } else {
        alert('Number not found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerData(null);
    setIsReadOnly(false);
    setNumberValue("");
    setExpDate("");
    setInputType("");
    setSourceType("");
    onCustomerData?.(null, null, "");
  };

  useEffect(() => {
    if (inputType && sourceType) {
      // Only reset customer data when both are selected, not on individual changes
      setCustomerData(null);
      setIsReadOnly(false);
      setNumberValue("");
      setExpDate("");
      onCustomerData?.(null, null, inputType);
    }
  }, [inputType, sourceType]);

  const getNumberLabel = () => {
    switch (sourceType) {
      case "account":
        return "Number";
      case "debit":
        return "Debit Card Number";
      case "credit":
        return "Credit Card Number";
      default:
        return "Number";
    }
  };

  useImperativeHandle(ref, () => ({
    resetForm
  }));

  return (
    <div className="w-full bg-[#B5EFE1] p-4 mb-4 mt-1 rounded-lg">
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        {/* Layout dengan button selalu di posisi yang sama */}
        <div className="flex gap-6 items-end">
          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-800 mb-2">
              Input Type<span className="text-red-500">*</span>
            </label>
            <select
              value={inputType}
              onChange={(e) => {
                setInputType(e.target.value);
                setSourceType("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              <option value="" disabled>Select Input Type</option>
              <option value="nasabah">Nasabah</option>
              <option value="non_nasabah">Non Nasabah</option>
            </select>
          </div>

          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-800 mb-2">
              Source Type <span className="text-red-500">*</span>
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              disabled={!inputType || inputType === 'non_nasabah'}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="" disabled>Select Source Type</option>
              {sourceOptions[inputType]?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className={`flex flex-col ${showExp ? 'flex-1' : 'flex-[2]'}`}>
            <label className="text-sm font-medium text-gray-800 mb-2">
              {getNumberLabel()} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
              placeholder={`Enter ${getNumberLabel()}`}
              readOnly={isReadOnly}
              disabled={inputType === 'non_nasabah'}
              className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${isReadOnly || inputType === 'non_nasabah' ? 'bg-gray-100' : ''} disabled:bg-gray-50 disabled:text-gray-400`}
            />
          </div>

          {showExp && (
            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium text-gray-800 mb-2">
                Exp Date
              </label>
              <input
                type="text"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                placeholder="MM/YY"
                readOnly={isReadOnly}
                disabled={inputType === 'non_nasabah'}
                className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${isReadOnly || inputType === 'non_nasabah' ? 'bg-gray-100' : ''} disabled:bg-gray-50 disabled:text-gray-400`}
              />
            </div>
          )}

          <div className="flex flex-col">
            <div className="h-6 mb-2"></div>
            {inputType !== 'non_nasabah' && (
              !isReadOnly ? (
                <button 
                  onClick={fetchCustomerData}
                  disabled={loading || !numberValue.trim()}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 whitespace-nowrap disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Cari'}
                </button>
              ) : (
                <button 
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 whitespace-nowrap"
                >
                  Reset
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

InputFormRow.displayName = 'InputFormRow';
export default InputFormRow;