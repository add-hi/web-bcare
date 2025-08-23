// src/components/form/InputForm.jsx
import React, { useState, useEffect } from "react";
import SearchableSelect from "../SearchableSelect";

const toLocalInputDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function InputForm({ detail, onChange }) {
  // === Priority options (label tampil, value = id yang dilempar) ===
  const priorityOptions = [
    { priority_id: 1, priority_code: "CRITICAL", priority_name: "Critical", id: 1 },
    { priority_id: 2, priority_code: "HIGH", priority_name: "High", id: 2 },
    { priority_id: 3, priority_code: "REGULAR", priority_name: "Regular", id: 3 },
  ];

  // === Channel options with IDs (sesuai JSON kamu) ===
  const channelOptions = [
    { id: 1, code: "ATM", name: "Automated Teller Machine" },
    { id: 2, code: "TAPCASH", name: "BNI Tapcash" },
    { id: 3, code: "CRM", name: "Cash Recycling Machine" },
    { id: 4, code: "DISPUTE_DEBIT", name: "DISPUTE KARTU DEBIT" },
    { id: 5, code: "IBANK", name: "Internet Banking" },
    { id: 6, code: "MBANK", name: "Mobile Banking" },
    { id: 7, code: "MTUNAI", name: "Mobile Tunai" },
    { id: 8, code: "MTUNAI_ALFAMART", name: "Mobile Tunai Alfamart" },
    { id: 9, code: "QRIS_DEBIT", name: "QRIS Kartu Debit" },
  ];

  // === Category options with IDs (lengkap 1..48 sesuai JSON kamu) ===
  const categoryOptions = [
    { id: 1, code: "2ND_CHARGEBACK", name: "2nd Chargeback" },
    { id: 2, code: "2ND_CHARGEBACK_QRIS_DEBIT", name: "2nd Chargeback QRIS Debit" },
    { id: 3, code: "BI_FAST_BILATERAL", name: "BI-FAST Bilateral (Refund,salah/batal Care/ 7 transfer,rek terdebet > 1x)" },
    { id: 4, code: "BI_FAST_DANA_TIDAK_MASUK", name: "BI-FAST Dana Tidak Masuk ke Rek Tujuan" },
    { id: 5, code: "BI_FAST_GAGAL_HAPUS_AKUN", name: "BI-FAST Gagal Hapus Akun" },
    { id: 6, code: "BI_FAST_GAGAL_MIGRASI_AKUN", name: "BI-FAST Gagal Migrasi Akun" },
    { id: 7, code: "BI_FAST_GAGAL_SUSPEND_AKUN", name: "BI-FAST Gagal Suspend Akun" },
    { id: 8, code: "BI_FAST_GAGAL_UPDATE_AKUN", name: "BI-FAST Gagal Update Akun" },
    { id: 9, code: "DISPUTE", name: "Dispute" },
    { id: 10, code: "DISPUTE_QRIS_KARTU_DEBIT", name: "Dispute QRIS Kartu Debit" },
    { id: 11, code: "MOBILE_TUNAI", name: "Mobile Tunai" },
    { id: 12, code: "MOBILE_TUNAI_ALFAMART", name: "Mobile Tunai Alfamart" },
    { id: 13, code: "MOBILE_TUNAI_ALFAMIDI", name: "Mobile Tunai Alfamidi" },
    { id: 14, code: "MOBILE_TUNAI_INDOMARET", name: "Mobile Tunai Indomaret" },
    { id: 15, code: "PEMBAYARAN_KARTU_KREDIT_BANK_LAIN", name: "Pembayaran Kartu Kredit Bank Lain" },
    { id: 16, code: "PEMBAYARAN_KARTU_KREDIT_BNI", name: "Pembayaran Kartu Kredit BNI" },
    { id: 17, code: "PEMBAYARAN_MPNG2", name: "Pembayaran MPNG2" },
    { id: 18, code: "PEMBAYARAN_MPNG3", name: "Pembayaran MPNG3" },
    { id: 19, code: "PEMBAYARAN_MPNG4", name: "Pembayaran MPNG4" },
    { id: 20, code: "PEMBAYARAN_PLN_VIA_ATM_BANK_LAIN", name: "Pembayaran PLN via ATM Bank Lain" },
    { id: 21, code: "PEMBAYARAN_SAMSAT", name: "Pembayaran Samsat" },
    { id: 22, code: "PEMBAYARAN_TELKOM_TELKOMSEL_INDOSAT_PROVIDER_LAINNYA", name: "Pembayaran Telkom/Telkomsel/Indosat/Provider Lainnya" },
    { id: 23, code: "PERMINTAAN_CCTV_ATM_BNI", name: "Permintaan CCTV ATM BNI " },
    { id: 24, code: "SETOR_TUNAI_DI_MESIN_ATM_CRM", name: "Setor Tunai Di Mesin ATM CRM" },
    { id: 25, code: "TARIK_TUNAI_DI_ATM_LINK", name: "Tarik Tunai Di ATM Link" },
    { id: 26, code: "TARIK_TUNAI_DI_ATM_PRIMA", name: "Tarik Tunai Di ATM Prima" },
    { id: 27, code: "TARIK_TUNAI_DI_ATM_CIRRUS", name: "Tarik Tunai Di ATМ Cirrus" },
    { id: 28, code: "TARIK_TUNAI_DI_JARINGAN_ALTO", name: "Tarik Tunai Di Jaringan Alto" },
    { id: 29, code: "TARIK_TUNAI_DI_JARINGAN_BERSAMA", name: "Tarik Tunai Di Jaringan Bersama" },
    { id: 30, code: "TARIK_TUNAI_DI_MESIN_ATM_BNI", name: "Tarik Tunai Di Mesin ATM BNI" },
    { id: 31, code: "TOP_UP_DANA", name: "Top Up Dana" },
    { id: 32, code: "TOP_UP_E_MONEY", name: "Top Up e-money" },
    { id: 33, code: "TOP_UP_GOPAY", name: "Top Up Gopay" },
    { id: 34, code: "TOP_UP_LINKAJA", name: "Top Up LinkAja" },
    { id: 35, code: "TOP_UP_OVO", name: "Top Up OVO" },
    { id: 36, code: "TOP_UP_PRA_MIGRASI_DANA_GAGAL_TERKOREKSI", name: "Top Up Pra Migrasi, Dana Gagal Terkoreksi" },
    { id: 37, code: "TOP_UP_PULSA", name: "Top Up Pulsa" },
    { id: 38, code: "TOP_UP_PULSA_VIA_ATM_BANK_LAIN", name: "Top Up Pulsa via ATM Bank Lain" },
    { id: 39, code: "TOP_UP_SHOPEE_PAY", name: "Top Up Shopee Pay" },
    { id: 40, code: "TRANSFER_ANTAR_REKENING_BNI", name: "Transfer Antar Rekening BNI" },
    { id: 41, code: "TRANSFER_ATM_ALTO_DANA_TDK_MASUK", name: "Transfer ATM Alto (Dana Tdk Masuk ke Rek Tujuan)" },
    { id: 42, code: "TRANSFER_ATM_ALTO_BILATERAL", name: "Transfer ATM Alto Bilateral (Refund,salah/batal transfer,rek terdebet > 1x)" },
    { id: 43, code: "TRANSFER_ATM_ALTO_LINK_BILATERAL", name: "Transfer ATM Alto Link Bilateral (Refund,salah/batal transfer,rek terdebet > 1x)" },
    { id: 44, code: "TRANSFER_ATM_BERSAMA_DANA_TDK_MASUK", name: "Transfer ATM Bersama (Dana Tdk Masuk ke Rek Tujuan)" },
    { id: 45, code: "TRANSFER_ATM_BERSAMA_BILATERAL", name: "Transfer ATM Bersama Bilateral (Refund,salah/batal transfer,rek terdebet > 1x)" },
    { id: 46, code: "TRANSFER_ATM_LINK_DANA_TDK_MASUK", name: "Transfer ATM Link (Dana Tdk Masuk ke Rek Tujuan)" },
    { id: 47, code: "TRANSFER_ATM_PRIMA_DANA_TDK_MASUK", name: "Transfer ATM Prima (Dana Tdk Masuk ke Rek Tujuan)" },
    { id: 48, code: "TRANSFER_ATM_PRIMA_BILATERAL", name: "Transfer ATM Prima Bilateral (Refund,salah/batal transfer,rek terdebet > 1x)" },
  ];

  // helper untuk tebak initial id dari detail
  const inferInitialPriorityId = () => {
    const p = detail?.ticket?.priority;
    if (!p) return "";
    const directId = p.id ?? p.priority_id;
    if (directId) return String(directId);
    const needleCode = String(p.code ?? p.priority_code ?? "").toLowerCase();
    const needleName = String(p.name ?? "").toLowerCase();
    const match =
      priorityOptions.find(o => String(o.priority_code).toLowerCase() === needleCode) ||
      priorityOptions.find(o => String(o.priority_name).toLowerCase() === needleName);
    return match ? String(match.id) : "";
  };

  const inferInitialCategoryId = () => {
    const c = detail?.ticket?.complaint;
    if (!c) return "";
    const directId = c.id ?? c.complaint_id;
    if (directId) return String(directId);
    const needleCode = String(c.code ?? c.complaint_code ?? "").toLowerCase();
    const needleName = String(c.name ?? c.complaint_name ?? "").toLowerCase();
    const match =
      categoryOptions.find(o => o.code.toLowerCase() === needleCode) ||
      categoryOptions.find(o => o.name.toLowerCase() === needleName);
    return match ? String(match.id) : "";
  };

  const inferInitialChannelId = () => {
    const ch = detail?.ticket?.channel;
    if (!ch) return "";
    const directId = ch.id ?? ch.channel_id;
    if (directId) return String(directId);
    const needleCode = String(ch.code ?? ch.channel_code ?? "").toLowerCase();
    const needleName = String(ch.name ?? ch.channel_name ?? "").toLowerCase();
    const match =
      channelOptions.find(o => o.code.toLowerCase() === needleCode) ||
      channelOptions.find(o => o.name.toLowerCase() === needleName);
    return match ? String(match.id) : "";
  };

  const [formData, setFormData] = useState({
    service: "Complaint",
    priorityId: inferInitialPriorityId(),
    categoryId: inferInitialCategoryId(),
    channelId: inferInitialChannelId(),
    record: detail?.ticket?.record || "",
    // TODO: Source – kalau sudah ada master Intake Source → ganti jadi id
    source: detail?.ticket?.intakeSource?.name || "",
    nominal: detail?.ticket?.amount || "",
    transactionDate: toLocalInputDateTime(detail?.timestamps?.transactionDate),
    commitedDate: detail?.timestamps?.committedDueAt ? new Date(detail.timestamps.committedDueAt).toISOString().split("T")[0] : "",
    createdTime: detail?.timestamps?.createdTime ? new Date(detail.timestamps.createdTime).toISOString().split("T")[0] : "",
    idTerminalATM: detail?.ticket?.terminal?.code || "",
    sla: detail?.policy?.slaDays || "",
    description: detail?.ticket?.description || "",
  });

  // propagate ke parent (kirim id numeric ke payload)
  useEffect(() => {
    onChange &&
      onChange({
        priority_id: formData.priorityId ? Number(formData.priorityId) : undefined,
        complaint_id: formData.categoryId ? Number(formData.categoryId) : undefined,
        issue_channel_id: formData.channelId ? Number(formData.channelId) : undefined,
        record: formData.record,
        // sementara source masih string
        source: formData.source,
        amount: formData.nominal,
        transactionDate: formData.transactionDate ? new Date(formData.transactionDate).toISOString() : undefined,
        committedDate: formData.commitedDate,
        createdTime: formData.createdTime,
        terminalCode: formData.idTerminalATM, // jika nanti butuh terminal_id, tinggal pakai pola id juga
        sla: formData.sla,
        description: formData.description,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const getFieldValue = (label) => {
    const fieldMap = {
      Service: formData.service,
      Record: formData.record,
      Source: formData.source,
      Nominal: formData.nominal,
      "Transaction Date": formData.transactionDate,
      "Commited Date": formData.commitedDate,
      "Created Time": formData.createdTime,
      "ID Terminal ATM": formData.idTerminalATM,
      SLA: formData.sla,
      Description: formData.description,
    };
    return fieldMap[label] || "";
  };

  const handleInputChange = (field, value) => {
    const fieldMap = {
      Record: "record",
      Nominal: "nominal",
      "Transaction Date": "transactionDate",
      "Commited Date": "commitedDate",
      "Created Time": "createdTime",
      "ID Terminal ATM": "idTerminalATM",
      SLA: "sla",
      Description: "description",
      Source: "source",
    };
    if (field === "Priority") return setFormData((p) => ({ ...p, priorityId: String(value) }));
    if (field === "Category") return setFormData((p) => ({ ...p, categoryId: String(value) }));
    if (field === "Channel") return setFormData((p) => ({ ...p, channelId: String(value) }));
    const stateField = fieldMap[field];
    if (stateField) setFormData((p) => ({ ...p, [stateField]: value }));
  };

  const fieldConfig = [
    { label: "Service", type: "select", required: true },
    { label: "Priority", type: "select" },
    { label: "Record", type: "textarea" },
    { label: "Channel", type: "select", required: true },
    { label: "Source", type: "select", required: true },
    { label: "Nominal" },
    { label: "Category", type: "select", required: true },
    { label: "Transaction Date", type: "datetime" },
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
              <label className="text-sm text-black font-medium mb-2 whitespace-nowrap" htmlFor={`field-${index}`}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "select" ? (
                field.label === "Channel" ? (
                  <select
                    id={`field-${index}`}
                    className={inputClassName}
                    value={formData.channelId}
                    onChange={(e) => handleInputChange("Channel", e.target.value)}
                  >
                    <option value="" disabled>
                      Pilih Channel
                    </option>
                    {channelOptions.map((opt) => (
                      <option key={opt.id} value={String(opt.id)}>
                        {opt.name} ({opt.code})
                      </option>
                    ))}
                  </select>
                ) : field.label === "Category" ? (
                  <select
                    id={`field-${index}`}
                    className={inputClassName}
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange("Category", e.target.value)}
                  >
                    <option value="" disabled>
                      Pilih Category
                    </option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.id} value={String(opt.id)}>
                        {opt.name} ({opt.code})
                      </option>
                    ))}
                  </select>
                ) : field.label === "Priority" ? (
                  <select
                    id={`field-${index}`}
                    className={inputClassName}
                    value={formData.priorityId}
                    onChange={(e) => handleInputChange("Priority", e.target.value)}
                  >
                    <option value="" disabled>
                      Pilih Priority
                    </option>
                    {priorityOptions.map((opt) => (
                      <option key={opt.id} value={String(opt.id)}>
                        {opt.priority_name} ({opt.priority_code})
                      </option>
                    ))}
                  </select>
                ) : field.label === "Service" ? (
                  <select id={`field-${index}`} className={inputClassName} value="Complaint" readOnly>
                    <option>Complaint</option>
                  </select>
                ) : field.label === "Source" ? (
                  // sementara source masih string; nanti kalau ada master Source → ganti ke id
                  <select
                    id={`field-${index}`}
                    className={inputClassName}
                    value={formData.source}
                    onChange={(e) => handleInputChange("Source", e.target.value)}
                  >
                    <option value="" disabled>
                      Pilih Source
                    </option>
                    <option value={formData.source || ""}>{formData.source || "—"}</option>
                  </select>
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
              ) : field.type === "datetime" ? (
                <input
                  id={`field-${index}`}
                  type="datetime-local"
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
}
