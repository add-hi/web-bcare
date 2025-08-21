"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  X,
  Search,
  MessageSquare,
  Phone,
  Mail,
  User,
  Calendar,
  FileText,
  Send,
  CheckSquare,
  RefreshCw,
  Building2,
} from "lucide-react";
import useTicket from "@/hooks/useTicket";

const DivisionComplaintHandler = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'detail'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(null);
  const [actionModal, setActionModal] = useState({
    show: false,
    type: null,
    complaint: null,
  });
  const [actionNote, setActionNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [newNote, setNewNote] = useState("");

  // Use the same ticket hook as ComplaintList
  const { list, loading, error, fetchTickets } = useTicket();

  useEffect(() => {
    fetchTickets({ limit: 100, offset: 0 });
  }, [fetchTickets]);

  // Helper function to format date
  const fmtDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d)) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Map API data to table format (same as ComplaintList)
  const originalComplaints = useMemo(() => {
    if (!Array.isArray(list)) return [];
    return list.map((t) => {
      const id = t?.ticket_id ?? null;
      return {
        id,
        tglInput: fmtDate(t?.created_time),
        noTiket: t?.ticket_number ?? "-",
        channel:
          t?.issue_channel?.channel_code ||
          t?.issue_channel?.channel_name ||
          "-",
        category:
          t?.complaint?.complaint_name || t?.complaint?.complaint_code || "-",
        customerName: t?.customer?.full_name || "-",
        number: t?.related_account?.account_number
          ? String(t.related_account.account_number)
          : "-",
        cardNumber: t?.related_card?.card_number
          ? String(t.related_card.card_number)
          : "-",
        createdByUnit:
          t?.intake_source?.source_name ||
          (t?.employee?.npp ? `NPP ${t.employee.npp}` : "-"),
        unitNow: t?.employee_status?.employee_status_name || "-",
        status: t?.customer_status?.customer_status_name || "-",
        sla: t?.policy?.sla_days != null ? String(t.policy.sla_days) : "-",
        timeRemaining: "Calculating...", // You can add time calculation logic here
        lastUpdate: fmtDate(t?.updated_time || t?.created_time),
        assignedTo: "Current User",
        customerContact: t?.customer?.phone_number || "-",
        issueDescription: t?.complaint_description || "-",
        divisionNotes: [], // Add notes logic if available in API
      };
    });
  }, [list]);

  // Get unique values for filter options
  const getUniqueValues = (key) => {
    return [...new Set(originalComplaints.map((item) => item[key]))].sort();
  };

  // Apply filters and sorting
  const processedComplaints = useMemo(() => {
    let filtered = originalComplaints;

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].length > 0) {
        filtered = filtered.filter((item) =>
          filters[key].some((filterValue) =>
            item[key].toLowerCase().includes(filterValue.toLowerCase())
          )
        );
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle date sorting
        if (sortConfig.key === "tglInput") {
          aVal = new Date(aVal.split("/").reverse().join("-"));
          bVal = new Date(bVal.split("/").reverse().join("-"));
        }
        // Handle numeric sorting
        else if (sortConfig.key === "sla") {
          aVal = parseInt(aVal);
          bVal = parseInt(bVal);
        }
        // Handle string sorting
        else {
          aVal = aVal.toString().toLowerCase();
          bVal = bVal.toString().toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilter = (key, values) => {
    setFilters((prev) => ({
      ...prev,
      [key]: values,
    }));
  };

  const clearFilter = (key) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setSortConfig({ key: null, direction: "asc" });
  };

  const handleRowClick = (complaint) => {
    setSelectedComplaint(complaint);
    setViewMode("detail");
  };

  const handleBackToTable = () => {
    setViewMode("table");
    setSelectedComplaint(null);
  };

  const handleActionClick = (complaint, event) => {
    event.stopPropagation();
    setActionModal({ show: true, type: "mark_done", complaint });
    setActionNote("");
  };

  const handleActionSubmit = async () => {
    setIsProcessing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Here you would make the actual API call to your backend
    const payload = {
      ticketNumber: actionModal.complaint.noTiket,
      action: "mark_done",
      note: actionNote,
      timestamp: new Date().toISOString(),
      userId: "current_user_id",
      unitId: "division_cxc",
    };

    console.log("Sending to backend:", payload);

    // This would trigger notifications to mobile app
    console.log(
      `Triggering mark_done notification for ticket ${actionModal.complaint.noTiket}`
    );

    setIsProcessing(false);
    setActionModal({ show: false, type: null, complaint: null });

    // You might want to refresh the data or update the status locally here
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    // Here you would add the note to the backend
    console.log("Adding note:", newNote);

    // Reset the note input
    setNewNote("");

    // In a real app, you'd update the state with the new note
    // For now, just show success
    alert("Note added successfully!");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Inprogress: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      Completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      Overdue: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: Clock,
    };
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent size={12} />
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      Critical: { color: "bg-red-500 text-white" },
      High: { color: "bg-orange-500 text-white" },
      Medium: { color: "bg-yellow-500 text-white" },
      Low: { color: "bg-green-500 text-white" },
    };

    const config = priorityConfig[priority] || {
      color: "bg-gray-500 text-white",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {priority}
      </span>
    );
  };

  const getActionButton = (complaint, isInDetail = false) => {
    const buttonClass = isInDetail
      ? "px-6 py-3 text-sm font-semibold rounded-lg transition-colors"
      : "px-2 py-1 text-xs rounded transition-colors";

    return (
      <button
        onClick={(e) => handleActionClick(complaint, e)}
        className={`${buttonClass} bg-green-600 text-white hover:bg-green-700`}
      >
        <CheckSquare
          className={isInDetail ? "inline mr-2" : "hidden"}
          size={16}
        />
        Mark as Done
      </button>
    );
  };

  const getNoteTypeStyle = (type) => {
    const typeConfig = {
      system: {
        color: "border-gray-400",
        bgColor: "bg-gray-50",
        icon: MessageSquare,
      },
      note: { color: "border-blue-400", bgColor: "bg-blue-50", icon: FileText },
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

  // Action Modal Component
  const ActionModal = () => {
    if (!actionModal.show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Mark Complaint as Done
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Ticket:{" "}
            <span className="font-medium">
              {actionModal.complaint?.noTiket}
            </span>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            This will mark the complaint as resolved and send a notification to
            the customer.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Note (Optional)
            </label>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Enter any additional notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                setActionModal({ show: false, type: null, complaint: null })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleActionSubmit}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Confirm
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Regular Filter Dropdown Component
  const FilterDropdown = ({ column, options, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState(currentFilters || []);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredOptions = options.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCheckboxChange = (value, checked) => {
      if (checked) {
        setLocalFilters([...localFilters, value]);
      } else {
        setLocalFilters(localFilters.filter((f) => f !== value));
      }
    };

    const applyFilter = () => {
      handleFilter(column, localFilters);
      setShowFilterDropdown(null);
    };

    return (
      <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
        <div className="p-3">
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localFilters.includes(option)}
                  onChange={(e) =>
                    handleCheckboxChange(option, e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200 flex gap-2">
            <button
              onClick={applyFilter}
              className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={() => setShowFilterDropdown(null)}
              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (viewMode === "detail") {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToTable}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to List
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            Handle Complaint - {selectedComplaint?.noTiket}
          </h2>
          <div className="ml-auto">
            {selectedComplaint?.priority &&
              getPriorityBadge(selectedComplaint?.priority)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Complaint Details */}
          <div className="lg:col-span-1 space-y-4">
            {/* Status and Priority */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Status
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <div>{getStatusBadge(selectedComplaint?.status)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-gray-600">Last Update</span>
                    <p className="font-medium text-gray-900">
                      {selectedComplaint?.lastUpdate}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-600">SLA</span>
                    <p className="font-medium text-gray-900">
                      {selectedComplaint?.sla} days
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-600">Time Remaining</span>
                    <p
                      className={`font-medium ${
                        selectedComplaint?.timeRemaining.includes("Overdue")
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {selectedComplaint?.timeRemaining}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-gray-600">
                        Name
                      </span>
                      <p className="text-base text-gray-900 font-medium">
                        {selectedComplaint?.customerName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-gray-600">
                        Contact
                      </span>
                      <p className="text-base text-gray-900">
                        {selectedComplaint?.customerContact}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-gray-600">
                        Account Number
                      </span>
                      <p className="text-base text-gray-900">
                        {selectedComplaint?.number}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm font-medium text-gray-600">
                      Card Number
                    </span>
                    <p className="text-base text-gray-900 font-mono">
                      {selectedComplaint?.cardNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Issue Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Issue Details
                </h3>
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-gray-600">
                      Category
                    </span>
                    <p className="text-base text-gray-900">
                      {selectedComplaint?.category}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-gray-600">
                      Channel
                    </span>
                    <p className="text-base text-gray-900">
                      {selectedComplaint?.channel}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-600">
                    Description
                  </span>
                  <p className="text-base text-gray-900 bg-gray-50 rounded-lg p-3">
                    {selectedComplaint?.issueDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Actions
                </h3>
                <div className="w-full">
                  <button
                    onClick={(e) => handleActionClick(selectedComplaint, e)}
                    className="w-full px-6 py-3 text-sm font-semibold rounded-lg transition-colors bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckSquare size={16} />
                    Mark as Done
                  </button>
                </div>
              </div>
            </div>

            {/* Division Communication History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Division Communication
                  </h3>
                  <span className="text-sm text-gray-500">
                    {selectedComplaint?.divisionNotes?.length || 0} messages
                  </span>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedComplaint?.divisionNotes?.map((note) => {
                    const typeStyle = getNoteTypeStyle(note.type);
                    const IconComponent = typeStyle.icon;

                    return (
                      <div
                        key={note.id}
                        className={`border-l-4 ${typeStyle.color} pl-4 ${typeStyle.bgColor} rounded-r-lg p-3`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent size={14} className="text-gray-600" />
                          <span className="text-xs text-gray-600 font-medium">
                            {note.timestamp}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <div className="flex items-center gap-1">
                            <Building2 size={12} className="text-gray-500" />
                            <span className="text-xs text-gray-600 font-medium">
                              {note.division}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            {note.author}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 leading-relaxed">
                          {note.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Add Note */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add Division Note
                </h3>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add your note here..."
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  rows={4}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>

        <ActionModal />
      </div>
    );
  }

  const columns = [
    { key: "tglInput", label: "Date", sortable: true, filterable: true },
    { key: "noTiket", label: "Ticket No.", sortable: true, filterable: true },
    {
      key: "customerName",
      label: "Customer",
      sortable: true,
      filterable: true,
    },
    { key: "category", label: "Category", sortable: true, filterable: true },
    { key: "channel", label: "Channel", sortable: true, filterable: true },
    { key: "status", label: "Status", sortable: true, filterable: true },
    {
      key: "timeRemaining",
      label: "Time Left",
      sortable: false,
      filterable: false,
    },
    { key: "actions", label: "Actions", sortable: false, filterable: false },
  ];

  return (
    <div className="max-w-full mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Complaint Queue
          </h1>
          <p className="text-gray-600">
            Manage assigned complaints and track resolution progress
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {Object.keys(filters).length > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              <X size={14} />
              Clear All Filters
            </button>
          )}
          <div className="text-sm text-gray-600">
            {loading
              ? "Loading…"
              : `Showing ${processedComplaints.length} of ${originalComplaints.length} entries`}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-2">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">
                Total Assigned
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {loading ? "..." : originalComplaints.length}
              </p>
            </div>
            <User className="text-blue-600" size={24} />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-yellow-700">
                {loading
                  ? "..."
                  : originalComplaints.filter(
                      (c) =>
                        c.status.includes("Progress") ||
                        c.status.includes("Processing")
                    ).length}
              </p>
            </div>
            <Clock className="text-yellow-600" size={24} />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-700">
                {loading
                  ? "..."
                  : originalComplaints.filter(
                      (c) =>
                        c.status.includes("Closed") ||
                        c.status.includes("Completed")
                    ).length}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.keys(filters).length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, values]) => (
            <div
              key={key}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <span className="font-medium">
                {columns.find((c) => c.key === key)?.label}:
              </span>
              <span>{Array.isArray(values) ? values.join(", ") : values}</span>
              <button
                onClick={() => clearFilter(key)}
                className="ml-1 hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                No
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  <div className="flex items-center justify-between gap-2 relative">
                    <span>{column.label}</span>
                    <div className="flex items-center gap-1">
                      {column.sortable && (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="hover:text-blue-600"
                        >
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === "asc" ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )
                          ) : (
                            <ChevronDown size={14} className="text-gray-400" />
                          )}
                        </button>
                      )}
                      {column.filterable && (
                        <button
                          onClick={() =>
                            setShowFilterDropdown(
                              showFilterDropdown === column.key
                                ? null
                                : column.key
                            )
                          }
                          className={`hover:text-blue-600 ${
                            filters[column.key]
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        >
                          <Filter size={14} />
                        </button>
                      )}
                    </div>
                    {showFilterDropdown === column.key && (
                      <FilterDropdown
                        column={column.key}
                        options={getUniqueValues(column.key)}
                        currentFilters={filters[column.key] || []}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  className="border border-gray-300 px-4 py-6 text-sm"
                  colSpan={9}
                >
                  Loading…
                </td>
              </tr>
            ) : processedComplaints.length ? (
              processedComplaints.map((complaint, index) => (
                <tr
                  key={complaint.id ?? `${complaint.noTiket}-${index}`}
                  onClick={() => handleRowClick(complaint)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-200"
                >
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {complaint.tglInput}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-medium">
                    {complaint.noTiket}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {complaint.customerName}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {complaint.category}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {complaint.channel}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    {getStatusBadge(complaint.status)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    <span
                      className={
                        complaint.timeRemaining.includes("Overdue")
                          ? "text-red-600 font-medium"
                          : ""
                      }
                    >
                      {complaint.timeRemaining}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    {getActionButton(complaint)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-gray-300 px-4 py-6 text-sm"
                  colSpan={9}
                >
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {loading
            ? "Loading…"
            : `Showing ${processedComplaints.length} of ${originalComplaints.length} entries`}
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>

      <ActionModal />
    </div>
  );
};

export default DivisionComplaintHandler;
