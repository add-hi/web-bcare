"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Button from "@/components/ui/Button";
import useCustomerSearch from "@/hooks/useCustomerSearch";

const InputFormRow = forwardRef(({ onCustomerData }, ref) => {
  const { searchCustomer } = useCustomerSearch();
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
      const result = await searchCustomer(numberValue, sourceType);
      
      if (!result) {
        alert("Number not found");
        return;
      }

      setCustomerData(result.customer);
      setIsReadOnly(true);
      onCustomerData?.(result.customer, result.searchContext, inputType);
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
