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

const InputForm = ({ detail }) => {
  const [divisionNotes, setDivisionNotes] = useState(detail?.notes?.division || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsProcessing(true);

    try {
      const newNoteObj = {
        id: Date.now(),
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).replace(/\//g, "/").replace(",", ""),
        division: "Current Division",
        author: "Current User",
        message: newNote,
        type: "note",
      };

      setDivisionNotes((prev) => [...prev, newNoteObj]);
      console.log("Note added:", newNoteObj);
    } catch (error) {
      console.error("Failed to add note:", error);
      alert("Failed to add note. Please try again.");
    } finally {
      setIsProcessing(false);
      setNewNote("");
    }
  };

  // Get note styling based on division and type
  const getNoteStyle = (division, type = "note") => {
    const divisionConfig = {
      "CXC": { color: "border-blue-400", bgColor: "bg-blue-50" },
      "DGO": { color: "border-green-400", bgColor: "bg-green-50" },
      "IT": { color: "border-purple-400", bgColor: "bg-purple-50" },
      "Finance": { color: "border-yellow-400", bgColor: "bg-yellow-50" },
      "Security": { color: "border-red-400", bgColor: "bg-red-50" },
      "ATM Operations": { color: "border-orange-400", bgColor: "bg-orange-50" },
      "Call Center": { color: "border-pink-400", bgColor: "bg-pink-50" },
    };
    
    const typeConfig = {
      system: { icon: MessageSquare },
      note: { icon: FileText },
      escalation: { icon: AlertTriangle },
      resolution: { icon: CheckCircle },
    };
    
    const divisionStyle = divisionConfig[division] || { color: "border-gray-400", bgColor: "bg-gray-50" };
    const typeStyle = typeConfig[type] || typeConfig.note;
    
    return { ...divisionStyle, ...typeStyle };
  };

  // Show empty state when no notes exist
  const showEmptyState = divisionNotes.length === 0;

  return (
    <div className="w-full bg-blue-100 rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      {/* Header */}
      <div className="bg-blue-500 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Notes</h2>

      </div>

      {/* Division Communication History */}
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
                const noteStyle = getNoteStyle(note.division, note.type);
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
            disabled={!newNote.trim() || isProcessing}
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
