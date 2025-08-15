"use client";

import React, { useState, useMemo } from "react";
import {
  Grid3X3,
  Edit,
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
  Paperclip
} from "lucide-react";

import Attachment from "@/components/Attachment";

const ComplaintTable = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'detail'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(null);
  const [newNote, setNewNote] = useState("");

  // Sample data
  const originalComplaints = [
    {
      id: 1,
      tglInput: "10/08/2025",
      noTiket: "123456778",
      channel: "ATM",
      category: "Tarik Tunai di Mesin ATM",
      customerName: "John Doe",
      number: "9027485",
      cardNumber: "123456787642",
      createdByUnit: "98765 Divisi CXC",
      unitNow: "BCC Unit Divisi CXC",
      status: "Inprogress",
      sla: "7",
      timeRemaining: "2 days",
      lastUpdate: "10/08/2025 14:30",
      assignedTo: "Current User",
      customerContact: "+62-812-3456-7890",
      issueDescription: "ATM tidak mengeluarkan uang tetapi saldo terpotong",
      divisionNotes: [
        {
          id: 1,
          timestamp: "10/08/2025 09:15",
          division: "Divisi CXC",
          author: "System",
          message:
            "Complaint received via ATM channel. Initial assessment required.",
          type: "system",
        },
        {
          id: 2,
          timestamp: "10/08/2025 10:30",
          division: "Divisi CXC",
          author: "Ahmad Rahman",
          message:
            "Needs verification from finance department. Customer reported transaction failed but amount was deducted. Checking ATM logs.",
          type: "note",
        },
        {
          id: 3,
          timestamp: "10/08/2025 14:30",
          division: "Finance Division",
          author: "Siti Nurhaliza",
          message:
            "Transaction logs reviewed. Amount deduction confirmed at 08:45. ATM maintenance team notified for physical inspection.",
          type: "note",
        },
      ],
    },
    {
      id: 2,
      tglInput: "09/08/2025",
      noTiket: "123456779",
      channel: "Mobile Banking",
      category: "Transfer Gagal",
      customerName: "Jane Smith",
      number: "9027486",
      cardNumber: "123456787643",
      createdByUnit: "98765 Divisi CXC",
      unitNow: "BCC Unit Divisi CXC",
      status: "Completed",
      sla: "5",
      timeRemaining: "1 day",
      lastUpdate: "11/08/2025 09:15",
      assignedTo: "Current User",
      customerContact: "+62-813-9876-5432",
      issueDescription: "Transfer ke rekening lain gagal namun saldo terpotong",
      divisionNotes: [
        {
          id: 1,
          timestamp: "09/08/2025 08:20",
          division: "Divisi CXC",
          author: "System",
          message: "Complaint received via Mobile Banking channel.",
          type: "system",
        },
        {
          id: 2,
          timestamp: "09/08/2025 11:45",
          division: "IT Division",
          author: "Budi Santoso",
          message:
            "Follow-up with IT division required. Transaction logs show incomplete process. Investigating database inconsistency.",
          type: "note",
        },
        {
          id: 3,
          timestamp: "11/08/2025 09:15",
          division: "Divisi CXC",
          author: "Current User",
          message:
            "Issue resolved. Amount has been refunded to customer account. Customer notified via SMS.",
          type: "resolution",
        },
      ],
    },
    {
      id: 3,
      tglInput: "08/08/2025",
      noTiket: "123456780",
      channel: "Internet Banking",
      category: "Login Bermasalah",
      customerName: "Bob Johnson",
      number: "9027487",
      cardNumber: "123456787644",
      createdByUnit: "98765 Divisi CXC",
      unitNow: "BCC Unit Divisi CXC",
      status: "Inprogress",
      sla: "3",
      timeRemaining: "Overdue by 2 days",
      lastUpdate: "08/08/2025 16:45",
      assignedTo: "Current User",
      customerContact: "+62-814-1111-2222",
      issueDescription:
        "Tidak bisa login ke internet banking sejak 3 hari lalu",
      divisionNotes: [
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
          timestamp: "08/08/2025 16:45",
          division: "Security Division",
          author: "Indira Sari",
          message:
            "Escalated to security team. Password reset attempted but issue persists. Account may be temporarily locked due to security protocols.",
          type: "escalation",
        },
      ],
    },
    {
      id: 4,
      tglInput: "11/08/2025",
      noTiket: "123456781",
      channel: "ATM",
      category: "Kartu Tertelan",
      customerName: "Alice Brown",
      number: "9027488",
      cardNumber: "123456787645",
      createdByUnit: "98765 Divisi CXC",
      unitNow: "BCC Unit Divisi CXC",
      status: "Inprogress",
      sla: "7",
      timeRemaining: "5 days",
      lastUpdate: "11/08/2025 11:20",
      assignedTo: "Current User",
      customerContact: "+62-815-5555-6666",
      issueDescription: "Kartu ATM tertelan di mesin ATM Cabang Sudirman",
      divisionNotes: [
        {
          id: 1,
          timestamp: "11/08/2025 09:30",
          division: "Divisi CXC",
          author: "System",
          message: "Complaint received via ATM channel.",
          type: "system",
        },
        {
          id: 2,
          timestamp: "11/08/2025 11:20",
          division: "ATM Operations",
          author: "Rudi Hartono",
          message:
            "Card retrieval requested from ATM maintenance team. Customer notified of process. Expected retrieval within 24 hours.",
          type: "note",
        },
      ],
    },
    {
      id: 5,
      tglInput: "12/08/2025",
      noTiket: "123456782",
      channel: "Call Center",
      category: "Informasi Saldo",
      customerName: "Charlie Wilson",
      number: "9027489",
      cardNumber: "123456787646",
      createdByUnit: "98765 Divisi CXC",
      unitNow: "BCC Unit Divisi CXC",
      status: "Inprogress",
      sla: "1",
      timeRemaining: "Same day",
      lastUpdate: "12/08/2025 08:30",
      assignedTo: "Current User",
      customerContact: "+62-816-7777-8888",
      issueDescription: "Meminta informasi saldo dan mutasi rekening",
      divisionNotes: [
        {
          id: 1,
          timestamp: "12/08/2025 08:30",
          division: "Call Center",
          author: "Maya Putri",
          message:
            "Information provided via secure channel. Customer satisfied with response. Waiting for final confirmation.",
          type: "note",
        },
      ],
    },
  ];

  // Get unique values for filter options
  const getUniqueValues = (key) => {
    return [...new Set(originalComplaints.map((item) => item[key]))].sort();
  };

  // Apply filters and sorting
  const processedComplaints = useMemo(() => {
    let filtered = originalComplaints;

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        if (key === "tglInput" && typeof filters[key] === "object") {
          // Date filter logic
          const dateFilter = filters[key];
          filtered = filtered.filter((item) => {
            const itemDate = new Date(
              item.tglInput.split("/").reverse().join("-")
            );

            if (dateFilter.type === "specific") {
              const targetDate = new Date(dateFilter.specificDate);
              return itemDate.toDateString() === targetDate.toDateString();
            } else if (dateFilter.type === "range") {
              const startDate = new Date(dateFilter.startDate);
              const endDate = new Date(dateFilter.endDate);
              return itemDate >= startDate && itemDate <= endDate;
            }
            return true;
          });
        } else if (filters[key].length > 0) {
          // Regular filter logic
          filtered = filtered.filter((item) =>
            filters[key].some((filterValue) =>
              item[key].toLowerCase().includes(filterValue.toLowerCase())
            )
          );
        }
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

  const openAttachments = () => setViewMode("attachments");
  const backFromAttachments = () => setViewMode(selectedComplaint ? "detail" : "table");


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

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In a real app, this would make an API call
      console.log("Adding note:", newNote);
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

  // Date Filter Component
  const DateFilterDropdown = ({ currentDateFilter }) => {
    const [filterType, setFilterType] = useState(
      currentDateFilter?.type || "range"
    );
    const [startDate, setStartDate] = useState(
      currentDateFilter?.startDate || ""
    );
    const [endDate, setEndDate] = useState(currentDateFilter?.endDate || "");
    const [specificDate, setSpecificDate] = useState(
      currentDateFilter?.specificDate || ""
    );

    const applyDateFilter = () => {
      const dateFilter = {
        type: filterType,
        startDate: filterType === "range" ? startDate : "",
        endDate: filterType === "range" ? endDate : "",
        specificDate: filterType === "specific" ? specificDate : "",
      };
      handleFilter("tglInput", dateFilter);
      setShowFilterDropdown(null);
    };

    const clearDateFilter = () => {
      clearFilter("tglInput");
      setShowFilterDropdown(null);
    };

    // Quick date options
    const quickDateOptions = [
      {
        label: "Today",
        value: () => {
          const today = new Date().toISOString().split("T")[0];
          return { type: "specific", specificDate: today };
        },
      },
      {
        label: "Yesterday",
        value: () => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return {
            type: "specific",
            specificDate: yesterday.toISOString().split("T")[0],
          };
        },
      },
      {
        label: "Last 7 Days",
        value: () => {
          const end = new Date().toISOString().split("T")[0];
          const start = new Date();
          start.setDate(start.getDate() - 7);
          return {
            type: "range",
            startDate: start.toISOString().split("T")[0],
            endDate: end,
          };
        },
      },
      {
        label: "Last 30 Days",
        value: () => {
          const end = new Date().toISOString().split("T")[0];
          const start = new Date();
          start.setDate(start.getDate() - 30);
          return {
            type: "range",
            startDate: start.toISOString().split("T")[0],
            endDate: end,
          };
        },
      },
      {
        label: "This Month",
        value: () => {
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split("T")[0];
          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0];
          return { type: "range", startDate: start, endDate: end };
        },
      },
    ];

    const handleQuickDate = (quickOption) => {
      const result = quickOption.value();
      setFilterType(result.type);
      if (result.type === "range") {
        setStartDate(result.startDate);
        setEndDate(result.endDate);
        setSpecificDate("");
      } else {
        setSpecificDate(result.specificDate);
        setStartDate("");
        setEndDate("");
      }
    };

    return (
      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
        <div className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Filter by Date</h4>

          {/* Quick Options */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Options
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickDateOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickDate(option)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 text-left"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="range"
                  checked={filterType === "range"}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Date Range</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="specific"
                  checked={filterType === "specific"}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Specific Date</span>
              </label>
            </div>
          </div>

          {/* Date Inputs */}
          {filterType === "range" ? (
            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={applyDateFilter}
              disabled={
                filterType === "range" ? !startDate || !endDate : !specificDate
              }
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Filter
            </button>
            <button
              onClick={clearDateFilter}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              onClick={() => setShowFilterDropdown(null)}
              className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Cancel
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

    if (viewMode === "attachments") {
    return (
      <div className="max-w-full mx-auto p-6 bg-white">
        <div className="mb-4">
          <button
            onClick={backFromAttachments}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to {selectedComplaint ? "Detail" : "List"}</span>
          </button>
        </div>

        {/* Pass id/objek ticket kalau diperlukan oleh Attachment */}
        <Attachment ticketId={selectedComplaint?.noTiket} ticket={selectedComplaint} />
      </div>
    );
  }

  if (viewMode === "detail") {
    // Timeline steps for tracking
    const timelineSteps = [
      {
        id: 1,
        title: "Sudah terkirim ke UIC terkait",
        status: "completed",
        icon: CheckCircle,
        color: "bg-gray-400",
        timestamp: "10/08/2025 09:15",
      },
      {
        id: 2,
        title: "Belum Over SLA",
        status: "current",
        icon: Clock,
        color: "bg-orange-600",
        timestamp: "10/08/2025 10:30",
      },
      {
        id: 3,
        title: "Over SLA → Sending Notification (UIC Terkait)",
        status: "current",
        icon: AlertTriangle,
        color: "bg-orange-600",
        timestamp: "11/08/2025 08:00",
      },
      {
        id: 4,
        title: "Call",
        status: "pending",
        icon: Clock,
        color: "bg-gray-300",
        timestamp: "Pending",
      },
    ];

    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToTable}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Table
          </button>

          <h2 className="text-2xl font-bold text-gray-900">
            Complaint Detail - {selectedComplaint?.noTiket}
          </h2>
                    <button
                      onClick={openAttachments}
                      className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Paperclip size={18} />
                      Attachments
                    </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Tracking Timeline */}
            <div className="bg-white rounded-lg border-2 border-orange-400 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Complaint Tracking
              </h3>
              <div className="space-y-6">
                {timelineSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isLast = index === timelineSteps.length - 1;

                  return (
                    <div key={step.id} className="relative flex items-start">
                      {/* Timeline Line */}
                      {!isLast && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300"></div>
                      )}

                      {/* Icon Circle */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white shadow-lg`}
                      >
                        <IconComponent size={20} />
                      </div>

                      {/* Content */}
                      <div className="ml-4 flex-1">
                        <p className="text-base font-medium text-gray-900 leading-6 mb-1">
                          {step.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {step.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
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

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Ticket Number
                    </span>
                    <p className="text-base text-gray-900">
                      {selectedComplaint?.noTiket}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Date Input
                    </span>
                    <p className="text-base text-gray-900">
                      {selectedComplaint?.tglInput}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Channel
                    </span>
                    <p className="text-base text-gray-900">
                      {selectedComplaint?.channel}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Status
                    </span>
                    <div className="mt-1">
                      {getStatusBadge(selectedComplaint?.status)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      SLA
                    </span>
                    <p className="text-base text-gray-900">
                      {selectedComplaint?.sla} days
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Category
                    </span>
                    <p className="text-base text-gray-900">
                      {selectedComplaint?.category}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
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

            {/* Issue Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Issue Details
                </h3>
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-gray-600">
                      Last Update
                    </span>
                    <p className="text-base text-gray-900">
                      {selectedComplaint?.lastUpdate}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-gray-600">
                      Time Remaining
                    </span>
                    <p
                      className={`text-base font-medium ${selectedComplaint?.timeRemaining.includes("Overdue")
                          ? "text-red-600"
                          : "text-gray-900"
                        }`}
                    >
                      {selectedComplaint?.timeRemaining}
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

            {/* Unit Information Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Unit Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Created By Unit
                  </span>
                  <p className="text-base text-gray-900">
                    {selectedComplaint?.createdByUnit}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Current Unit
                  </span>
                  <p className="text-base text-gray-900">
                    {selectedComplaint?.unitNow}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reorganized columns for better layout
  const columns = [
    {
      key: "tglInput",
      label: "Date",
      sortable: true,
      filterable: true,
      width: "w-28",
    },
    {
      key: "noTiket",
      label: "Ticket #",
      sortable: true,
      filterable: true,
      width: "w-32",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      width: "w-28",
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true,
      filterable: true,
      width: "w-36",
    },
    {
      key: "channel",
      label: "Channel",
      sortable: true,
      filterable: true,
      width: "w-32",
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      filterable: true,
      width: "w-44",
    },
    {
      key: "sla",
      label: "SLA",
      sortable: true,
      filterable: true,
      width: "w-16",
    },
    {
      key: "number",
      label: "Account #",
      sortable: true,
      filterable: true,
      width: "w-24",
    },
    {
      key: "unitNow",
      label: "Current Unit",
      sortable: true,
      filterable: true,
      width: "w-40",
    },
  ];

  return (
    <div className="max-w-full mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
            Showing {processedComplaints.length} of {originalComplaints.length}{" "}
            entries
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.keys(filters).length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, values]) => {
            if (key === "tglInput" && typeof values === "object") {
              // Date filter display
              const dateFilter = values;
              const displayText =
                dateFilter.type === "specific"
                  ? `Specific: ${dateFilter.specificDate}`
                  : `Range: ${dateFilter.startDate} to ${dateFilter.endDate}`;

              return (
                <div
                  key={key}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <span className="font-medium">Date:</span>
                  <span>{displayText}</span>
                  <button
                    onClick={() => clearFilter(key)}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            } else {
              // Regular filter display
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <span className="font-medium">
                    {columns.find((c) => c.key === key)?.label}:
                  </span>
                  <span>
                    {Array.isArray(values) ? values.join(", ") : values}
                  </span>
                  <button
                    onClick={() => clearFilter(key)}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 w-16">
                No
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 ${column.width || ""
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 relative">
                    <span className="truncate">{column.label}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
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
                          className={`hover:text-blue-600 ${filters[column.key]
                              ? "text-blue-600"
                              : "text-gray-400"
                            }`}
                        >
                          <Filter size={14} />
                        </button>
                      )}
                    </div>
                    {showFilterDropdown === column.key &&
                      (column.key === "tglInput" ? (
                        <DateFilterDropdown
                          currentDateFilter={filters[column.key]}
                        />
                      ) : (
                        <FilterDropdown
                          column={column.key}
                          options={getUniqueValues(column.key)}
                          currentFilters={filters[column.key] || []}
                        />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedComplaints.map((complaint, index) => (
              <tr
                key={complaint.id}
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
                <td className="border border-gray-300 px-4 py-3 text-sm">
                  {getStatusBadge(complaint.status)}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 truncate">
                  {complaint.customerName}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                  {complaint.channel}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 truncate">
                  {complaint.category}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 text-center">
                  {complaint.sla}d
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                  {complaint.number}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 truncate">
                  {complaint.unitNow}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {processedComplaints.length} of {originalComplaints.length}{" "}
          entries
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
    </div>
  );
};

export default ComplaintTable;