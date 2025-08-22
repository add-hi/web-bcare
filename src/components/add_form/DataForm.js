"use client";
import React, { useEffect, useState } from "react";
import useAddComplaint from "@/hooks/useAddComplaint";

/* =========================
   [ADDED] Business Day helpers (JS)
   Taruh SETELAH import, SEBELUM komponen.
   ========================= */
const HOLIDAYS = [
  // contoh libur (format 'YYYY-MM-DD') – ganti dari BE kalau ada
  "2025-01-01",
  "2025-03-31",
  "2025-06-01",
];

const weekendDays = new Set([0, 6]); // 0=Sun, 6=Sat
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const isHoliday = (d, holidaysSet) => holidaysSet.has(ymd(d));
const isWeekend = (d) => weekendDays.has(d.getDay());
const isBusinessDay = (d, holidaysSet) => !isWeekend(d) && !isHoliday(d, holidaysSet);

const rollToNextBusinessDay = (d, holidaysSet) => {
  const x = new Date(d);
  while (!isBusinessDay(x, holidaysSet)) {
    x.setDate(x.getDate() + 1);
  }
  return x;
};

const addBusinessDays = (start, days, holidaysSet) => {
  let d = new Date(start);
  let left = Math.max(0, days);
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (isBusinessDay(d, holidaysSet)) left--;
  }
  return d;
};

const addBusinessHours = (start, hours, holidaysSet) => {
  let d = new Date(start);
  d.setHours(d.getHours() + Math.max(0, hours));
  // kalau hasilnya mendarat di weekend/libur, geser ke hari kerja berikutnya
  while (!isBusinessDay(d, holidaysSet)) {
    const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds(), ms = d.getMilliseconds();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    d.setHours(h, m, s, ms);
  }
  return d;
};

const computeCommittedDue = (createdStr, days, hours) => {
  if (!createdStr) return "";

  const baseStr = String(createdStr).replace(" ", "T");
  const base = new Date(baseStr);
  if (isNaN(base.getTime())) return "";

  const holidaysSet = new Set(HOLIDAYS);
  // start di hari kerja
  let d = rollToNextBusinessDay(base, holidaysSet);

  const dd = Number(days) || 0;
  let hh = Number(hours);
  hh = Number.isFinite(hh) ? hh : 0;

  // normalisasi jam biar gak dobel
  if (dd > 0) {
    if (hh === dd * 24) hh = 0;
    else if (hh >= 24) hh = hh % 24;
  }

  // tambah hari kerja, lalu jam
  d = addBusinessDays(d, dd, holidaysSet);
  d = addBusinessHours(d, hh, holidaysSet);

  // format ke "YYYY-MM-DDTHH:mm" (local)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
/* ========================= */

const DataForm = ({ detail, onChange, mode = "detail" }) => {
  const toLocalInput = (date) =>
    new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

  const {
    channels,
    categories,
    sources,
    terminals,
    priorities,
    policies,
    filterCategories,
    updateCategories,
    getSlaInfo,
  } = useAddComplaint();

  const toInitial = (d) => {
    if (mode === "add") {
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
    // Auto-fill created time dengan waktu sekarang untuk add mode
    if (mode === "add" && !initial.createdTime) {
      const now = new Date();
      const localDateTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      )
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

  // filter categories saat channel berubah (add mode)
  useEffect(() => {
    if (mode === "add" && form.channelId) {
      const filtered = filterCategories(form.channelId);
      updateCategories(filtered);

      if (
        form.categoryId &&
        !filtered.some((cat) => cat.complaint_id === form.categoryId)
      ) {
        update("categoryId", "");
      }
    }
  }, [mode, form.channelId, filterCategories, updateCategories]);

  // ambil SLA & deskripsi saat channel+category terisi (add mode)
  useEffect(() => {
    if (mode === "add" && form.channelId && form.categoryId) {
      const slaInfo = getSlaInfo(form.channelId, form.categoryId);

      const d = Number(slaInfo.slaDays) || 0;
      const h = Number(slaInfo.slaHours) || 0;

      // update SLA di form
      update("slaDays", d);
      update("slaHours", h);

      // [ADDED] hitung & isi committed due langsung, walau createdTime belum diganti-ganti
      const nextDue = computeCommittedDue(form.createdTime, d, h); // [ADDED]
      if (nextDue && form.committedDueAt !== nextDue) {             // [ADDED]
        update("committedDueAt", nextDue);                          // [ADDED]
      }

      if (slaInfo.description) {
        update("description", slaInfo.description);
      }
    }
  }, [mode, form.channelId, form.categoryId, getSlaInfo]);

  // [ADDED] fallback: kalau createdTime / SLA berubah, recompute committed due
  useEffect(() => {
    if (mode !== "add") return;
    if (!form.createdTime) return;

    const next = computeCommittedDue(form.createdTime, form.slaDays, form.slaHours);
    if (next && form.committedDueAt !== next) {
      update("committedDueAt", next);
    }
  }, [mode, form.createdTime, form.slaDays, form.slaHours]); // [ADDED]

  // reset event (add mode)
  useEffect(() => {
    if (mode === "add") {
      const handleReset = () => {
        const now = new Date();
        const localDateTime = new Date(
          now.getTime() - now.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16);

        const resetForm = {
          description: "",
          amount: "",
          channelId: "",
          categoryId: "",
          sourceId: "",
          terminalId: "",
          transactionDate: "",
          createdTime: localDateTime,
          committedDueAt: "",
          priorityId: "",
          record: "",
          slaDays: "",
          slaHours: "",
          slaStatus: "",
          slaRemaining: "",
        };

        setForm(resetForm);
        onChange?.(resetForm);
      };

      window.addEventListener("resetAllForms", handleReset);
      return () => window.removeEventListener("resetAllForms", handleReset);
    }
  }, [mode, onChange]);

  const update = (k, v) => {
    setForm((p) => {
      const n = { ...p, [k]: v };
      setTimeout(() => {
        console.log('DataForm onChange called with:', n);
        onChange?.(n);
      }, 0);
      return n;
    });
  };

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

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder,
  getLabel,
  getValue,
  getSearchText, // <-- NEW (opsional)
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchTextFn = getSearchText || getLabel; // fallback
  const q = (search || "").toLowerCase();

  const filteredOptions = options.filter((opt) => {
    const haystack = (searchTextFn(opt) || "").toString().toLowerCase();
    return haystack.includes(q);
  });

  const selectedOption = options.find((opt) => getValue(opt) === value);

  const displayValue =
    isOpen && search
      ? search
      : selectedOption
      ? getLabel(selectedOption)
      : search;

  return (
    <div className="relative">
      <div className="relative">
        <input
          className={input + " pr-8"}
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (selectedOption) setSearch("");
          }}
          onBlur={() =>
            setTimeout(() => {
              setIsOpen(false);
              setSearch("");
            }, 200)
          }
          placeholder={placeholder}
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
      {isOpen && (
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


  const input =
    "w-full px-3 py-2 border border-gray-300 rounded outline-none text-black text-sm";

  return (
    <div className="w-full bg-yellow-100 p-6 mb-6 rounded-lg border border-gray-300">
      <div className="bg-yellow-400 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Data</h2>
      </div>

      <div className="bg-white border-gray-200 p-6 rounded-lg grid grid-cols-3 gap-4">
        {mode === "add" ? (
          <>
            <div>
              <label className="text-sm font-medium">Services</label>
              <input className={input + " bg-gray-100"} value={"Complaint"} readOnly />
            </div>

            <div>
              <label className="text-sm font-medium">Priority</label>
              <SearchableSelect
                value={form.priorityId}
                onChange={(v) => update("priorityId", v)}
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
    update("channelId", v);
    update("categoryId", "");
  }}
  options={channels}
  placeholder="Select Channel"
  // Label tampilannya: tunjukkan code + name (kalau code ada)
  getLabel={(opt) =>
    `${opt.channel_name}`
  }
  getValue={(opt) => opt.channel_id}
  // Teks yang dicari: bisa ketik nama ATAU code
  getSearchText={(opt) =>
    `${opt.channel_name ?? ""} ${(opt.channel_code ?? opt.code) ?? ""}`
  }
/>

            </div>

            <div>
              <label className="text-sm font-medium">Source</label>
              <SearchableSelect
                value={form.sourceId}
                onChange={(v) => update("sourceId", v)}
                options={sources.filter((s) => s.source_id !== 2)}
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
                onChange={(v) => update("categoryId", v)}
                options={categories}
                placeholder="Select Category"
                getLabel={(opt) => opt.complaint_name}
                getValue={(opt) => opt.complaint_id}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Transaction Date</label>
              <input
                type="date"
                className={input}
                value={form.transactionDate}
                onChange={(e) => update("transactionDate", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Committed Due</label>
              <input
                type="datetime-local"
                className={input + " bg-gray-100"}
                value={form.committedDueAt || ""}
                readOnly // [CHANGED] dibuat readOnly karena diisi otomatis
              />
            </div>

            <div>
              <label className="text-sm font-medium">Created Time</label>
              <input
                type="datetime-local"
                className={input}
                value={form.createdTime}
                onChange={(e) => update("createdTime", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">ID Terminal ATM</label>
              <SearchableSelect
                value={form.terminalId}
                onChange={(v) => update("terminalId", v)}
                options={terminals}
                placeholder="Select Terminal"
                getLabel={(opt) => `${opt.terminal_code} - ${opt.location}`}
                getValue={(opt) => opt.terminal_id}
              />
            </div>

            <div>
              <label className="text-sm font-medium">SLA</label>
              <input
                className={input + " bg-gray-100"}
                value={form.slaDays ? `${form.slaDays}d / ${form.slaHours}h` : ""}
                readOnly
              />
            </div>

            <div className="col-span-3">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className={input}
                rows={2}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium">Services</label>
              <input className={input} value={"Complaint"} readOnly />
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
              <input
                className={input}
                value={`${form.channelCode} - ${form.channelName}`.trim()}
                readOnly
              />
            </div>
            <div>
              <label className="text-sm font-medium">Source</label>
              <input
                className={input}
                value={`${form.intakeCode} - ${form.intakeName}`.trim()}
                readOnly
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nominal</label>
              <input className={input} value={form.amount} readOnly />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <input
                className={input}
                value={`${form.complaintCode} - ${form.complaintName}`.trim()}
                readOnly
              />
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
              <input
                className={input}
                value={`${form.terminalCode} - ${form.terminalLocation}`.trim()}
                readOnly
              />
            </div>
            <div>
              <label className="text-sm font-medium">SLA</label>
              <input className={input} value={`${form.slaDays}d / ${form.slaHours}h`} readOnly />
            </div>
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
