"use client";
import React, { useState } from "react";
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
import useUser from "@/hooks/useUser";

const InputForm = ({ detail }) => {
  // Ambil user (sumber sama dengan Sidebar)
  const { user } = useUser();

  // Derive field yang dipakai UI
  const displayName =
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    user?.user?.full_name ||
    user?.profile?.full_name ||
    "Unknown User";

  const displayRole =
    user?.role_details?.role_name ||
    user?.role_name ||
    user?.role ||
    "Unknown Division/Role";

  const divisionCode = (
    user?.division_details?.division_code ||
    user?.division_code ||
    user?.division ||
    ""
  )
    .toString()
    .toUpperCase();

  // State Notes
  const [divisionNotes, setDivisionNotes] = useState(
    detail?.notes?.division || []
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return; // pastikan user ada
    setIsProcessing(true);

    try {
      const timestamp = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const newNoteObj = {
        id: Date.now(),
        timestamp,
        division: displayRole,   // teks yang ditampilkan (contoh: CX Communication Agent)
        divisionCode,            // untuk pewarnaan (CXC/DGO/…)
        author: displayName,     // nama user login
        message: newNote,
        type: "note",
      };

      setDivisionNotes((prev) => [...prev, newNoteObj]);
    } catch (error) {
      console.error("Failed to add note:", error);
      alert("Failed to add note. Please try again.");
    } finally {
      setIsProcessing(false);
      setNewNote("");
    }
  };

  // Pewarnaan berdasarkan division code (pakai UPPERCASE)
  const getNoteStyle = (division, type = "note") => {
    const divisionConfig = {
      CXC: { color: "border-blue-400", bgColor: "bg-blue-50" },
      DGO: { color: "border-green-400", bgColor: "bg-green-50" },
      IT: { color: "border-purple-400", bgColor: "bg-purple-50" },
      FINANCE: { color: "border-yellow-400", bgColor: "bg-yellow-50" },
      SECURITY: { color: "border-red-400", bgColor: "bg-red-50" },
      "ATM OPERATIONS": { color: "border-orange-400", bgColor: "bg-orange-50" },
      "CALL CENTER": { color: "border-pink-400", bgColor: "bg-pink-50" },
    };

    const typeConfig = {
      system: { icon: MessageSquare },
      note: { icon: FileText },
      escalation: { icon: AlertTriangle },
      resolution: { icon: CheckCircle },
    };

    const key = (division || "").toUpperCase();
    const divisionStyle =
      divisionConfig[key] || { color: "border-gray-400", bgColor: "bg-gray-50" };
    const typeStyle = typeConfig[type] || typeConfig.note;

    return { ...divisionStyle, ...typeStyle };
  };

  const showEmptyState = divisionNotes.length === 0;

  return (
    <div className="w-full bg-blue-100 rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      {/* Header */}
      <div className="bg-blue-500 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Notes</h2>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
            <span className="text-sm text-gray-500">
              {divisionNotes.length} messages
            </span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {showEmptyState ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <MessageSquare size={24} className="text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No Notes yet
                </h4>
                <p className="text-gray-500 text-sm mb-4">
                  No communication notes available for this ticket.
                </p>
              </div>
            ) : (
              divisionNotes.map((note, index) => {
                const noteStyle = getNoteStyle(
                  note.divisionCode || note.division,
                  note.type
                );
                const IconComponent = noteStyle.icon;
                return (
                  <div
                    key={note.id || `note-${index}`}
                    className={`border-l-4 ${noteStyle.color} pl-4 ${noteStyle.bgColor} rounded-r-lg p-3`}
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
                        <span className="text-xs text-gray-600 font-medium">
                          {note.division}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">•</span>
                      <div className="flex items-center gap-1">
                        <User size={10} className="text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {note.author}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {note.msg || note.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Note */}
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
            disabled={
              !newNote.trim() || isProcessing || !user || displayName === "Unknown User"
            }
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send size={16} />
            {isProcessing ? "Adding Note..." : "Add Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
