"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle,
  Building2,
  Send,
  Clock,
  User,
} from "lucide-react";

export function InputFormRow (){
  const [inputType, setInputType] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [expDate, setExpDate] = useState("");

  const sourceOptions = {
    nasabah: [
      { value: "account", label: "Account" },
      { value: "debit", label: "Debit Card" },
      { value: "credit", label: "Credit Card" },
    ],
    non_nasabah: [],
  };

  const showExp = sourceType === "debit" || sourceType === "credit";

  // Bersihin expDate kalau bukan debit/credit
  useEffect(() => {
    if (!showExp) setExpDate("");
  }, [showExp]);

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
        {/* Tetap 4 kolom di layar besar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          <div className="flex flex-col">
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
              <option value="" disabled>Select Input Type</option>
              <option value="nasabah">Nasabah</option>
              <option value="non_nasabah">Non Nasabah</option>
            </select>
          </div>

          {/* Source Type */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-800 mb-2">
              Source Type <span className="text-red-500">*</span>
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              disabled={!inputType}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="" disabled>Select Source Type</option>
              {sourceOptions[inputType]?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Number - kalau Exp Date tidak tampil, kolom ini melebar 2 kolom */}
          <div className={`flex flex-col ${showExp ? "lg:col-span-1" : "lg:col-span-2"}`}>
            <label className="text-sm font-medium text-gray-800 mb-2">
              {getNumberLabel()} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={`Enter ${getNumberLabel()}`}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Exp Date — hanya muncul untuk debit/credit */}
          {showExp && (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-2">
                Exp Date
              </label>
              <input
                type="number"
                min={0}
                max={24}
                step={1}
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};



/* =========================
   Customer Info (hijau)
   ========================= */
export function CustomerInfo() {
  const formData = [
    { label: "CIF" },
    { label: "Gender", type: "select", required: true },
    { label: "Address", type: "textarea", required: true },
    { label: "Account Number" },
    { label: "Place Of Birth" },
    { label: "Billing Address", type: "textarea", required: false },
    { label: "Card Number" },
    { label: "Home Phone", required: true },
    { label: "Postal Code" },
    { label: "Customer Name", required: true },
    { label: "Handphone", required: true },
    { label: "Office Phone" },
    { label: "Person ID" },
    { label: "Email" },
    { label: "Fax Phone" },
    { label: "List Debit Card Number" },
  ];

  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm";

  return (
    <div className="w-full bg-green-100 p-6 mb-6 relative rounded-lg border border-gray-300">
      <div className="bg-green-300 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Customer Info</h2>
      </div>
      <div className="bg-white border-gray-200 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
          {formData.map((field, index) => (
            <div key={index} className="flex flex-col">
              <label className="text-sm text-black font-medium mb-2 whitespace-nowrap">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "select" ? (
                <select className={inputClassName}>
                  <option value="">-- Select --</option>
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  className={inputClassName + " resize-none overflow-y-auto h-[40px]"}
                  rows={1}
                />
              ) : (
                <input className={inputClassName} readOnly={false} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Data (oranye)
   ========================= */
export function DataForm() {
  const formData = [
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
          {formData.map((field, index) => (
            <div key={index} className="flex flex-col">
              <label
                className="text-sm text-black font-medium mb-2 whitespace-nowrap"
                htmlFor={`data-field-${index}`}
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "select" ? (
                <select id={`data-field-${index}`} className={inputClassName}>
                  <option value="">-- Select --</option>
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  id={`data-field-${index}`}
                  className={inputClassName + " resize-none overflow-y-auto h-[40px]"}
                  rows={1}
                />
              ) : field.type === "date" ? (
                <input id={`data-field-${index}`} type="date" className={inputClassName} />
              ) : (
                <input id={`data-field-${index}`} type="text" className={inputClassName} readOnly={false} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Notes (biru)
   ========================= */
export function NotesForm({
  formId = null,
  currentUser = null,
  onNoteAdded = null,
  initialNotes = [],
}) {
  const [divisionNotes, setDivisionNotes] = useState(initialNotes);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newNote, setNewNote] = useState("");

  const mockNotes = [
    {
      id: 1,
      timestamp: "08/08/2025 14:20",
      division: "Divisi CXC",
      author: "System",
      message: "Complaint received via Internet Banking channel.",
      type: "system",
    },
    {
      id: 2,
      timestamp: "08/08/2025 15:30",
      division: "Divisi CXC",
      author: "John Doe",
      message: "Initial review completed. All required fields are present.",
      type: "note",
    },
  ];

  useEffect(() => {
    // Placeholder integrasi backend jika diperlukan
  }, [formId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockNewNote = {
        id: Date.now(),
        timestamp: new Date()
          .toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(/\//g, "/")
          .replace(",", ""),
        division: currentUser?.division || "Current Division",
        author: currentUser?.name || "Current User",
        message: newNote,
        type: "note",
      };
      setDivisionNotes((prev) => [...prev, mockNewNote]);
      onNoteAdded && onNoteAdded(mockNewNote);
    } catch {
      alert("Failed to add note. Please try again.");
    } finally {
      setIsProcessing(false);
      setNewNote("");
    }
  };

  const getNoteTypeStyle = (type) => {
    const typeConfig = {
      system: {
        color: "border-gray-400",
        bgColor: "bg-gray-50",
        icon: MessageSquare,
      },
      note: {
        color: "border-blue-400",
        bgColor: "bg-blue-50",
        icon: FileText,
      },
      escalation: {
        color: "border-orange-400",
        bgColor: "bg-orange-50",
        icon: AlertTriangle,
      },
      resolution: {
        color: "border-green-400",
        bgColor: "bg-green-50",
        icon: CheckCircle,
      },
    };
    return typeConfig[type] || typeConfig.note;
  };

  const showEmptyState = divisionNotes.length === 0;

  return (
    <div className="w-full bg-blue-100 rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      <div className="bg-blue-500 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Notes</h2>
        {formId && <p className="text-xs opacity-75">Form ID: {formId}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
            <span className="text-sm text-gray-500">{divisionNotes.length} messages</span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {showEmptyState ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <MessageSquare size={24} className="text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Notes yet</h4>
                <p className="text-gray-500 text-sm mb-4">
                  Start by adding a communication note to track progress and updates.
                </p>
                <button
                  onClick={() => setDivisionNotes(mockNotes)}
                  className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300"
                >
                  DEV: Load Mock Data
                </button>
              </div>
            ) : (
              divisionNotes.map((note) => {
                const typeStyle = getNoteTypeStyle(note.type);
                const IconComponent = typeStyle.icon;
                return (
                  <div
                    key={note.id}
                    className={`border-l-4 ${typeStyle.color} pl-4 ${typeStyle.bgColor} rounded-r-lg p-3`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent size={14} className="text-gray-600" />
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock size={10} />
                        <span className="font-medium">{note.timestamp}</span>
                      </div>
                      <span className="text-xs text-gray-500">•</span>
                      <div className="flex items-center gap-1">
                        <Building2 size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-600 font-medium">{note.division}</span>
                      </div>
                      <span className="text-xs text-gray-500">•</span>
                      <div className="flex items-center gap-1">
                        <User size={10} className="text-gray-500" />
                        <span className="text-xs text-gray-500">{note.author}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">{note.message}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h3>

          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add your communication note here..."
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            rows={4}
          />

          <button
            onClick={handleAddNote}
            disabled={!newNote.trim() || isProcessing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send size={16} />
            {isProcessing ? "Adding Note..." : "Add Note"}
          </button>

          {!formId && divisionNotes.some((note) => note.isTemporary) && (
            <p className="text-xs text-blue-600 mt-2 text-center">
              💡 Notes will be permanently saved when you save the form
            </p>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-yellow-800 text-sm mb-2">🔧 Backend Integration Guide</h4>
        <div className="text-xs text-yellow-700 space-y-1">
          <p>• Pass formId when form is saved (null for new forms is OK)</p>
          <p>• Add currentUser prop with user info</p>
          <p>• Implement onNoteAdded callback</p>
          <p>• Handle temporary notes when form is saved</p>
          <p>• Replace mock API calls with real endpoints</p>
          <p>• Remove development helpers and mock data</p>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Action (hijau)
   ========================= */
export function ActionForm() {
  const [formData, setFormData] = useState({
    action: "",
    formUnit: "",
    unitTo: "",
    closedTime: "",
    solution: "",
    reason: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving data:", formData);
  };

  return (
    <div className="w-full bg-green-100 rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      <div className="bg-green-600 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Action</h2>
      </div>
      <div className="w-full bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="p-1 text-black mt-3">
          <div className="flex items-end gap-4 flex-wrap">
            {/* Action */}
            <div className="flex gap-3 items-end min-w-[140px] flex-grow min-w-0">
              <label className="text-sm font-medium text-black whitespace-nowrap self-center">
                Action
              </label>
              <div className="flex-1">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm"
                  value={formData.action}
                  onChange={(e) => handleInputChange("action", e.target.value)}
                >
                  <option value="" disabled>
                    -- Pilih Action --
                  </option>
                  <option value="Decline">Decline</option>
                  <option value="Eskalasi">Eskalasi</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Form Unit */}
            <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0">
              <label className="text-sm font-medium text-black whitespace-nowrap">Form Unit</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm"
                value={formData.formUnit}
                onChange={(e) => handleInputChange("formUnit", e.target.value)}
                placeholder="Isi Form Unit"
              />
            </div>

            {/* Unit to */}
            <div className="flex items-center space-x-2 min-w-[180px] flex-grow min-w-0">
              <label className="text-sm font-medium text-black whitespace-nowrap">
                Unit to <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm"
                value={formData.unitTo}
                onChange={(e) => handleInputChange("unitTo", e.target.value)}
              >
                <option value="" disabled>
                  -- Pilih Unit --
                </option>
              </select>
            </div>

            {/* Closed Time */}
            <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0">
              <label className="text-sm font-medium text-black whitespace-nowrap">Closed Time</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm"
                value={formData.closedTime}
                onChange={(e) => handleInputChange("closedTime", e.target.value)}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 ml-auto flex-shrink-0"
            >
              Save
            </button>
          </div>

          {/* Solution (only when Closed) */}
          {formData.action === "Closed" && (
            <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0 mt-3">
              <label className="text-sm font-medium text-black whitespace-nowrap">Solution</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black"
                value={formData.solution}
                onChange={(e) => handleInputChange("solution", e.target.value)}
                placeholder="Isi Solution"
              />
            </div>
          )}

          {/* Reason (only when Decline) */}
          {formData.action === "Decline" && (
            <div className="flex items-center space-x-2 min-w-[140px] flex-grow min-w-0 mt-3">
              <label className="text-sm font-medium text-black whitespace-nowrap">Reason</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black text-sm"
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Isi Reason"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Wrapper / Halaman gabungan
   ========================= */
export default function AddComplaint() {
  // Contoh currentUser untuk NotesForm (opsional)
  const currentUser = { name: "Jane Smith", division: "Divisi CXC" };

  return (
    <div className="w-full">
      <InputFormRow/>
      <CustomerInfo />
      <DataForm />
      <NotesForm currentUser={currentUser} formId={null} initialNotes={[]} />
      <ActionForm />
    </div>
  );
}
