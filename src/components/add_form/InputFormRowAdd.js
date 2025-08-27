"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Button from "@/components/ui/Button";

function getAccessToken() {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    const token = parsed?.state?.accessToken || "";
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  } catch {
    return "";
  }
}

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

  // bersihin expDate kalau bukan debit/credit
  useEffect(() => {
    if (!showExp) setExpDate("");
  }, [showExp]);

  const fetchCustomerData = async () => {
    if (!numberValue.trim() || !sourceType) return;

    setLoading(true);
    try {
      let customerId = null;
      let related_account_id = null;
      let related_card_id = null;
      let foundAccount = null;
      let foundCard = null;

      const headers = {
        Accept: "application/json",
        Authorization: getAccessToken(),
        "ngrok-skip-browser-warning": "true",
      };

      // Step 1: Search customer using new /customers endpoint with search parameters
      let searchType = "";
      if (sourceType === "account") {
        searchType = "account";
      } else if (sourceType === "debit" || sourceType === "credit") {
        searchType = "card";
      }

      if (searchType) {
        const searchUrl = `/api/v1/customers?search=${encodeURIComponent(numberValue.trim())}&search_type=${searchType}&limit=10`;
        const searchResponse = await fetch(searchUrl, { headers });
        
        if (searchResponse.ok) {
          const searchResult = await searchResponse.json();
          const customers = searchResult.data || searchResult || [];
          
          if (customers.length > 0) {
            const customer = customers[0]; // Take first match
            customerId = customer.customer_id;
            
            // For card search, we already have the card info from search result
            if (sourceType === "debit" || sourceType === "credit") {
              // Create a mock card object since we found the customer via card search
              foundCard = {
                card_id: `card_${customerId}_${numberValue.trim()}`, // Mock ID
                card_number: numberValue.trim(),
                card_type: sourceType === "credit" ? "KREDIT" : sourceType.toUpperCase(),
                account_id: null // Will be filled when we get accounts
              };
              related_card_id = foundCard.card_id;
            } else if (sourceType === "account") {
              // For account search, we'll get the account in Step 3
              // Just mark that we're searching by account
              foundAccount = { account_number: numberValue.trim() };
            }
          }
        }
      }

      if (!customerId) {
        alert("Number not found");
        return;
      }

      // Step 2: Get full customer data (already have from search, but get fresh data)
      let customer = null;
      if (customerId) {
        const customerResponse = await fetch(`/api/v1/customers?search=${customerId}&search_type=customer&limit=1`, { headers });
        if (customerResponse.ok) {
          const customerResult = await customerResponse.json();
          const customers = customerResult.data || customerResult || [];
          customer = customers.find(c => c.customer_id === customerId) || customers[0];
        }
      }
      
      if (!customer) {
        alert("Customer not found");
        return;
      }

      // Step 3: Fetch customer's accounts using new endpoint
      let customerAccounts = [];
      let customerCards = [];
      
      try {
        const customerAccountsResponse = await fetch(`/api/v1/customers/${customerId}/accounts`, { headers });
        if (customerAccountsResponse.ok) {
          const accountsData = await customerAccountsResponse.json();
          customerAccounts = Array.isArray(accountsData) ? accountsData : accountsData.data || [];
          
          // Find the specific account if searching by account number
          if (sourceType === "account" && foundAccount) {
            const specificAccount = customerAccounts.find(acc => acc.account_number?.toString() === numberValue.trim());
            if (specificAccount) {
              related_account_id = specificAccount.account_id;
              foundAccount = specificAccount;
            }
          }
          
          // For card search, find the account that matches the card
          if (foundCard && customerAccounts.length > 0) {
            // Use first account as related account for card
            related_account_id = customerAccounts[0].account_id;
            foundCard.account_id = customerAccounts[0].account_id;
          }
        }
      } catch (error) {
        // No fallback since /v1/account doesn't exist
        customerAccounts = [];
      }

      // Step 4: Fetch all customer's cards using new customers endpoint
      if (customerId) {
        try {
          const customerCardsResponse = await fetch(`/api/v1/customers/${customerId}/cards`, { headers });
          if (customerCardsResponse.ok) {
            const cardsData = await customerCardsResponse.json();
            customerCards = Array.isArray(cardsData) ? cardsData : cardsData.data || [];
          }
        } catch (error) {
          // If /customers/{id}/cards doesn't exist, keep foundCard if we have it
          if (foundCard) {
            customerCards = [foundCard];
          }
        }
      }

      setCustomerData(customer);
      setIsReadOnly(true);

      onCustomerData?.(
        {
          ...customer,
          related_account_id,
          related_card_id,
          customerAccounts, // Include customer's accounts
          customerCards, // Include customer's cards
          // simpan nomor yang dicari dan semua data terkait
          ...(sourceType === "account"
            ? { 
                accountNumber: numberValue.trim(),
                cardNumber: customerCards.length > 0 ? customerCards[0].card_number : ""
              }
            : {}),
          ...(sourceType === "debit" || sourceType === "credit"
            ? { 
                cardNumber: numberValue.trim(),
                accountNumber: customerAccounts.length > 0 ? customerAccounts[0].account_number : ""
              }
            : {}),
        },
        {
          searchedNumber: numberValue.trim(),
          searchType: sourceType,
          related_account_id,
          related_card_id,
          customerAccounts, // Include in search context too
          customerCards, // Include customer's cards in context
        },
        inputType
      );
    } catch (error) {
      console.error("Search error:", error);
      alert("Error fetching data: " + (error?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const doReset = () => {
    setCustomerData(null);
    setIsReadOnly(false);
    setNumberValue("");
    setExpDate("");
    setInputType("");
    setSourceType("");
    // beritahu parent/store biar semua bersih juga
    onCustomerData?.(null, null, "");
  };

  const resetForm = () => doReset();

  // Notify parent immediately when inputType changes
  useEffect(() => {
    if (inputType) {
      onCustomerData?.(null, null, inputType);
    }
  }, [inputType]);

  useEffect(() => {
    if (inputType && sourceType) {
      // reset data saat kombinasi inputType + sourceType berubah
      setCustomerData(null);
      setIsReadOnly(false);
      setNumberValue("");
      setExpDate("");
    }
  }, [inputType, sourceType]);

  useImperativeHandle(ref, () => ({
    resetForm,
  }));

  // reset dari broadcast (mis. setelah save)
  useEffect(() => {
    const onReset = () => doReset();
    window.addEventListener("resetAllForms", onReset);
    return () => window.removeEventListener("resetAllForms", onReset);
  }, []);

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

  return (
    <div className="w-full bg-[#B5EFE1] p-4 mb-4 mt-1 rounded-lg">
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
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
              <option value="" disabled>
                Select Input Type
              </option>
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
              disabled={!inputType || inputType === "non_nasabah"}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="" disabled>
                Select Source Type
              </option>
              {sourceOptions[inputType]?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={`flex flex-col ${showExp ? "flex-1" : "flex-[2]"}`}>
            <label className="text-sm font-medium text-gray-800 mb-2">
              {getNumberLabel()} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
              placeholder={`Enter ${getNumberLabel()}`}
              readOnly={isReadOnly}
              disabled={inputType === "non_nasabah"}
              className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                isReadOnly || inputType === "non_nasabah" ? "bg-gray-100" : ""
              } disabled:bg-gray-50 disabled:text-gray-400`}
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
                disabled={inputType === "non_nasabah"}
                className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                  isReadOnly || inputType === "non_nasabah" ? "bg-gray-100" : ""
                } disabled:bg-gray-50 disabled:text-gray-400`}
              />
            </div>
          )}

          <div className="flex flex-col">
            <div className="h-6 mb-2"></div>
            {inputType !== "non_nasabah" && (
              <Button
                variant="warning"
                onClick={fetchCustomerData}
                loading={loading}
                disabled={loading || !numberValue.trim() || inputType === "non_nasabah"}
                className="whitespace-nowrap"
              >
                {loading ? "Loading..." : "Cari"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

InputFormRow.displayName = "InputFormRow";
export default InputFormRow;
