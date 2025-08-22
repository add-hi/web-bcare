import React, { useState } from "react";
import SearchableSelect from "../SearchableSelect";

const InputForm = ({ detail }) => {
  const channelOptions = [
    "ATM", "BNI_TAPCASH", "CRM", "DISPUTE_KARTU_DEBIT",
    "INTERNET_BANKING", "MOBILE_BANKING", "MOBILE_TUNAI",
    "MOBILE_TUNAI_ALFAMART", "QRIS_KARTU_DEBIT"
  ];

  const categoryOptions = [
    "Pembayaran Kartu Kredit BNI", "Transfer Antar Rekening BNI",
    "Pembayaran Kartu Kredit Bank Lain", "Pembayaran PLN via ATM Bank Lain",
    "Pembayaran Samsat", "Pembayaran Telom/Telkomsel/Indosat/Provider Lainnya",
    "Top Up Dana", "Top Up Gopay", "Top Up OVO", "Top Up Pulsa",
    "Top Up Pulsa via ATM Bank Lain", "Top Up Shopee Pay", "Top Up LinkAja",
    "Top Up e-money", "Transfer ATM Alto (Dana Tdk Masuk ke Rek Tujuan)",
    "Transfer ATM Bersama (Dana Tdk Masuk ke Rek Tujuan)",
    "Transfer ATM Link (Dana Tdk Masuk ke Rek Tujuan)",
    "Transfer ATM Prima (Dana Tdk Masuk ke Rek Tujuan)",
    "Tarik Tunai Di Mesin ATM BNI",
    "Transfer ATM Alto Bilateral (Refund,salah/batal transfer,rek terdebet > 1x)",
    "Transfer ATM Bersama Bilateral (Refund,salah/batal transfer,rek terdebet > 1x)",
    "Transfer ATM Alto Link Bilateral (Refund,salah/batal transfer,rek terdebet > 1x)",
    "Transfer ATM Prima Bilateral (Refund,salah/batal transfer,rek terdebet > 1x)",
    "Tarik Tunai Di ATM Link", "Tarik Tunai Di ATM Prima",
    "Tarik Tunai Di Jaringan Alto", "Tarik Tunai Di Jaringan Bersama",
    "Pembayaran MPNG2", "Permintaan CCTV ATM BNI", "Tarik Tunai Di ATМ Cirrus",
    "Top Up Pra Migrasi, Dana Gagal Terkoreksi", "Setor Tunai Di Mesin ATM CRM",
    "2nd Chargeback", "Dispute", "Pembayaran MPNG3", "BI-FAST Gagal Hapus Akun",
    "BI-FAST Gagal Migrasi Akun", "BI-FAST Gagal Suspend Akun",
    "BI-FAST Gagal Update Akun", "BI-FAST Dana Tdk Masuk ke Rek Tujuan",
    "BI-FAST Bilateral (Refund,salah/batal Care/ 7 transfer,rek terdebet > 1x)",
    "Mobile Tunai Alfamidi", "Mobile Tunai Indomaret", "Pembayaran MPNG4",
    "Mobile Tunai", "Mobile Tunai Alfamart", "Dispute QRIS Kartu Debit",
    "2nd Chargeback QRIS Debit"
  ];

  const getMatchingOption = (apiValue, options) => {
    if (!apiValue) return "";
    return options.find(option => 
      option.toLowerCase().includes(apiValue.toLowerCase()) ||
      apiValue.toLowerCase().includes(option.toLowerCase())
    ) || apiValue;
  };

  const [formData, setFormData] = useState({
    service: "Complaint",
    priority: detail?.ticket?.priority?.name || "",
    record: detail?.ticket?.record || "",
    channel: getMatchingOption(detail?.ticket?.channel?.code, channelOptions),
    source: detail?.ticket?.intakeSource?.name || "",
    nominal: detail?.ticket?.amount || "",
    category: getMatchingOption(detail?.ticket?.complaint?.name, categoryOptions),
    transactionDate: detail?.timestamps?.transactionDate ? new Date(detail.timestamps.transactionDate).toISOString().split('T')[0] : "",
    commitedDate: detail?.timestamps?.committedDueAt ? new Date(detail.timestamps.committedDueAt).toISOString().split('T')[0] : "",
    createdTime: detail?.timestamps?.createdTime ? new Date(detail.timestamps.createdTime).toISOString().split('T')[0] : "",
    idTerminalATM: detail?.ticket?.terminal?.code || "",
    sla: detail?.policy?.slaDays || "",
    description: detail?.ticket?.description || "",
  });

  const getFieldValue = (label) => {
    const fieldMap = {
      "Service": formData.service,
      "Priority": formData.priority,
      "Record": formData.record,
      "Channel": formData.channel,
      "Source": formData.source,
      "Nominal": formData.nominal,
      "Category": formData.category,
      "Transaction Date": formData.transactionDate,
      "Commited Date": formData.commitedDate,
      "Created Time": formData.createdTime,
      "ID Terminal ATM": formData.idTerminalATM,
      "SLA": formData.sla,
      "Description": formData.description,
    };
    return fieldMap[label] || "";
  };

  const handleInputChange = (field, value) => {
    const fieldMap = {
      "Channel": "channel",
      "Category": "category",
      "Record": "record",
      "Nominal": "nominal",
      "Transaction Date": "transactionDate",
      "Commited Date": "commitedDate",
      "Created Time": "createdTime",
      "ID Terminal ATM": "idTerminalATM",
      "SLA": "sla",
      "Description": "description",
    };
    const stateField = fieldMap[field];
    if (stateField) {
      setFormData(prev => ({ ...prev, [stateField]: value }));
    }
  };

  const fieldConfig = [
    { label: "Service", type: "select", required: true },
    { label: "Priority", type: "select" },
    { label: "Record", type: "textarea" },
    { label: "Channel", type: "select", required: true },
    { label: "Source", type: "select", required: true },
    { label: "Nominal" },
    { label: "Category", type: "select", required: true },
    { label: "Transaction Date", type: "date" },
    { label: "Commited Date", type: "date", required: true },
    { label: "Created Time", type: "date" },
    { label: "ID Terminal ATM" },
    { label: "SLA", required: true },
    { label: "Description", required: true },
  ];

  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm";

  return (
    <div className="w-full bg-orange-100 p-6 mb-6 relative rounded-lg border border-gray-300">
      <div className="bg-orange-500 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Data</h2>
      </div>

      <div className="bg-white border-gray-200 p-6 rounded-lg">
        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
          {fieldConfig.map((field, index) => (
            <div key={index} className="flex flex-col">
              {/* Label */}
              <label className="text-sm text-black font-medium mb-2 whitespace-nowrap" htmlFor={`field-${index}`}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* Input */}
              {field.type === "select" ? (
                field.label === "Channel" ? (
                  <SearchableSelect
                    options={channelOptions}
                    value={getFieldValue(field.label)}
                    onChange={(value) => handleInputChange("Channel", value)}
                    placeholder="Select Channel"
                  />
                ) : field.label === "Category" ? (
                  <SearchableSelect
                    options={categoryOptions}
                    value={getFieldValue(field.label)}
                    onChange={(value) => handleInputChange("Category", value)}
                    placeholder="Select Category"
                  />
                ) : (
                  <select id={`field-${index}`} className={inputClassName} value={getFieldValue(field.label)} readOnly>
                    <option>{getFieldValue(field.label)}</option>
                  </select>
                )
              ) : field.type === "textarea" ? (
                <textarea
                  id={`field-${index}`}
                  className={inputClassName + " resize-none overflow-y-auto h-[40px]"}
                  rows={1}
                  value={getFieldValue(field.label)}
                  onChange={(e) => handleInputChange(field.label, e.target.value)}
                />
              ) : field.type === "date" ? (
                <input
                  id={`field-${index}`}
                  type="date"
                  className={inputClassName}
                  value={getFieldValue(field.label)}
                  onChange={(e) => handleInputChange(field.label, e.target.value)}
                />
              ) : (
                <input
                  id={`field-${index}`}
                  type="text"
                  className={inputClassName}
                  value={getFieldValue(field.label)}
                  onChange={(e) => handleInputChange(field.label, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InputForm;
