"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Paperclip,
  ChevronRight,
  Users,
  Ticket,
  Eye,
  EyeOff,
} from "lucide-react";

import Attachment from "@/components/Attachment";
import FloatingCustomerContact from "@/components/FloatingCustomerContact";
import useTicketDetail from "@/hooks/useTicketDetail";
import useTicketStore from "@/store/ticketStore";
import useUser from "@/hooks/useUser";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";

import useTicket from "@/hooks/useTicket";
import toast from "react-hot-toast";

const ComplaintTable = ({ isActive = false }) => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table', 'grouped', or 'detail'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Grouped view specific states
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [showAllGroups, setShowAllGroups] = useState(false);

  // API integration
  const { list, loading, error, pagination, fetchTickets, updateTicket } =
    useTicket();
  const { selectedId, detail, fetchTicketDetail } = useTicketDetail();
  const { user } = useUser();
  const [doingAction, setDoingAction] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const ticketStore = useTicketStore();

  const PAGE_SIZE = 10;

  useEffect(() => {
    if (isActive) {
      // Fetch all tickets at once for client-side pagination
      fetchTickets({ limit: 1000, offset: 0, force: false });
    }
  }, [isActive]); // Only fetch once when component becomes active

  const getActionButton = (complaint, isInDetail = false) => {
    // base style yang konsisten untuk alignment
    const sizing = isInDetail
      ? "w-full sm:h-12 px-4 sm:px-6 text-sm sm:text-base"
      : "w-full sm:h-10 px-3 sm:px-4 text-xs sm:text-sm";

    return (
      <Button
        variant="success"
        icon={CheckSquare}
        size={isInDetail ? "lg" : "sm"} // tetap pakai prop size untuk konsistensi komponen
        className={`${sizing}`}
        onClick={(e) =>
          handleActionClick(complaint, e, { reset: true, refresh: true })
        }
      >
        {/* Mobile: teks pendek; ≥sm: teks lengkap */}
        <span className="sm:hidden">Close</span>
        <span className="hidden sm:inline">Close</span>
      </Button>
    );
  };

  const handleActionClick = async (
    complaint,
    event,
    opts = { reset: true, refresh: true }
  ) => {
    event?.stopPropagation();
    if (doingAction) return;

    try {
      setDoingAction(true);

      const t = complaint?.fullTicketData || {};

      // helper format tanggal dd/MM/yyyy (untuk division_notes.timestamp)
      const pad = (n) => String(n).padStart(2, "0");
      const now = new Date();
      const ts = `${pad(now.getDate())}/${pad(
        now.getMonth() + 1
      )}/${now.getFullYear()}`;

      // ambil nilai dari data ketika tersedia, fallback aman jika tidak
      const payload = {
        action: "CLOSED",
        // priority tidak ada di sample data -> fallback ke 3 (REGULAR) supaya sesuai contoh
        priority_id: Number(t?.priority?.priority_id ?? 3),
        // "record" tidak ada field khusus -> gunakan ticket_number/noTiket sebagai identitas
        record: t?.ticket_number || complaint?.noTiket || "",
        issue_channel_id: t?.issue_channel?.channel_id,
        intake_source_id: t?.intake_source?.source_id,
        complaint_id: t?.complaint?.complaint_id,
        // amount/transaction_date/terminal bisa saja tidak tersedia -> kirim hanya jika ada
        amount: t?.amount != null ? Number(t.amount) : undefined,
        transaction_date: t?.transaction_date || t?.created_time || undefined,
        terminal_id: t?.terminal?.terminal_id ?? t?.terminal_id ?? undefined,
        // deskripsi ambil dari detail kalau ada, lalu dari fullTicketData/row
        description:
          ticketStore.detailById[complaint?.id]?.ticket?.description ||
          t?.description ||
          complaint?.issueDescription ||
          "",
        // isi default solution agar sesuai contoh
        solution: "Technical issue resolved, customer notified",
        division_notes: [
          {
            division:
              t?.division?.division_code || t?.division?.division_name || "CXC",
            timestamp: ts,
            msg: "Closed by division after resolution",
            author: "Agent CXC",
          },
        ],
      };

      // buang key yang value-nya undefined/null/placeholder "—"
      const compact = (obj) =>
        Object.fromEntries(
          Object.entries(obj).filter(
            ([, v]) => v !== undefined && v !== null && v !== "—"
          )
        );

      const finalPayload = {
        ...compact(payload),
        // pastikan division_notes tetap ikut (tidak di-compact)
        division_notes: payload.division_notes,
      };

      await updateTicket(complaint.id, finalPayload);

      if (opts.reset) ticketStore.reset();
      if (opts.refresh) {
        await fetchTickets({ limit: 1000, offset: 0, force: true });
      }

      toast.success("Ticket Closed!");
    } catch (err) {
      toast.error(err?.message ?? "Gagal menandai tiket");
    } finally {
      setDoingAction(false);
    }
  };

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

  // Map API data to table format and filter out "open" status tickets
  const originalComplaints = useMemo(() => {
    if (!Array.isArray(list)) return [];

    // Filter out tickets with "open" status (case-insensitive)
    const filteredList = list.filter((t) => {
      const status =
        t?.employee_status?.employee_status_name?.toLowerCase() || "";
      return status !== "open";
    });

    return filteredList.map((t) => {
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
        createdByUnit: t?.intake_source?.source_name || "-",
        unitNow: t?.division?.division_name || "-",
        status: t?.employee_status?.employee_status_name || "-",
        sla: t?.policy?.sla_days != null ? String(t.policy.sla_days) : "-",
        timeRemaining: t?.sla_info?.is_overdue
          ? "Overdue"
          : `${t?.sla_info?.remaining_hours || 0}h remaining`,
        lastUpdate: fmtDate(t?.created_time),
        assignedTo: t?.division?.division_name || "-",
        customerContact: t?.customer?.email || "-",
        issueDescription: t?.description || "-",
        divisionNotes: [],
        fullTicketData: t,
      };
    });
  }, [list]);

  // Group data by customer name with search filtering
  const groupedData = useMemo(() => {
    const groups = originalComplaints.reduce((acc, item) => {
      const customerName = item.customerName;
      if (!acc[customerName]) {
        acc[customerName] = {
          customerName,
          tickets: [],
          totalTickets: 0,
          statusSummary: {},
        };
      }
      acc[customerName].tickets.push(item);
      acc[customerName].totalTickets++;

      // Count status summary
      const status = item.status;
      acc[customerName].statusSummary[status] =
        (acc[customerName].statusSummary[status] || 0) + 1;

      return acc;
    }, {});

    let allGroups = Object.values(groups);

    // Filter by search query
    if (searchQuery.trim()) {
      allGroups = allGroups.filter(
        (group) =>
          group.customerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          group.tickets.some(
            (ticket) =>
              ticket.noTiket
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              ticket.category
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              ticket.channel.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    return allGroups.sort((a, b) =>
      a.customerName.localeCompare(b.customerName)
    );
  }, [originalComplaints, searchQuery]);

  // Tambahkan useEffect ini setelah groupedData
  useEffect(() => {
    if (groupedData.length > 0) {
      // Set semua group sebagai collapsed by default
      setCollapsedGroups(new Set(groupedData.map((g) => g.customerName)));
    }
  }, [groupedData]);

  // Get unique values for filter options
  const getUniqueValues = (key) => {
    return [...new Set(originalComplaints.map((item) => item[key]))].sort();
  };

  // Apply filters and sorting, then paginate client-side
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
  }, [filters, sortConfig, originalComplaints]);

  // Client-side pagination
  const paginatedComplaints = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return processedComplaints.slice(startIndex, endIndex);
  }, [processedComplaints, currentPage, PAGE_SIZE]);

  const totalPages = Math.ceil(processedComplaints.length / PAGE_SIZE);

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
  const backFromAttachments = () =>
    setViewMode(
      selectedComplaint
        ? "detail"
        : viewMode === "grouped"
        ? "grouped"
        : "table"
    );

  const clearAllFilters = () => {
    setFilters({});
    setSortConfig({ key: null, direction: "asc" });
  };

  const handleRowClick = async (complaint) => {
    try {
      await fetchTicketDetail(complaint.id, { force: false });
      setSelectedComplaint(complaint);
      setViewMode("detail");
    } catch {
      // Error handling - could show toast notification
    }
  };

  const handleBackToTable = () => {
    setViewMode(viewMode === "grouped" ? "grouped" : "table");
    setSelectedComplaint(null);
  };

  // Grouped view specific functions
  const toggleGroup = (customerName) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(customerName)) {
      newCollapsed.delete(customerName);
    } else {
      newCollapsed.add(customerName);
    }
    setCollapsedGroups(newCollapsed);
  };

  const toggleAllGroups = () => {
    if (collapsedGroups.size === 0) {
      // Jika semua expanded, collapse semua
      setCollapsedGroups(new Set(groupedData.map((g) => g.customerName)));
      setShowAllGroups(false);
    } else {
      // Jika ada yang collapsed, expand semua
      setCollapsedGroups(new Set());
      setShowAllGroups(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const StatusSummary = ({ statusSummary }) => {
    const getStatusColor = (status) => {
      const statusLower = status.toLowerCase();

      switch (statusLower) {
        case "open":
          return "bg-blue-100 text-blue-800 border-blue-200";
        case "handled by cxc":
        case "handledcxc":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "escalated":
          return "bg-orange-100 text-orange-800 border-orange-200";
        case "done by uic":
        case "doneuic":
        case "donbyuic":
          return "bg-purple-100 text-purple-800 border-purple-200";
        case "closed":
        case "completed":
        case "resolved":
          return "bg-green-100 text-green-800 border-green-200";
        case "pending":
        case "waiting":
          return "bg-gray-100 text-gray-800 border-gray-200";
        case "cancelled":
        case "declined":
        case "rejected":
          return "bg-red-100 text-red-800 border-red-200";
        case "in progress":
        case "processing":
          return "bg-indigo-100 text-indigo-800 border-indigo-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    return (
      <div className="flex gap-2 flex-wrap">
        {Object.entries(statusSummary).map(([status, count]) => (
          <span
            key={status}
            className={`text-xs px-2 py-1 rounded border ${getStatusColor(
              status
            )}`}
          >
            {status}: {count}
          </span>
        ))}
      </div>
    );
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedComplaint?.id) return;

    setIsAddingNote(true);
    try {
      // Get existing notes first
      const ticketDetail =
        detail || ticketStore.detailById[selectedComplaint?.id];
      const existingNotes = ticketDetail?.__raw?.division_notes || [];

      // Build new note object
      const authorName =
        user?.full_name || user?.name || user?.email || "Unknown";
      const divisionName =
        user?.role_details?.role_name || user?.role || "Unknown";

      const newNoteObject = {
        division: divisionName,
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        msg: newNote.trim(),
        author: authorName,
      };

      // Combine existing notes with new note
      const allNotes = [...existingNotes, newNoteObject];

      // Use existing updateTicket function with all notes
      await updateTicket(selectedComplaint.id, {
        division_notes: allNotes,
      });

      // Refresh ticket detail to show new note
      await fetchTicketDetail(selectedComplaint.id, { force: true });

      toast.success("Note added successfully!");
      setNewNote("");
    } catch (error) {
      console.error("Failed to add note:", error);
      toast.error(error?.message || "Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  const getNoteStyle = (type, division) => {
    const typeConfig = {
      system: { icon: MessageSquare },
      note: { icon: FileText },
      escalation: { icon: AlertTriangle },
      resolution: { icon: CheckCircle },
      status_change: { icon: Clock },
      activity: { icon: MessageSquare },
    };

    const divisionConfig = {
      Open: { color: "border-blue-400", bgColor: "bg-blue-50" },
      "Handled by CxC": { color: "border-yellow-400", bgColor: "bg-yellow-50" },
      Escalated: { color: "border-orange-400", bgColor: "bg-orange-50" },
      "Done by UIC": { color: "border-purple-400", bgColor: "bg-purple-50" },
      Closed: { color: "border-green-400", bgColor: "bg-green-50" },
      CXC: { color: "border-blue-400", bgColor: "bg-blue-50" },
      OPR: { color: "border-green-400", bgColor: "bg-green-50" },
      IT: { color: "border-purple-400", bgColor: "bg-purple-50" },
      Finance: { color: "border-yellow-400", bgColor: "bg-yellow-50" },
      Security: { color: "border-red-400", bgColor: "bg-red-50" },
      "ATM Operations": { color: "border-orange-400", bgColor: "bg-orange-50" },
      "Call Center": { color: "border-pink-400", bgColor: "bg-pink-50" },
      Customer: { color: "border-gray-400", bgColor: "bg-gray-50" },
      Employee: { color: "border-indigo-400", bgColor: "bg-indigo-50" },
    };

    const typeStyle = typeConfig[type] || typeConfig.note;
    const divisionStyle = divisionConfig[division] || {
      color: "border-gray-400",
      bgColor: "bg-gray-50",
    };

    return { ...typeStyle, ...divisionStyle };
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
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDate(option)}
                  className="text-left"
                >
                  {option.label}
                </Button>
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
            <Button
              variant="primary"
              size="sm"
              onClick={applyDateFilter}
              disabled={
                filterType === "range" ? !startDate || !endDate : !specificDate
              }
              className="flex-1"
            >
              Apply Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearDateFilter}
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterDropdown(null)}
            >
              Cancel
            </Button>
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
            <Button
              variant="primary"
              size="sm"
              onClick={applyFilter}
              className="flex-1"
            >
              Apply
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterDropdown(null)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Attachments view
  if (viewMode === "attachments") {
    return (
      <div className="max-w-full mx-auto p-6 bg-white">
        <div className="mb-4">
          <Button
            variant="grey"
            icon={ArrowLeft}
            onClick={backFromAttachments}
            className="px-5 py-2.5"
          >
            Back to {selectedComplaint ? "Detail" : "List"}
          </Button>
        </div>

        {/* Pass proper ticket data to Attachment component */}
        <Attachment
          ticketId={selectedComplaint?.id}
          ticketNumber={selectedComplaint?.noTiket}
          ticket={selectedComplaint?.fullTicketData}
        />
      </div>
    );
  }

  if (viewMode === "detail") {
    // Generate timeline steps based on employee_status_id
    const currentStatusId =
      selectedComplaint?.fullTicketData?.employee_status?.employee_status_id ||
      1;

    const allSteps = [
      { id: 1, title: "Open", icon: Clock, color: "bg-blue-500" },
      { id: 2, title: "Handled by CXC", icon: User, color: "bg-yellow-500" },
      {
        id: 3,
        title: "Escalated",
        icon: AlertTriangle,
        color: "bg-orange-500",
      },
      {
        id: 6,
        title: "Done by UIC",
        icon: CheckSquare,
        color: "bg-purple-500",
      },
      { id: 4, title: "Closed", icon: CheckCircle, color: "bg-green-500" },
    ];

    const timelineSteps = allSteps.map((step) => ({
      ...step,
      status: step.id <= currentStatusId ? "completed" : "pending",
      timestamp:
        step.id <= currentStatusId
          ? selectedComplaint?.lastUpdate || "Completed"
          : "Pending",
    }));

    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="grey"
            icon={ArrowLeft}
            onClick={handleBackToTable}
            className="px-5 py-2.5"
          >
            Back to {viewMode === "grouped" ? "Group View" : "Table"}
          </Button>

          <h2 className="text-2xl font-bold text-gray-900">
            Complaint Detail - {selectedComplaint?.noTiket}
          </h2>
          <Button
            variant="grey"
            icon={Paperclip}
            onClick={openAttachments}
            className="ml-auto px-5 py-2.5"
          >
            Attachments
          </Button>
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
                {(() => {
                  const ticketDetail =
                    detail || ticketStore.detailById[selectedComplaint?.id];
                  const currentStatusId =
                    selectedComplaint?.fullTicketData?.employee_status
                      ?.employee_status_id || 1;
                  const employeeStatusHistory =
                    ticketDetail?.tracking?.employeeStatusHistory || [];

                  // Define all possible steps
                  const allSteps = [
                    {
                      id: 1,
                      title: "Open",
                      icon: Clock,
                      color: "bg-blue-500",
                      code: "OPEN",
                    },
                    {
                      id: 2,
                      title: "Handled by CXC",
                      icon: User,
                      color: "bg-yellow-500",
                      code: "HANDLEDCXC",
                    },
                    {
                      id: 3,
                      title: "Escalated",
                      icon: AlertTriangle,
                      color: "bg-orange-500",
                      code: "ESCALATED",
                    },
                    {
                      id: 6,
                      title: "Done by UIC",
                      icon: CheckSquare,
                      color: "bg-purple-500",
                      code: "DONEUIC",
                    },
                    {
                      id: 4,
                      title: "Closed",
                      icon: CheckCircle,
                      color: "bg-green-500",
                      code: "CLOSED",
                    },
                  ];

                  return allSteps.map((step, index) => {
                    const IconComponent = step.icon;
                    const isLast = index === allSteps.length - 1;
                    const isCompleted = step.id <= currentStatusId;

                    // Find matching history item for this step
                    const historyItem = employeeStatusHistory.find(
                      (h) => h.status_code === step.code
                    );

                    return (
                      <div key={step.id} className="relative flex items-start">
                        {/* Timeline Line */}
                        {!isLast && (
                          <div
                            className={`absolute left-6 top-12 w-0.5 h-16 ${
                              isCompleted ? "bg-gray-400" : "bg-gray-200"
                            }`}
                          ></div>
                        )}

                        {/* Icon Circle */}
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full ${
                            isCompleted ? step.color : "bg-gray-300"
                          } flex items-center justify-center text-white shadow-lg`}
                        >
                          <IconComponent size={20} />
                        </div>

                        {/* Content */}
                        <div className="ml-4 flex-1">
                          <p
                            className={`text-base font-medium leading-6 mb-1 ${
                              isCompleted ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {step.title}
                          </p>
                          <p
                            className={`text-sm ${
                              isCompleted ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {historyItem
                              ? `${fmtDate(historyItem.changed_at)} by ${
                                  historyItem.changed_by
                                }`
                              : isCompleted
                              ? "Completed"
                              : "Pending"}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
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
                    {(() => {
                      const ticketDetail =
                        detail || ticketStore.detailById[selectedComplaint?.id];
                      const statusHistoryNotes =
                        ticketDetail?.notes?.division || [];
                      const rawDivisionNotes =
                        ticketDetail?.__raw?.division_notes || [];
                      return (
                        statusHistoryNotes.length + rawDivisionNotes.length
                      );
                    })()}{" "}
                    messages
                  </span>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {(() => {
                    const ticketDetail =
                      detail || ticketStore.detailById[selectedComplaint?.id];
                    const statusHistoryNotes =
                      ticketDetail?.notes?.division || [];
                    const rawDivisionNotes =
                      ticketDetail?.__raw?.division_notes || [];

                    // Combine both sources and sort by timestamp
                    const allNotes = [
                      ...statusHistoryNotes,
                      ...rawDivisionNotes,
                    ].sort((a, b) => {
                      const dateA = new Date(a.timestamp);
                      const dateB = new Date(b.timestamp);
                      return dateA - dateB;
                    });

                    if (allNotes.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare
                            size={48}
                            className="mx-auto mb-2 text-gray-300"
                          />
                          <p>No division notes available</p>
                        </div>
                      );
                    }

                    return allNotes.map((note, index) => {
                      const noteStyle = getNoteStyle(
                        note.type || "note",
                        note.division
                      );
                      const IconComponent = noteStyle.icon;

                      // Handle different timestamp formats
                      const displayTimestamp = note.timestamp?.includes("/")
                        ? note.timestamp
                        : fmtDate(note.timestamp);

                      return (
                        <div
                          key={note.id || `${note.division}-${index}`}
                          className={`border-l-4 ${noteStyle.color} pl-4 ${noteStyle.bgColor} rounded-r-lg p-3`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent
                              size={14}
                              className="text-gray-600"
                            />
                            <span className="text-xs text-gray-600 font-medium">
                              {displayTimestamp}
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
                            {note.msg || note.message || "No message"}
                          </p>
                          {note.statusCode && (
                            <div className="mt-2 text-xs text-gray-500">
                              Status: {note.statusName} ({note.statusCode})
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
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
                <Button
                  variant="primary"
                  icon={Send}
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAddingNote}
                  loading={isAddingNote}
                  className="w-full"
                >
                  {isAddingNote ? "Saving Note..." : "Save Note"}
                </Button>
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
                      <StatusBadge status={selectedComplaint?.status} />
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
                      className={`text-base font-medium ${
                        selectedComplaint?.timeRemaining.includes("Overdue")
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
                    {ticketStore.detailById[selectedComplaint?.id]?.ticket
                      ?.description ||
                      selectedComplaint?.fullTicketData?.description ||
                      selectedComplaint?.issueDescription ||
                      "-"}
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
                    Source
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
            {/* button mark as done */}
            {(() => {
              const code = String(
                selectedComplaint?.fullTicketData?.employee_status
                  ?.employee_status_code || ""
              ).toUpperCase();
              const name = String(
                selectedComplaint?.status || ""
              ).toUpperCase();
              return (
                code === "DONEBYUIC" ||
                code === "DONEUIC" ||
                name.includes("DONE BY UIC")
              );
            })() && (
              <div className="pt-2 max-w-sm sm:max-w-none">
                {getActionButton(selectedComplaint, true)}
              </div>
            )}
          </div>
        </div>

        {/* FloatingCustomerContact - only for non-closed/declined tickets */}
        {(() => {
          const status = selectedComplaint?.status?.toLowerCase() || "";
          const shouldShowContact =
            status !== "closed" && status !== "declined";

          if (!shouldShowContact) return null;

          return (
            <FloatingCustomerContact
              room={`ticket-${selectedComplaint?.id}`}
              detail={{
                ids: {
                  customerId:
                    selectedComplaint?.fullTicketData?.customer?.id ||
                    selectedComplaint?.customerName,
                },
              }}
            />
          );
        })()}
      </div>
    );
  }

  // Grouped View
  if (viewMode === "grouped") {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Customer Tickets - Grouped View
          </h2>
          <div className="flex gap-2">
            <Button
              variant="primary"
              icon={Users}
              onClick={() => setViewMode("grouped")}
              className="px-4 py-2"
            >
              Group View
            </Button>
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setViewMode("table")}
              className="px-4 py-2"
            >
              Table View
            </Button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customer name, ticket number, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {searchQuery && (
              <span className="text-sm text-gray-600">
                {groupedData.length} customer
                {groupedData.length !== 1 ? "s" : ""} found
              </span>
            )}
            <button
              onClick={toggleAllGroups}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {collapsedGroups.size === 0 ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {collapsedGroups.size === 0 ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {groupedData.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No customers found
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? `No customers match "${searchQuery}". Try a different search term.`
                  : "No customer data available."}
              </p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            groupedData.map((group) => (
              <div
                key={group.customerName}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Group Header */}
                <div
                  className="bg-orange-50/60 border-b border-orange-100 p-4 cursor-pointer hover:bg-orange-100/65 transition-colors"
                  onClick={() => toggleGroup(group.customerName)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {collapsedGroups.has(group.customerName) ? (
                        <ChevronRight className="w-5 h-5 text-orange-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-orange-600" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-orange-900">
                          <Users className="inline-block w-5 h-5 mr-2" />
                          {group.customerName}
                        </h3>
                        <p className="text-sm text-orange-700">
                          <Ticket className="inline-block w-4 h-4 mr-1" />
                          {group.totalTickets} ticket
                          {group.totalTickets !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusSummary statusSummary={group.statusSummary} />
                    </div>
                  </div>
                </div>

                {/* Group Content */}
                {!collapsedGroups.has(group.customerName) && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-xs">
                          <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-700">
                            No
                          </th>
                          <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-700">
                            Date
                          </th>
                          <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-700">
                            Ticket #
                          </th>
                          <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-700">
                            Status
                          </th>
                          <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-700">
                            Channel
                          </th>
                          <th className="border-r border-gray-200 px-3 py-2 text-left font-medium text-gray-700">
                            Category
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            SLA
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.tickets.map((ticket, index) => (
                          <tr
                            key={ticket.id}
                            onClick={() => handleRowClick(ticket)}
                            className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                          >
                            <td className="border-r border-gray-200 px-3 py-3 text-sm text-gray-600">
                              {index + 1}
                            </td>
                            <td className="border-r border-gray-200 px-3 py-3 text-sm text-gray-900">
                              {ticket.tglInput}
                            </td>
                            <td className="border-r border-gray-200 px-3 py-3 text-sm font-medium text-orange-600">
                              {ticket.noTiket}
                            </td>
                            <td className="border-r border-gray-200 px-3 py-3 text-sm">
                              <StatusBadge status={ticket.status} />
                            </td>
                            <td className="border-r border-gray-200 px-3 py-3 text-sm text-gray-900">
                              {ticket.channel}
                            </td>
                            <td className="border-r border-gray-200 px-3 py-3 text-sm text-gray-900">
                              {ticket.category}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900 font-medium">
                              {ticket.sla}d
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Regular table view
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
      key: "cardNumber",
      label: "Card Number",
      sortable: true,
      filterable: true,
      width: "w-24",
    },
    {
      key: "createdByUnit",
      label: "Source",
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {Object.keys(filters).length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={X}
              onClick={clearAllFilters}
            >
              Clear All Filters
            </Button>
          )}
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {loading
              ? "Loading…"
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(
                  currentPage * PAGE_SIZE,
                  processedComplaints.length
                )} of ${processedComplaints.length} entries`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            icon={Users}
            onClick={() => setViewMode("grouped")}
            className="px-4 py-2"
          >
            Group View
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => {
              setCurrentPage(1);
              fetchTickets({ limit: 1000, offset: 0, force: true });
            }}
            disabled={loading}
            loading={loading}
            className="px-4 py-2"
          >
            Refresh
          </Button>
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
                  className={`border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 ${
                    column.width || ""
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
            {loading ? (
              <tr>
                <td
                  className="border border-gray-300 px-4 py-6 text-sm text-center"
                  colSpan={12}
                >
                  Loading tickets...
                </td>
              </tr>
            ) : paginatedComplaints.length ? (
              paginatedComplaints.map((complaint, index) => (
                <tr
                  key={complaint.id}
                  onClick={() => handleRowClick(complaint)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-200"
                >
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {complaint.tglInput}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-medium">
                    {complaint.noTiket}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    <StatusBadge status={complaint.status} />
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
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {complaint.cardNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {complaint.createdByUnit}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 truncate">
                    {complaint.unitNow}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-gray-300 px-4 py-6 text-sm text-center"
                  colSpan={12}
                >
                  No tickets found (excluding open status)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-600 order-2 sm:order-1">
          {loading
            ? "Loading…"
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(
                currentPage * PAGE_SIZE,
                processedComplaints.length
              )} of ${processedComplaints.length} entries`}
        </div>
        <div className="flex flex-wrap gap-1 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1 || loading}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || loading}
          >
            Previous
          </Button>

          {(() => {
            const maxPages = Math.max(1, totalPages);
            const curr = Math.min(Math.max(currentPage, 1), maxPages);
            const windowSize = 5;
            let start = Math.max(1, curr - Math.floor(windowSize / 2));
            let end = Math.min(maxPages, start + windowSize - 1);
            if (end - start + 1 < windowSize)
              start = Math.max(1, end - windowSize + 1);

            const pageNumbers = [];
            if (start > 1) {
              pageNumbers.push(1);
              if (start > 2) pageNumbers.push("…");
            }
            for (let p = start; p <= end; p++) pageNumbers.push(p);
            if (end < maxPages) {
              if (end < maxPages - 1) pageNumbers.push("…");
              pageNumbers.push(maxPages);
            }

            return pageNumbers.map((p, idx) =>
              p === "…" ? (
                <span key={`dots-${idx}`} className="px-2 text-gray-500">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === currentPage ? "orange" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(p)}
                  disabled={loading}
                >
                  {p}
                </Button>
              )
            );
          })()}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || loading}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages || loading}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintTable;
