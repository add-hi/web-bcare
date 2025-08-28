"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
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

  // SearchableSelect component (same as DataFormAdd)
  const SearchableSelect = ({
    value,
    onChange,
    options,
    placeholder,
    getLabel,
    getValue,
    disabled = false,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    const filteredOptions = options.filter((opt) => {
      const haystack = (getLabel(opt) || "").toString().toLowerCase();
      return haystack.includes((search || "").toLowerCase());
    });

    const selectedOption = options.find((opt) => getValue(opt) === value);

    const displayValue =
      isOpen && search
        ? search
        : selectedOption
        ? getLabel(selectedOption)
        : search;

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
          setSearch("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm pr-8 ${
              disabled ? "bg-gray-50 text-gray-400" : ""
            }`}
            value={displayValue}
            onChange={(e) => {
              if (!disabled) {
                setSearch(e.target.value);
                setIsOpen(true);
              }
            }}
            onFocus={() => {
              if (!disabled) {
                setIsOpen(true);
                if (selectedOption) setSearch("");
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
          />
          <svg
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b max-h-40 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    onChange(getValue(opt));
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  {getLabel(opt)}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#B5EFE1] p-4 mb-4 mt-1 rounded-lg">
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <div className="flex gap-6 items-end">
          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-800 mb-2">
              Input Type<span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              value={inputType}
              onChange={(v) => {
                setInputType(v);
                setSourceType("");
              }}
              options={[
                { value: "nasabah", label: "Nasabah" },
                { value: "non_nasabah", label: "Non Nasabah" }
              ]}
              placeholder="Select Input Type"
              getLabel={(opt) => opt.label}
              getValue={(opt) => opt.value}
            />
          </div>

          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-800 mb-2">
              Source Type <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              value={sourceType}
              onChange={(v) => setSourceType(v)}
              options={sourceOptions[inputType] || []}
              placeholder="Select Source Type"
              getLabel={(opt) => opt.label}
              getValue={(opt) => opt.value}
              disabled={!inputType || inputType === "non_nasabah"}
            />
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
