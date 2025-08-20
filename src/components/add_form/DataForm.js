"use client";
import React, { useEffect, useState } from "react";
import useAddComplaint from "@/hooks/useAddComplaint";

const DataForm = ({ detail, onChange, mode = "detail" }) => {
  const {
    channels, categories, sources, terminals, priorities, policies,
    filterCategories, getSlaInfo
  } = useAddComplaint();
  const toInitial = (d) => {
    if (mode === "add") {
      // For add mode - use new structure with IDs
      return {
        description: d?.ticket?.description ?? "",
        amount: d?.ticket?.amount ?? "",
        channelId: d?.ticket?.channel?.channel_id ?? "",
        categoryId: d?.ticket?.complaint?.complaint_id ?? "",
        sourceId: d?.ticket?.intakeSource?.source_id ?? "",
        terminalId: d?.ticket?.terminal?.terminal_id ?? "",
        transactionDate: d?.timestamps?.transactionDate ?? "",
        createdTime: d?.timestamps?.createdTime ?? "",
        committedDueAt: d?.timestamps?.committedDueAt ?? "",
        priorityId: d?.ticket?.priority?.priority_id || "",
        record: d?.ticket?.record?.name || "",
        slaDays: d?.policy?.slaDays ?? "",
        slaHours: d?.policy?.slaHours ?? "",
        slaStatus: d?.sla?.status ?? "",
        slaRemaining: d?.sla?.remainingHours ?? "",
      };
    } else {
      // For detail mode - use original structure
      return {
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
        transactionDate: d?.timestamps?.transactionDate ?? "",
        createdTime: d?.timestamps?.createdTime ?? "",
        committedDueAt: d?.timestamps?.committedDueAt ?? "",
        priority: d?.ticket?.priority?.name || "",
        record: d?.ticket?.record?.name || "",
        slaDays: d?.policy?.slaDays ?? "",
        slaHours: d?.policy?.slaHours ?? "",
        slaStatus: d?.sla?.status ?? "",
        slaRemaining: d?.sla?.remainingHours ?? "",
      };
    }
  };

  const [form, setForm] = useState(() => {
    const initial = toInitial(detail);
    // Auto-fill created time with current datetime for add mode
    if (mode === "add" && !initial.createdTime) {
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      initial.createdTime = localDateTime;
    }
    return initial;
  });

  
  useEffect(() => { 
    if (mode === "detail") {
      const n = toInitial(detail); 
      setForm(n); 
      onChange?.(n);
    }
  }, [detail, mode]);
  

  
  // Filter categories when channel changes (only for add mode)
  useEffect(() => {
    if (mode === "add" && form.channelId) {
      const filteredCategories = filterCategories(form.channelId);
      
      // Reset category selection if current selection is not in filtered list
      if (form.categoryId && !filteredCategories.some(cat => cat.complaint_id === form.categoryId)) {
        update('categoryId', '');
      }
    }
  }, [mode, form.channelId, filterCategories]);
  
  // Auto-fill SLA and description when both channel and category are selected (only for add mode)
  useEffect(() => {
    if (mode === "add" && form.channelId && form.categoryId) {
      const slaInfo = getSlaInfo(form.channelId, form.categoryId);
      
      if (slaInfo.slaDays) {
        update('slaDays', slaInfo.slaDays);
        update('slaHours', slaInfo.slaHours);
      }
      if (slaInfo.description) {
        update('description', slaInfo.description);
      }
    }
  }, [mode, form.channelId, form.categoryId, getSlaInfo]);
  


  const update = (k, v) => setForm((p) => { const n = { ...p, [k]: v }; onChange?.(n); return n; });
  
  const getSubmitData = () => ({
    description: form.description,
    amount: form.amount,
    channel_id: form.channelId,
    complaint_category_id: form.categoryId,
    source_id: form.sourceId,
    terminal_id: form.terminalId,
    transaction_date: form.transactionDate,
    created_time: form.createdTime,
    committed_due_at: form.committedDueAt,
    priority_id: form.priorityId,
    record: form.record,
  });
  
  const SearchableSelect = ({ value, onChange, options, placeholder, getLabel, getValue }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    
    const filteredOptions = options.filter(opt => 
      getLabel(opt).toLowerCase().includes(search.toLowerCase())
    );
    
    const selectedOption = options.find(opt => getValue(opt) === value);
    
    return (
      <div className="relative">
        <div className="relative">
          <input
            className={input + ' pr-8'}
            value={selectedOption ? getLabel(selectedOption) : search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            placeholder={placeholder}
          />
          <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b max-h-40 overflow-y-auto">
            {filteredOptions.map((opt, idx) => (
              <div
                key={idx}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => {
                  onChange(getValue(opt));
                  setSearch('');
                  setIsOpen(false);
                }}
              >
                {getLabel(opt)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const input = "w-full px-3 py-2 border border-gray-300 rounded outline-none text-black text-sm";
  return (
    <div className="w-full bg-yellow-100 p-6 mb-6 rounded-lg border border-gray-300">
      <div className="bg-yellow-400 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Data</h2>
      </div>

      <div className="bg-white border-gray-200 p-6 rounded-lg grid grid-cols-3 gap-4">
        {mode === "add" ? (
          // Add mode - with searchable dropdowns
          <>
            <div>
              <label className="text-sm font-medium">Services</label>
              <input className={input + ' bg-gray-100'} value={'Complaint'} readOnly />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <SearchableSelect
                value={form.priorityId}
                onChange={(v) => update('priorityId', v)}
                options={priorities}
                placeholder="Select Priority"
                getLabel={(opt) => opt.priority_name}
                getValue={(opt) => opt.priority_id}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Record</label>
              <input className={input} value={form.record} onChange={(e) => update("record", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Channel</label>
              <SearchableSelect
                value={form.channelId}
                onChange={(v) => {
                  update('channelId', v);
                  // Reset category when channel changes
                  update('categoryId', '');
                }}
                options={channels}
                placeholder="Select Channel"
                getLabel={(opt) => opt.channel_name}
                getValue={(opt) => opt.channel_id}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Source</label>
              <SearchableSelect
                value={form.sourceId}
                onChange={(v) => update('sourceId', v)}
                options={sources}
                placeholder="Select Source"
                getLabel={(opt) => opt.source_name}
                getValue={(opt) => opt.source_id}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nominal</label>
              <input 
                type="number" 
                className={input} 
                value={form.amount} 
                onChange={(e) => update("amount", e.target.value)} 
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <SearchableSelect
                value={form.categoryId}
                onChange={(v) => update('categoryId', v)}
                options={categories}
                placeholder="Select Category"
                getLabel={(opt) => opt.complaint_name}
                getValue={(opt) => opt.complaint_id}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Transaction Date</label>
              <input type="date" className={input} value={form.transactionDate} onChange={(e) => update("transactionDate", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Committed Due</label>
              <input type="datetime-local" className={input} value={form.committedDueAt} onChange={(e) => update("committedDueAt", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Created Time</label>
              <input type="datetime-local" className={input} value={form.createdTime} onChange={(e) => update("createdTime", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">ID Terminal ATM</label>
              <SearchableSelect
                value={form.terminalId}
                onChange={(v) => update('terminalId', v)}
                options={terminals}
                placeholder="Select Terminal"
                getLabel={(opt) => `${opt.terminal_code} - ${opt.location}`}
                getValue={(opt) => opt.terminal_id}
              />
            </div>
            <div><label className="text-sm font-medium">SLA</label><input className={input + ' bg-gray-100'} value={form.slaDays ? `${form.slaDays}d / ${form.slaHours}h` : ''} readOnly /></div>
            <div className="col-span-3">
              <label className="text-sm font-medium">Description</label>
              <textarea className={input} rows={2} value={form.description} onChange={(e) => update("description", e.target.value)} />
            </div>
          </>
        ) : (
          // Detail mode - original readonly fields
          <>
            <div>
              <label className="text-sm font-medium">Services</label>
              <input className={input} value={'Complaint'} readOnly />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <input className={input} value={form.priority} readOnly />
            </div>
            <div>
              <label className="text-sm font-medium">Record</label>
              <input className={input} value={form.record} readOnly />
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
              <input className={input} value={form.amount} readOnly />
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
            <div><label className="text-sm font-medium">SLA</label><input className={input} value={`${form.slaDays}d / ${form.slaHours}h`} readOnly /></div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea className={input} rows={2} value={form.description} readOnly />
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default DataForm;
