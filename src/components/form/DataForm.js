"use client";
import React, { useEffect, useState } from "react";

const DataForm = ({ detail, onChange }) => {
  const toInitial = (d) => ({
    description: d?.ticket?.description ?? "",
    amount: d?.ticket?.amount ?? "",
    channelCode: d?.ticket?.channel?.code ?? "",
    channelName: d?.ticket?.channel?.name ?? "",
    complaintCode: d?.ticket?.complaint?.code ?? "",
    complaintName: d?.ticket?.complaint?.name ?? "",
    intakeCode: d?.ticket?.intakeSource?.code ?? "",
    intakeName: d?.ticket?.intakeSource?.name ?? "",
    terminalCode: d?.ticket?.terminal?.code ?? "",
    terminalLocation: d?.ticket?.terminal?.location ?? "",
    employeeName: d?.ticket?.employee?.fullName ?? "",
    employeeEmail: d?.ticket?.employee?.email ?? "",
    employeeNpp: d?.ticket?.employee?.npp ?? "",
    transactionDate: d?.timestamps?.transactionDate ?? "",
    createdTime: d?.timestamps?.createdTime ?? "",
    committedDueAt: d?.timestamps?.committedDueAt ?? "",
    priority: d?.ticket?.priority?.name || "",
    record: d?.ticket?.record?.name || "",

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
    <div className="w-full bg-yellow-100 p-6 mb-6 rounded-lg border border-gray-300">
      <div className="bg-yellow-400 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Data</h2>
      </div>

      <div className="bg-white border-gray-200 p-6 rounded-lg grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Services</label>
          <input className={input} value={'Complaint'} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium">Priority</label>
          <input className={input} value={form.priority} />
        </div>
        <div>
          <label className="text-sm font-medium">Record</label>
          <input className={input} value={form.record} />
        </div>
        <div>
          <label className="text-sm font-medium">Channel</label>
          <input className={input} value={`${form.channelCode} - ${form.channelName}`.trim()} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium">Source</label>
          <input className={input} value={`${form.intakeCode} - ${form.intakeName}`.trim()} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium">Nominal</label>
          <input className={input} value={form.amount} onChange={(e) => update("amount", e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <input className={input} value={`${form.complaintCode} - ${form.complaintName}`.trim()} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium">Transaction Date</label>
          <input className={input} value={form.transactionDate || ""} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium">Committed Due</label>
          <input className={input} value={form.committedDueAt || ""} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium">Created Time</label>
          <input className={input} value={form.createdTime || ""} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium">ID Terminal ATM</label>
          <input className={input} value={`${form.terminalCode} - ${form.terminalLocation}`.trim()} readOnly />
        </div>
        {/* <div>
          <label className="text-sm font-medium">Employee</label>
          <input className={input} value={`${form.employeeName} (${form.employeeNpp})`.trim()} readOnly />
        </div>
        <div>
          <label className="text-sm font-medium">Employee Email</label>
          <input className={input} value={form.employeeEmail} readOnly />
        </div> */}
        {/* <div>
          <label className="text-sm font-medium">SLA</label>
          <input className={input} value={""} />
        </div> */}
        <div><label className="text-sm font-medium">SLA</label><input className={input} value={`${form.slaDays}d / ${form.slaHours}h`} readOnly /></div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea className={input} rows={2} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
      </div>
    </div>
  );
};

export default DataForm;
