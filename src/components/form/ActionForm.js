// src/components/form/ActionForm.js
"use client";

import React, { useEffect, useState } from "react";
import SearchableSelect from "../SearchableSelect";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

const unitOptions = [
  "BCC - Customer Care",
  "DGO USER 1 (UIC1)",
  "BCC - Customer Care / DGO USER 1 (UIC1)",
  "DGO USER 1 (UIC3)",
  "DGO USER 1 (UIC6)",
  "DGO USER 1 (UIC7)",
  "BCC - Customer Care / DGO USER 1 (UIC8)",
  "DGO USER 1 (UIC10)",
  "DGO USER 1 (UIC11)",
  "Divisi OPR",
  "Divisi TBS",
];

function toDateInputValue(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

const toInitial = (d) => ({
  action: "",
  formUnit: "CXC",
  unitTo: d?.policy?.uicName || "",
  closedTime: toDateInputValue(d?.timestamps?.closedTime),
  solution: d?.ticket?.solution || "",
  reason: d?.ticket?.reason || "",
  customerStatus: d?.statuses?.customer?.name || "",
  employeeStatus: d?.statuses?.employee?.name || "",
  slaDays: d?.policy?.slaDays ?? "",
  slaHours: d?.policy?.slaHours ?? "",
  slaStatus: d?.sla?.status ?? "",
  slaRemaining: d?.sla?.remainingHours ?? "",
});

/**
 * Props:
 * - detail
 * - onChange(payloadDariActionForm)
 * - onSubmit()               // dipanggil TANPA argumen (parent yang handle)
 * - submitting: boolean      // loading state tombol
 * - submitOk: boolean        // true jika update sukses
 * - submitError: string|null // pesan error jika gagal
 */
export default function ActionForm({
  detail,
  onChange,
  onSubmit,
  submitting,
  submitOk,
  submitError,
}) {
  const [form, setForm] = useState(toInitial(detail));

  useEffect(() => {
    const next = toInitial(detail);
    setForm(next);
    onChange?.(next);
  }, [detail, onChange]);

  // toast global
  useEffect(() => {
    if (submitOk) toast.success("Ticket berhasil diupdate!");
    if (submitError) toast.error(`${submitError}`);
  }, [submitOk, submitError]);

  const update = (k, v) =>
    setForm((p) => {
      const n = { ...p, [k]: v };
      onChange?.(n);
      return n;
    });

  const handleSubmit = () => onSubmit?.();

  const inputBase =
    "w-full px-3 py-2 border border-gray-300 rounded text-sm text-black outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";

  // helper visibilitas field
  const isDecline = form.action === "Decline";
  const isClosed = form.action === "Closed";
  const isEscalate = form.action === "Eskalasi";

  // tombol disabled jika belum pilih action / sedang submit
  const disableSubmit = submitting || !form.action;

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-green-100 p-6 shadow-lg">
      <div className="-m-6 mb-6 rounded-t-lg bg-green-600 px-4 py-2 text-center text-white">
        <h2 className="text-lg font-semibold">Action</h2>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <div className={`grid grid-cols-1 gap-3 ${isClosed ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        {/* <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3"> */}
        
          {/* Action */}
          <div className="flex min-w-0 items-center gap-3">
            <label className="whitespace-nowrap text-sm font-medium text-black">
              Action
            </label>
            <select
              className="w-full rounded bg-white px-3 py-2 text-sm text-black outline-none border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={form.action}
              onChange={(e) => update("action", e.target.value)}
            >
              <option value="">-- Pilih Action --</option>
              <option value="Decline">Decline</option>
              <option value="Eskalasi">Eskalasi</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Form Unit (default CXC, read-only) */}
          <div className="flex min-w-0 items-center gap-2">
            <label className="whitespace-nowrap text-sm font-medium text-black">
              Form Unit
            </label>
            <input type="text" className={`${inputBase} bg-gray-50`} value={form.formUnit} readOnly />
          </div>

          {/* Unit to */}
          <div className="flex min-w-0 items-center gap-2">
            <label className="whitespace-nowrap text-sm font-medium text-black">
              Unit to <span className="text-red-500">*</span>
            </label>
            <div className="w-full">
              <SearchableSelect
                options={unitOptions}
                value={form.unitTo}
                onChange={(v) => update("unitTo", v)}
                placeholder="-- Pilih Unit --"
              />
            </div>
          </div>

          {/* Closed Time — hanya tampil saat Closed */}
          {isClosed && (
            <div className="flex min-w-0 items-center gap-2 w-full">
              <label className="whitespace-nowrap text-sm font-medium text-black">
                Closed Time
              </label>
              <input
                type="date"
                className={inputBase}
                value={form.closedTime}
                onChange={(e) => update("closedTime", e.target.value)}
              />
            </div>
          )}

          {/* Reason — khusus Decline */}
          {isDecline && (
            <div className="md:col-span-4 flex items-center gap-2 min-w-0">
              <label className="whitespace-nowrap text-sm font-medium text-black">Reason</label>
              <input
                type="text"
                className={inputBase}
                value={form.reason}
                onChange={(e) => update("reason", e.target.value)}
                placeholder="Isi Reason"
              />
            </div>
          )}

          {/* Solution — khusus Closed */}
          {isClosed && (
            <div className="md:col-span-4 flex items-center gap-2 min-w-0">
              <label className="whitespace-nowrap text-sm font-medium text-black">Solution</label>
              <input
                type="text"
                className={inputBase}
                value={form.solution}
                onChange={(e) => update("solution", e.target.value)}
                placeholder="Isi Solution"
              />
            </div>
          )}
        </div>

        {/* Submit area */}
        <div className="mt-4 flex flex-col items-end gap-2 border-t border-gray-200 pt-4">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={disableSubmit}
            loading={submitting}
          >
            {submitting ? "Menyimpan..." : "Submit Update"}
          </Button>
        </div>
      </div>
    </div>
  );
}
