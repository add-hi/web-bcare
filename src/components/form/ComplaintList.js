"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  X,
  Search,
  Plus,
  ArrowLeft,
  Paperclip,
  RefreshCw,
} from "lucide-react";
import DetailComplaint from "@/components/DetailComplaint";
import AddComplaint from "@/components/AddComplaint";
import Attachment from "@/components/Attachment";
import useTicket from "@/hooks/useTicket";
import useTicketDetail from "@/hooks/useTicketDetail";
import useTicketStore from "@/store/ticketStore";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";

const PAGE_SIZE = 10;
const LIMIT = PAGE_SIZE;

// ✅ default filter untuk agent
const DEFAULT_AGENT_STATUS = ["open", "handled by cxc"];

const ComplaintList = ({ isActive = false, isAgent = false }) => {
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'detail' | 'add' | 'attachments'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(null);

  // API integration - fetch all tickets for client-side processing
  const { list, loading, error, fetchTickets, updateTicket } = useTicket();
  const { selectedId, fetchTicketDetail } = useTicketDetail();
  const ticketStore = useTicketStore();

  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all tickets once when component becomes active
  useEffect(() => {
    if (isActive) {
      // Fetch all tickets at once for client-side pagination
      fetchTickets({ limit: 1000, offset: 0, force: false });
    }
  }, [isActive]); // Only fetch once when component becomes active

  // helper tanggal dd/MM/yyyy
  const fmtDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d)) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Map API data and filter for agent view (handled by cxc + open only)
  const originalComplaints = useMemo(() => {
    if (!Array.isArray(list)) return [];

    // Filter tickets for agent view: only "open" and "handled by cxc" status
    const filteredList = list.filter((t) => {
      const status =
        t?.employee_status?.employee_status_name?.toLowerCase() || "";
      return status === "open" || status === "handled by cxc";
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
        createdIso: t?.created_time || null, // untuk filter tanggal
      };
    });
  }, [list]);

  const getUniqueValues = (key) =>
    [...new Set(originalComplaints.map((i) => i[key] || "-"))].sort();

  const onDetailSubmitSuccess = async () => {
    await fetchTickets({ limit: 1000, offset: 0, force: true });
    setViewMode("table");
  };

  // filter & (opsional) sort — tidak mengganggu pagination server
  const processedComplaints = useMemo(() => {
    let filtered = originalComplaints;

    Object.keys(filters).forEach((key) => {
      if (!filters[key]) return;

      if (key === "tglInput" && typeof filters[key] === "object") {
        const f = filters[key];
        filtered = filtered.filter((item) => {
          const src = item.createdIso ? new Date(item.createdIso) : null;
          if (!src || isNaN(src)) return false;
          if (f.type === "specific") {
            const target = new Date(f.specificDate);
            return src.toDateString() === target.toDateString();
          } else if (f.type === "range") {
            const s = new Date(f.startDate);
            const e = new Date(f.endDate);
            s.setHours(0, 0, 0, 0);
            e.setHours(23, 59, 59, 999);
            return src >= s && src <= e;
          }
          return true;
        });
      } else if (Array.isArray(filters[key]) && filters[key].length > 0) {
        filtered = filtered.filter((it) =>
          filters[key].some((v) =>
            String(it[key] || "-")
              .toLowerCase()
              .includes(v.toLowerCase())
          )
        );
      }
    });

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === "tglInput") {
          const av = a.createdIso ? new Date(a.createdIso).getTime() : 0;
          const bv = b.createdIso ? new Date(b.createdIso).getTime() : 0;
          return sortConfig.direction === "asc" ? av - bv : bv - av;
        } else if (sortConfig.key === "sla") {
          aVal = parseInt(aVal, 10);
          bVal = parseInt(bVal, 10);
        } else {
          aVal = String(aVal ?? "").toLowerCase();
          bVal = String(bVal ?? "").toLowerCase();
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
  }, [processedComplaints, currentPage]);

  const totalPages = Math.ceil(processedComplaints.length / PAGE_SIZE);

  const handleSort = (key) =>
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

  const handleFilter = (key, values) =>
    setFilters((p) => ({ ...p, [key]: values }));
  const clearFilter = (key) =>
    setFilters((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
  const clearAllFilters = () => {
    setFilters({});
    setSortConfig({ key: null, direction: "asc" });
  };

  const handleAddClick = () => setViewMode("add");

  const handleRowClick = async (row) => {
    try {
      const isOpen = String(row?.status || "").toLowerCase() === "open";
      if (isOpen) {
        await updateTicket(row.id, { action: "HANDLEDCXC" });
      }

      await fetchTicketDetail(row.id, { force: false });
      setViewMode("detail");
    } catch {
      // biarkan ditangani global / UI error yang sudah ada
    }
  };

  const openAttachments = () => setViewMode("attachments");
  const backFromAttachments = () =>
    setViewMode(selectedId ? "detail" : "table");

  // ===== RENDER =====

  // ATTACHMENTS
  if (viewMode === "attachments") {
    const detail = selectedId ? ticketStore.detailById[selectedId] : null;
    return (
      <div className="max-w-full mx-auto p-6 bg-white">
        <div className="mb-4">
          <Button
            variant="grey"
            icon={ArrowLeft}
            onClick={backFromAttachments}
            className="px-5 py-2.5"
          >
            Back to {selectedId ? "Detail" : "List"}
          </Button>
        </div>
        <Attachment
          ticketId={selectedId}
          ticketNumber={detail?.ids?.ticketNumber}
          ticket={detail}
        />
      </div>
    );
  }

  // DETAIL
  if (viewMode === "detail") {
    return (
      <div className="max-w-full mx-auto p-6 bg-white">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="grey"
            icon={ArrowLeft}
            onClick={() => setViewMode("table")}
            className="px-3 sm:px-5 py-2.5"
          >
            <span className="hidden sm:inline">Back to List</span>
          </Button>

          <Button
            variant="grey"
            icon={Paperclip}
            onClick={openAttachments}
            className="px-5 py-2.5"
          >
            Attachments
          </Button>
        </div>
        <DetailComplaint
          ticketId={selectedId}
          onSuccess={onDetailSubmitSuccess}
        />
      </div>
    );
  }

  // ADD
  if (viewMode === "add") {
    return (
      <div className="max-w-full mx-auto p-6 bg-white">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="grey"
            icon={ArrowLeft}
            onClick={() => setViewMode("table")}
            className="px-3 sm:px-5 py-2.5"
          >
            <span className="hidden sm:inline">Back to List</span>
          </Button>
        </div>
        <AddComplaint reset />
      </div>
    );
  }

  // TABLE
  const columns = [
    { key: "tglInput", label: "Date", sortable: true, filterable: true },
    { key: "noTiket", label: "Ticket #", sortable: true, filterable: true }, // ← ticket_id
    { key: "status", label: "Status", sortable: true, filterable: true },
    {
      key: "customerName",
      label: "Customer",
      sortable: true,
      filterable: true,
    },
    { key: "channel", label: "Channel", sortable: true, filterable: true },
    { key: "category", label: "Category", sortable: true, filterable: true },
    { key: "sla", label: "SLA", sortable: true, filterable: true },

    { key: "number", label: "Account #", sortable: true, filterable: true },
    {
      key: "cardNumber",
      label: "Card Number",
      sortable: true,
      filterable: true,
    },
    {
      key: "createdByUnit",
      label: "Source",
      sortable: true,
      filterable: true,
    },
    { key: "unitNow", label: "Current Unit", sortable: true, filterable: true },
  ];

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
      setFilters((p) => ({ ...p, tglInput: dateFilter }));
      setShowFilterDropdown(null);
    };
    const clearDateFilter = () => {
      clearFilter("tglInput");
      setShowFilterDropdown(null);
    };

    const quickDateOptions = [
      {
        label: "Today",
        value: () => ({
          type: "specific",
          specificDate: new Date().toISOString().split("T")[0],
        }),
      },
      {
        label: "Yesterday",
        value: () => {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          return {
            type: "specific",
            specificDate: d.toISOString().split("T")[0],
          };
        },
      },
      {
        label: "Last 7 Days",
        value: () => {
          const end = new Date().toISOString().split("T")[0];
          const s = new Date();
          s.setDate(s.getDate() - 7);
          return {
            type: "range",
            startDate: s.toISOString().split("T")[0],
            endDate: end,
          };
        },
      },
      {
        label: "Last 30 Days",
        value: () => {
          const end = new Date().toISOString().split("T")[0];
          const s = new Date();
          s.setDate(s.getDate() - 30);
          return {
            type: "range",
            startDate: s.toISOString().split("T")[0],
            endDate: end,
          };
        },
      },
      {
        label: "This Month",
        value: () => {
          const now = new Date();
          const s = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split("T")[0];
          const e = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0];
          return { type: "range", startDate: s, endDate: e };
        },
      },
    ];
    const handleQuickDate = (opt) => {
      const v = opt.value();
      setFilterType(v.type);
      if (v.type === "range") {
        setStartDate(v.startDate);
        setEndDate(v.endDate);
        setSpecificDate("");
      } else {
        setSpecificDate(v.specificDate);
        setStartDate("");
        setEndDate("");
      }
    };

    return (
      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
        <div className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Filter by Date</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Options
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickDateOptions.map((o, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDate(o)}
                  className="text-left"
                >
                  {o.label}
                </Button>
              ))}
            </div>
          </div>

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

  const FilterDropdown = ({ column, options, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState(currentFilters || []);
    const [searchTerm, setSearchTerm] = useState("");
    const filteredOptions = options.filter((o) =>
      o.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const toggle = (val, checked) =>
      checked
        ? setLocalFilters([...localFilters, val])
        : setLocalFilters(localFilters.filter((f) => f !== val));
    const apply = () => {
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
            {filteredOptions.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localFilters.includes(opt)}
                  onChange={(e) => toggle(opt, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200 flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={apply}
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

  return (
    <div className="max-w-full mx-auto p-6 bg-white min-h-80">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="primary" icon={Plus} onClick={handleAddClick}>
            Add
          </Button>
        </div>

        <div className="flex items-center gap-2">
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
          <div className="text-sm text-gray-600">
            {loading
              ? "Loading…"
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(
                currentPage * PAGE_SIZE,
                processedComplaints.length
              )} of ${processedComplaints.length} entries`}
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => {
              setCurrentPage(1);
              fetchTickets({
                limit: 1000,
                offset: 0,
                force: true,
              });
            }}
            disabled={loading}
            loading={loading}
            className="px-4 py-2"
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-2">
          {error}
        </div>
      )}

      <div className="overflow-x-auto min-h-80">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                No
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  <div className="flex items-center justify-between gap-2 relative">
                    <span>{col.label}</span>
                    <div className="flex items-center gap-1">
                      {col.sortable && (
                        <button
                          onClick={() => handleSort(col.key)}
                          className="hover:text-blue-600"
                        >
                          {sortConfig.key === col.key ? (
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
                      {col.filterable && (
                        <button
                          onClick={() =>
                            setShowFilterDropdown(
                              showFilterDropdown === col.key ? null : col.key
                            )
                          }
                          className={`hover:text-blue-600 ${filters[col.key] ? "text-blue-600" : "text-gray-400"
                            }`}
                        >
                          <Filter size={14} />
                        </button>
                      )}
                    </div>
                    {showFilterDropdown === col.key &&
                      (col.key === "tglInput" ? (
                        <DateFilterDropdown
                          currentDateFilter={filters[col.key]}
                        />
                      ) : (
                        <FilterDropdown
                          column={col.key}
                          options={getUniqueValues(col.key)}
                          currentFilters={filters[col.key] || []}
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
                  className="border border-gray-300 px-4 py-6 text-sm"
                  colSpan={12}
                >
                  Loading…
                </td>
              </tr>
            ) : paginatedComplaints.length ? (
              paginatedComplaints.map((c, i) => (
                <tr
                  key={c.id ?? `${c.noTiket}-${i}`}
                  onClick={() => handleRowClick(c)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-200"
                >
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {(currentPage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {c.tglInput}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-medium">
                    {c.noTiket}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {c.customerName}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {c.channel}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {c.category}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {c.sla}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {c.number}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {c.cardNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {c.createdByUnit}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {c.unitNow}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-gray-300 px-4 py-6 text-sm"
                  colSpan={12}
                >
                  No data
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
            )} of ${processedComplaints.length
            } entries (filtered for handled by cxc + open)`}
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

export default ComplaintList;
