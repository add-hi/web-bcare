"use client";

import React, { useState, useMemo } from "react";
import Link from 'next/link';
import {
  Grid3X3,
  Edit,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  X,
  Search,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DetailComplaint from "@/components/DetailComplaint";
import AddComplaint from "@/components/AddComplaint";

const ComplaintList = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table', 'detail', or 'add'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(null);
  const router = useRouter();

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
      status: "Unconfirm",
      sla: "7",
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

  const clearAllFilters = () => {
    setFilters({});
    setSortConfig({ key: null, direction: "asc" });
  };

  // Updated handlers
  const handleAddClick = () => {
    setViewMode("add");
    setSelectedComplaint(null);
  };

  const handleRowClick = (complaint) => {
    setSelectedComplaint(complaint);
    setViewMode("detail");
  };

  const handleBackToTable = () => {
    setViewMode("table");
    setSelectedComplaint(null);
  };

  if (viewMode === "detail") {
    return (
      <div className="max-w-full mx-auto p-6 bg-white">
        <div className="mb-4">
          <button
            onClick={handleBackToTable}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to List</span>
          </button>
        </div>

        <DetailComplaint
          selectedComplaint={selectedComplaint}
          onBack={handleBackToTable}
        />
      </div>
    );
  }

  if (viewMode === "add") {
    return (
      <div className="max-w-full mx-auto p-6 bg-white">
        <div className="mb-4">
          <button
            onClick={handleBackToTable}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to List</span>
          </button>
        </div>

        <AddComplaint />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      Uncofirm: { color: "bg-green-100 text-gray-800", icon: Clock },
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

  const columns = [
    { key: "tglInput", label: "Tgl Input", sortable: true, filterable: true },
    { key: "noTiket", label: "No. Tiket", sortable: true, filterable: true },
    { key: "channel", label: "Channel", sortable: true, filterable: true },
    { key: "category", label: "Category", sortable: true, filterable: true },
    {
      key: "customerName",
      label: "Customer Name",
      sortable: true,
      filterable: true,
    },
    { key: "number", label: "Number", sortable: true, filterable: true },
    {
      key: "cardNumber",
      label: "Card Number",
      sortable: true,
      filterable: true,
    },
    {
      key: "createdByUnit",
      label: "Created By Unit",
      sortable: true,
      filterable: true,
    },
    { key: "unitNow", label: "Unit Now", sortable: true, filterable: true },
    { key: "status", label: "Status", sortable: true, filterable: true },
    { key: "sla", label: "SLA", sortable: true, filterable: true },
  ];

  return (
    <div className="max-w-full mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Plus size={20} />
            <button
              onClick={handleAddClick}
              className="font-medium cursor-pointer hover:text-blue-600"
            >
              Add
            </button>
          </div>
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
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                  {complaint.channel}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                  {complaint.category}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                  {complaint.customerName}
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
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                  {complaint.unitNow}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm">
                  {getStatusBadge(complaint.status)}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                  {complaint.sla}
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

export default ComplaintList;