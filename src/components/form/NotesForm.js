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

const InputForm = ({
  // TODO: BACKEND - Add these props when integrating with parent form
  formId = null, // The ID of the parent form/complaint
  currentUser = null, // Current user info { id, name, role, division }
  onNoteAdded = null, // Callback when note is successfully added
  initialNotes = [], // Initial notes to display (from backend)
}) => {
  // TODO: BACKEND - Replace with actual API calls
  const [divisionNotes, setDivisionNotes] = useState(initialNotes);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newNote, setNewNote] = useState("");

  // Mock data for development - REMOVE when backend is ready
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

  // TODO: BACKEND - Replace this useEffect with actual API call
  useEffect(() => {
    // TODO: BACKEND - Implement this API call
    // const fetchNotes = async () => {
    //   if (formId) {
    //     // For saved forms, fetch existing notes
    //     try {
    //       const response = await fetch(`/api/forms/${formId}/notes`);
    //       const notes = await response.json();
    //       setDivisionNotes(notes);
    //     } catch (error) {
    //       console.error('Failed to fetch notes:', error);
    //     }
    //   }
    //   // For new forms, start with empty notes array (allow adding notes immediately)
    // };
    // fetchNotes();
  }, [formId]);

  // TODO: BACKEND - Implement actual API call
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsProcessing(true);

    try {
      // TODO: BACKEND - Replace with actual API call
      /*
      if (formId) {
        // For saved forms, save to database immediately
        const response = await fetch(`/api/forms/${formId}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`, // Add auth token
          },
          body: JSON.stringify({
            message: newNote,
            type: 'note', // or allow user to select type
            authorId: currentUser?.id,
            division: currentUser?.division,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add note');
        }

        const addedNote = await response.json();
        setDivisionNotes(prev => [...prev, addedNote]);
      } else {
        // For unsaved forms, store notes locally until form is saved
        // These notes will be saved when the form is eventually saved
        const tempNote = {
          id: `temp-${Date.now()}`, // temporary ID
          timestamp: new Date().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\//g, '/').replace(',', ''),
          division: currentUser?.division || "Current Division",
          author: currentUser?.name || "Current User",
          message: newNote,
          type: "note",
          isTemporary: true, // flag to indicate this needs to be saved to DB
        };
        
        setDivisionNotes(prev => [...prev, tempNote]);
      }
      
      // Call parent callback if provided
      if (onNoteAdded) {
        onNoteAdded(addedNote || tempNote);
      }
      */

      // DEVELOPMENT ONLY - Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

      console.log("Note added:", mockNewNote);
    } catch (error) {
      console.error("Failed to add note:", error);
      // TODO: BACKEND - Add proper error handling
      alert("Failed to add note. Please try again.");
      return;
    } finally {
      setIsProcessing(false);
      setNewNote("");
    }
  };

  // Get note type styling
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

  // Show empty state when no notes exist
  const showEmptyState = divisionNotes.length === 0;

  return (
    <div className="w-full bg-blue-100 rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      {/* Header */}
      <div className="bg-blue-500 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Notes</h2>
        {/* TODO: BACKEND - Show form status or ID if needed */}
        {formId && <p className="text-xs opacity-75">Form ID: {formId}</p>}
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
                  Start by adding a communication note to track progress and
                  updates.
                </p>
                {/* Development helper - remove in production */}
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
                      {note.message}
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

          {!formId && divisionNotes.some((note) => note.isTemporary) && (
            <p className="text-xs text-blue-600 mt-2 text-center">
              💡 Notes will be permanently saved when you save the form
            </p>
          )}
        </div>
      </div>

      {/* Backend Integration Guide */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-yellow-800 text-sm mb-2">
          🔧 Backend Integration Guide
        </h4>
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
};

export default InputForm;
