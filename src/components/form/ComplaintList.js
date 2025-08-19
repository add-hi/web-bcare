// src/components/form/ComplaintList.js
"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Clock,
  Plus,
  ArrowLeft,
  Paperclip,
} from "lucide-react";
import useTicket from "@/hooks/useTicket";
import Attachment from "@/components/Attachment";
import AddComplaint from "@/components/AddComplaint";
import DetailComplaint from "@/components/DetailComplaint";

export default function ComplaintList() {
  const {
    tickets,
    total,
    page,
    pageSize,
    sort,
    filters,
    loading,
    error,
    setPage,
    setPageSize,
    setSort,
    setFilters,
  } = useTicket();

  const [viewMode, setViewMode] = useState("table"); // 'table' | 'detail' | 'add' | 'attachment'
  const [selectedRow, setSelectedRow] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(null);

  // client-side sort (optional) if backend doesn't sort
  const sorted = useMemo(() => {
    const rows = [...tickets];
    if (!sort?.key) return rows;
    return rows.sort((a, b) => {
      const ak = (a?.[sort.key] ?? "").toString().toLowerCase();
      const bk = (b?.[sort.key] ?? "").toString().toLowerCase();
      if (ak < bk) return sort.dir === "asc" ? -1 : 1;
      if (ak > bk) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [tickets, sort]);

  const handleSort = (key) => {
    setSort({
      key,
      dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc",
    });
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setViewMode("detail");
  };

  if (viewMode === "add")
    return <AddComplaint onClose={() => setViewMode("table")} />;
  if (viewMode === "attachment")
    return (
      <div className="p-6">
        <button
          onClick={() => setViewMode("detail")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          <span>Back to Detail</span>
        </button>
        <Attachment
          ticketId={selectedRow?.code || selectedRow?.id}
          ticket={selectedRow}
        />
      </div>
    );

  if (viewMode === "detail" && selectedRow)
    return (
      <div className="p-6">
        <button
          onClick={() => setViewMode("table")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          <span>Back to List</span>
        </button>
        <DetailComplaint
          complaint={selectedRow}
          onOpenAttachment={() => setViewMode("attachment")}
        />
      </div>
    );

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tickets</h2>
        <button
          onClick={() => setViewMode("add")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={18} />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded border border-gray-200">
          <Search size={16} className="text-gray-500" />
          <input
            value={filters.q || ""}
            onChange={(e) => setFilters({ q: e.target.value })}
            placeholder="Search ticket, customer, subject..."
            className="bg-transparent outline-none text-sm min-w-[220px]"
          />
          {!!filters.q && (
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setFilters({ q: "" })}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100"
            onClick={() => setShowFilterDropdown((s) => (s ? null : "status"))}
          >
            <Filter size={16} /> Status
            {showFilterDropdown === "status" ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
          {showFilterDropdown === "status" && (
            <div className="absolute z-10 mt-2 w-52 bg-white rounded shadow border p-2">
              {["", "open", "in_progress", "resolved", "closed"].map((s) => (
                <button
                  key={s || "all"}
                  className={`block w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-50 ${
                    (filters.status || "") === s
                      ? "bg-blue-50 text-blue-700"
                      : ""
                  }`}
                  onClick={() => {
                    setFilters({ status: s || undefined });
                    setShowFilterDropdown(null);
                  }}
                >
                  {s ? s.replace(/_/g, " ") : "All"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto text-sm text-gray-500">
          {loading ? "Loading…" : `Total: ${total}`}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th
                className="px-3 py-2 text-left cursor-pointer"
                onClick={() => handleSort("title")}
              >
                Subject{" "}
                {sort.key === "title" && (sort.dir === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Channel</th>
              <th className="px-3 py-2 text-left">Priority</th>
              <th
                className="px-3 py-2 text-left cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Created{" "}
                {sort.key === "createdAt" && (sort.dir === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-red-600">
                  {error}
                </td>
              </tr>
            )}

            {!error && !loading && sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-gray-500">
                  No tickets found.
                </td>
              </tr>
            )}

            {sorted.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(row)}
              >
                <td className="px-3 py-2">{(page - 1) * pageSize + idx + 1}</td>
                <td className="px-3 py-2">
                  <div className="font-medium text-gray-900">{row.title}</div>
                  <div className="text-gray-500 text-xs">
                    {row.code || row.id}
                  </div>
                </td>
                <td className="px-3 py-2">{row.customerName}</td>
                <td className="px-3 py-2">{row.channel}</td>
                <td className="px-3 py-2">{row.priority}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleString()
                      : "-"}
                  </span>
                </td>
                <td className="px-3 py-2">{row.status}</td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-gray-500">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {page} • Showing {sorted.length} of {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
            disabled={page <= 1 || loading}
          >
            Prev
          </button>
          <select
            className="px-2 py-1 border rounded text-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            disabled={loading}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <button
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
            disabled={loading || page * pageSize >= total}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
