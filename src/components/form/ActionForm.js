"use client";
import React, { useEffect, useState } from "react";

const ActionForm = ({ detail, onChange }) => {
  const toInitial = (d) => ({
    action: "",            // Decline | Eskalasi | Closed (opsional)
    formUnit: "",
    unitTo: "",
    closedTime: d?.timestamps?.closedTime || "",
    solution: "",
    reason: "",
    // readonly info
    customerStatus: d?.statuses?.customer?.name || "",
    employeeStatus: d?.statuses?.employee?.name || "",
    slaDays: d?.policy?.slaDays ?? "",
    slaHours: d?.policy?.slaHours ?? "",
    slaStatus: d?.sla?.status ?? "",
    slaRemaining: d?.sla?.remainingHours ?? "",
  });

  const [form, setForm] = useState(toInitial(detail));
  useEffect(() => { const n = toInitial(detail); setForm(n); onChange?.(n); }, [detail]);
  const update = (k, v) => setForm((p) => { const n = { ...p, [k]: v }; onChange?.(n); return n; });

  const input = "w-full px-3 py-2 border border-gray-300 rounded outline-none text-black text-sm";

  return (
    <div className="w-full bg-green-100 rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      <div className="bg-green-600 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Action</h2>
      </div>

      <div className="w-full bg-white rounded-lg shadow-lg p-4 border border-gray-200 space-y-3">
        {/* Info readonly */}
        <div className="grid grid-cols-4 gap-3">
          <div><label className="text-sm font-medium">Customer Status</label><input className={input} value={form.customerStatus} readOnly /></div>
          <div><label className="text-sm font-medium">Employee Status</label><input className={input} value={form.employeeStatus} readOnly /></div>
          <div><label className="text-sm font-medium">Priority</label><input className={input} value={form.priority} readOnly /></div>
          <div><label className="text-sm font-medium">SLA</label><input className={input} value={`${form.slaDays}d / ${form.slaHours}h`} readOnly /></div>
          <div><label className="text-sm font-medium">SLA Status</label><input className={input} value={form.slaStatus} readOnly /></div>
          <div><label className="text-sm font-medium">Remaining (h)</label><input className={input} value={form.slaRemaining} readOnly /></div>
        </div>

        {/* Action controls */}
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="text-sm font-medium">Action</label>
            <select className={input} value={form.action} onChange={(e) => update("action", e.target.value)}>
              <option value="">-- Pilih Action --</option>
              <option value="Decline">Decline</option>
              <option value="Eskalasi">Eskalasi</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Form Unit</label>
            <input className={input} value={form.formUnit} onChange={(e) => update("formUnit", e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Unit To</label>
            <select className={input} value={form.unitTo} onChange={(e) => update("unitTo", e.target.value)}>
              <option value="">-- Pilih Unit --</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Closed Time</label>
            <input type="date" className={input} value={form.closedTime || ""} onChange={(e) => update("closedTime", e.target.value)} />
          </div>

          {form.action === "Closed" && (
            <div className="col-span-2">
              <label className="text-sm font-medium">Solution</label>
              <input className={input} value={form.solution} onChange={(e) => update("solution", e.target.value)} />
            </div>
          )}

          {form.action === "Decline" && (
            <div className="col-span-2">
              <label className="text-sm font-medium">Reason</label>
              <input className={input} value={form.reason} onChange={(e) => update("reason", e.target.value)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionForm;
