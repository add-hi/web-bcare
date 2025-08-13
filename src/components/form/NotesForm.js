"use client";
import React, { useState, useEffect } from "react";
import {
  SkipBack,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Plus,
  RefreshCw,
} from "lucide-react";

const InputForm = () => {
  // Dummy data tetap ada (bisa kamu hapus kalau mau)
  const initialData = Array.from({ length: 42 }, (_, i) => ({
    note: `Note ${i + 1}`,
    createdBy: `User ${i + 1}`,
    roleName: `Role ${((i % 3) + 1)}`,
    unit: `Unit ${((i % 5) + 1)}`,
  }));

  // State data dan pagination
  const [data, setData] = useState([]); // kosong di awal
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1) page = 1;
    else if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Refresh data (simulasi): saat refresh baru isi dummy data
  const handleRefresh = () => {
    setData([...initialData]);
    setCurrentPage(1);
  };

  // useEffect awal tidak set data (karena mau kosong dulu)
  // kamu bisa hapus useEffect ini kalau mau
  // useEffect(() => {
  //   setData([...initialData]);
  // }, []);

  return (
    <div className="w-full bg-blue-100 rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
      {/* Header */}

 <div className="bg-blue-500 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
        <h2 className="text-lg font-semibold">Notes</h2>
      </div>
      <div className="p-4 bg-white border border-blue-200 rounded-md shadow-sm mt-6">
        {/* Add Note Button */}
        <button className="flex items-center gap-2 bg-[#c55a11] text-white px-4 py-2 rounded-sm mb-2">
          <Plus size={18} /> Add Note
        </button>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-300 rounded-md text-black">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-2 py-1 text-left">No</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Note</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Timestamp</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Created By</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Role Name</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Unit</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No items to display
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={startIndex + index}>
                    <td className="border border-gray-300 px-2 py-1">
                      {startIndex + index + 1}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">{item.note}</td>
                    <td className="border border-gray-300 px-2 py-1">{item.timestamp}</td>
                    <td className="border border-gray-300 px-2 py-1">{item.createdBy}</td>
                    <td className="border border-gray-300 px-2 py-1">{item.roleName}</td>
                    <td className="border border-gray-300 px-2 py-1">{item.unit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination + Controls */}
        <div className="flex items-center justify-between mt-2">
          {/* Pagination */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 border rounded-sm ${
                currentPage === 1 ? "border-gray-300 text-gray-300" : "border-black text-black"
              }`}
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 border rounded-sm ${
                currentPage === 1 ? "border-gray-300 text-gray-300" : "border-black text-black"
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 py-1 border border-black bg-orange-500 text-white rounded-sm select-none">
              {currentPage}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-2 py-1 border rounded-sm ${
                currentPage === totalPages || totalPages === 0
                  ? "border-gray-300 text-gray-300"
                  : "border-black text-black"
              }`}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-2 py-1 border rounded-sm ${
                currentPage === totalPages || totalPages === 0
                  ? "border-gray-300 text-gray-300"
                  : "border-black text-black"
              }`}
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Items per page */}
          <div className="flex items-center gap-2">
            <select
              className="border border-black px-2 py-1 text-black rounded-sm"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <span className="text-black select-none">Items per page</span>
          </div>

          {/* Info item count */}
          <div className="text-black select-none">
            {data.length === 0
              ? "No items to display"
              : `${startIndex + 1}-${endIndex} of ${data.length} items`}
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="border border-black text-black px-2 py-1 rounded-sm flex items-center gap-1"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
