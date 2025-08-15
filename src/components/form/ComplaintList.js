"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  X,
  Search,
  Plus,
  ArrowLeft,
  Paperclip
} from "lucide-react";
import DetailComplaint from "@/components/DetailComplaint";
import AddComplaint from "@/components/AddComplaint";
import Attachment from "@/components/Attachment";

const ComplaintList = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'detail' | 'add' | 'attachments'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(null);

  // Dummy data
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
      status: "Unconfirm",
      sla: "7",
    },
  ];

  // Utils
  const getUniqueValues = (key) => [...new Set(originalComplaints.map((i) => i[key]))].sort();

  const processedComplaints = useMemo(() => {
    let filtered = originalComplaints;

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        if (key === "tglInput" && typeof filters[key] === "object") {
          const dateFilter = filters[key];
          filtered = filtered.filter((item) => {
            const itemDate = new Date(item.tglInput.split("/").reverse().join("-"));
            if (dateFilter.type === "specific") {
              const target = new Date(dateFilter.specificDate);
              return itemDate.toDateString() === target.toDateString();
            } else if (dateFilter.type === "range") {
              const start = new Date(dateFilter.startDate);
              const end = new Date(dateFilter.endDate);
              return itemDate >= start && itemDate <= end;
            }
            return true;
          });
        } else if (filters[key].length > 0) {
          filtered = filtered.filter((it) =>
            filters[key].some((v) => it[key].toLowerCase().includes(v.toLowerCase()))
          );
        }
      }
    });

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === "tglInput") {
          aVal = new Date(aVal.split("/").reverse().join("-"));
          bVal = new Date(bVal.split("/").reverse().join("-"));
        } else if (sortConfig.key === "sla") {
          aVal = parseInt(aVal);
          bVal = parseInt(bVal);
        } else {
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

  // Handlers
  const handleSort = (key) =>
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

  const handleFilter = (key, values) => setFilters((p) => ({ ...p, [key]: values }));
  const clearFilter = (key) => setFilters((p) => { const n = { ...p }; delete n[key]; return n; });
  const clearAllFilters = () => { setFilters({}); setSortConfig({ key: null, direction: "asc" }); };

  const handleAddClick = () => { setViewMode("add"); setSelectedComplaint(null); };
  const handleRowClick = (complaint) => { setSelectedComplaint(complaint); setViewMode("detail"); };
  const handleBackToTable = () => { setViewMode("table"); setSelectedComplaint(null); };
  const openAttachments = () => setViewMode("attachments");
  const backFromAttachments = () => setViewMode(selectedComplaint ? "detail" : "table");

  // --- Attachments view ---
  if (viewMode === "attachments") {
    return (
      <div className="max-w-full mx-auto p-6 bg-white">
        <div className="mb-4">
          <button
            onClick={backFromAttachments}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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

  // --- Detail view ---
  if (viewMode === "detail") {
    return (
      <div className="max-w-full mx-auto p-6 bg-white">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handleBackToTable}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to List</span>
          </button>

          {/* buka komponen Attachment */}
          <button
            onClick={openAttachments}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Paperclip size={18} />
            Attachments
          </button>
        </div>

        <DetailComplaint selectedComplaint={selectedComplaint} onBack={handleBackToTable} />
      </div>
    );
  }

  // --- Add view ---
  if (viewMode === "add") {
    return (
      <div className="max-w-full mx-auto p-6 bg-white">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handleBackToTable}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to List</span>
          </button>

          {/* opsional: bisa juga buka attachment kosong untuk pre-upload */}
          <button
            onClick={openAttachments}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Paperclip size={18} />
            Attachments
          </button>
        </div>

        <AddComplaint />
      </div>
    );
  }

  // --- helpers untuk badge status ---
  const getStatusBadge = (status) => {
    const statusConfig = { Uncofirm: { color: "bg-green-100 text-gray-800", icon: Clock } };
    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", icon: Clock };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  // --- DateFilterDropdown & FilterDropdown (tidak diubah) ---
  const DateFilterDropdown = ({ currentDateFilter }) => {
    const [filterType, setFilterType] = useState(currentDateFilter?.type || "range");
    const [startDate, setStartDate] = useState(currentDateFilter?.startDate || "");
    const [endDate, setEndDate] = useState(currentDateFilter?.endDate || "");
    const [specificDate, setSpecificDate] = useState(currentDateFilter?.specificDate || "");

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

    const quickDateOptions = [
      { label: "Today", value: () => ({ type: "specific", specificDate: new Date().toISOString().split("T")[0] }) },
      { label: "Yesterday", value: () => { const d = new Date(); d.setDate(d.getDate() - 1); return { type: "specific", specificDate: d.toISOString().split("T")[0] }; } },
      { label: "Last 7 Days", value: () => { const end = new Date().toISOString().split("T")[0]; const s = new Date(); s.setDate(s.getDate() - 7); return { type: "range", startDate: s.toISOString().split("T")[0], endDate: end }; } },
      { label: "Last 30 Days", value: () => { const end = new Date().toISOString().split("T")[0]; const s = new Date(); s.setDate(s.getDate() - 30); return { type: "range", startDate: s.toISOString().split("T")[0], endDate: end }; } },
      { label: "This Month", value: () => { const now = new Date(); const s = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]; const e = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]; return { type: "range", startDate: s, endDate: e }; } },
    ];

    const handleQuickDate = (opt) => {
      const v = opt.value();
      setFilterType(v.type);
      if (v.type === "range") { setStartDate(v.startDate); setEndDate(v.endDate); setSpecificDate(""); }
      else { setSpecificDate(v.specificDate); setStartDate(""); setEndDate(""); }
    };

    return (
      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
        <div className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Filter by Date</h4>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Options</label>
            <div className="grid grid-cols-2 gap-2">
              {quickDateOptions.map((o, i) => (
                <button key={i} onClick={() => handleQuickDate(o)} className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 text-left">
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" value="range" checked={filterType === "range"} onChange={(e) => setFilterType(e.target.value)} className="mr-2" />
                <span className="text-sm">Date Range</span>
              </label>
              <label className="flex items-center">
                <input type="radio" value="specific" checked={filterType === "specific"} onChange={(e) => setFilterType(e.target.value)} className="mr-2" />
                <span className="text-sm">Specific Date</span>
              </label>
            </div>
          </div>

          {filterType === "range" ? (
            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={applyDateFilter} disabled={filterType === "range" ? !startDate || !endDate : !specificDate} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Apply Filter
            </button>
            <button onClick={clearDateFilter} className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Clear</button>
            <button onClick={() => setShowFilterDropdown(null)} className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  const FilterDropdown = ({ column, options, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState(currentFilters || []);
    const [searchTerm, setSearchTerm] = useState("");
    const filteredOptions = options.filter((o) => o.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleCheckboxChange = (val, checked) => checked ? setLocalFilters([...localFilters, val]) : setLocalFilters(localFilters.filter((f) => f !== val));
    const applyFilter = () => { handleFilter(column, localFilters); setShowFilterDropdown(null); };

    return (
      <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
        <div className="p-3">
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2 top-2 text-gray-400" />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-7 pr-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={localFilters.includes(opt)} onChange={(e) => handleCheckboxChange(opt, e.target.checked)} className="rounded" />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200 flex gap-2">
            <button onClick={applyFilter} className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Apply</button>
            <button onClick={() => setShowFilterDropdown(null)} className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  // --- Table view ---
  const columns = [
    { key: "tglInput", label: "Tgl Input", sortable: true, filterable: true },
    { key: "noTiket", label: "No. Tiket", sortable: true, filterable: true },
    { key: "channel", label: "Channel", sortable: true, filterable: true },
    { key: "category", label: "Category", sortable: true, filterable: true },
    { key: "customerName", label: "Customer Name", sortable: true, filterable: true },
    { key: "number", label: "Number", sortable: true, filterable: true },
    { key: "cardNumber", label: "Card Number", sortable: true, filterable: true },
    { key: "createdByUnit", label: "Created By Unit", sortable: true, filterable: true },
    { key: "unitNow", label: "Unit Now", sortable: true, filterable: true },
    { key: "status", label: "Status", sortable: true, filterable: true },
    { key: "sla", label: "SLA", sortable: true, filterable: true },
  ];

  return (
    <div className="max-w-full mx-auto p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Plus size={20} />
            <button onClick={handleAddClick} className="font-medium cursor-pointer hover:text-orange-600">
              Add
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {Object.keys(filters).length > 0 && (
            <button onClick={clearAllFilters} className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
              <X size={14} />
              Clear All Filters
            </button>
          )}
          <div className="text-sm text-gray-600">
            Showing {processedComplaints.length} of {originalComplaints.length} entries
          </div>
        </div>
      </div>

      {Object.keys(filters).length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, values]) => {
            if (key === "tglInput" && typeof values === "object") {
              const d = values.type === "specific" ? `Specific: ${values.specificDate}` : `Range: ${values.startDate} to ${values.endDate}`;
              return (
                <div key={key} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <span className="font-medium">Date:</span>
                  <span>{d}</span>
                  <button onClick={() => clearFilter(key)} className="ml-1 hover:text-blue-900">
                    <X size={14} />
                  </button>
                </div>
              );
            }
            return (
              <div key={key} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <span className="font-medium">{columns.find((c) => c.key === key)?.label}:</span>
                <span>{Array.isArray(values) ? values.join(", ") : values}</span>
                <button onClick={() => clearFilter(key)} className="ml-1 hover:text-blue-900">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">No</th>
              {columns.map((col) => (
                <th key={col.key} className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center justify-between gap-2 relative">
                    <span>{col.label}</span>
                    <div className="flex items-center gap-1">
                      {col.sortable && (
                        <button onClick={() => handleSort(col.key)} className="hover:text-blue-600">
                          {sortConfig.key === col.key ? (sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} className="text-gray-400" />}
                        </button>
                      )}
                      {col.filterable && (
                        <button
                          onClick={() => setShowFilterDropdown(showFilterDropdown === col.key ? null : col.key)}
                          className={`hover:text-blue-600 ${filters[col.key] ? "text-blue-600" : "text-gray-400"}`}
                        >
                          <Filter size={14} />
                        </button>
                      )}
                    </div>
                    {showFilterDropdown === col.key &&
                      (col.key === "tglInput" ? (
                        <DateFilterDropdown currentDateFilter={filters[col.key]} />
                      ) : (
                        <FilterDropdown column={col.key} options={getUniqueValues(col.key)} currentFilters={filters[col.key] || []} />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedComplaints.map((c, i) => (
              <tr key={c.id} onClick={() => handleRowClick(c)} className="hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-200">
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{i + 1}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{c.tglInput}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-medium">{c.noTiket}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{c.channel}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{c.category}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{c.customerName}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{c.number}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{c.cardNumber}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{c.createdByUnit}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{c.unitNow}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm">{getStatusBadge(c.status)}</td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{c.sla}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (dummy) */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {processedComplaints.length} of {originalComplaints.length} entries
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Previous</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintList;
