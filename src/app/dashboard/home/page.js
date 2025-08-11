"use client";

import React, { useState } from "react";
// import FloatingCustomerContact from "../../../components/FloatingCustomerContact";

export default function HomePage() {
  // Dynamic user data - these would typically come from props, context, or API
  const [userInfo, setUserInfo] = useState({
    userId: "123456",
    userName: "CxC Agent",
    currentRole: "Asisten BCC Unit Divisi CXC",
    totalInbox: 0,
    totalJatuhTempo: 0,
  });

  const [selectedRole, setSelectedRole] = useState("Manager CX Communication");

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSubmit = () => {
    console.log("Role selected:", selectedRole);
    // Add your submit logic here
  };

  return (
    <div className="p-6 space-y-6">
      {/* Sambutan Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="bg-orange-500 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
          <h2 className="text-lg font-semibold">Sambutan</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-2">
            Selamat Datang di Aplikasi CX Communication
          </p>
          <p className="text-gray-600 text-sm mb-4">
            <span className="font-medium">{userInfo.userId}</span> |{" "}
            <span className="font-medium">{userInfo.userName}</span> anda login
            sebagai <span className="font-medium">{userInfo.currentRole}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center bg-teal-500 text-white px-4 py-2 rounded">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-sm font-medium">
              {userInfo.totalInbox} Total Inbox
            </span>
          </div>

          <div className="flex items-center bg-red-500 text-white px-4 py-2 rounded">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">
              {userInfo.totalJatuhTempo} Total Jatuh Tempo
            </span>
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm mb-3">
            Anda memiliki lebih dari satu level kewenangan dalam sistem ini.
          </p>
          <p className="text-gray-700 text-sm mb-4">
            Klik Submit untuk mengubah role anda.
          </p>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                <option value="Manager CX Communication">
                  Manager CX Communication
                </option>
                <option value="ASISTEN BCC Unit Divisi CXC">
                  ASISTEN BCC Unit Divisi CXC
                </option>
                <option value="Staff CX Communication">
                  Staff CX Communication
                </option>
              </select>
            </div>
            <button
              onClick={handleSubmit}
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 active:scale-95 text-white font-medium py-2 px-6 rounded transition-all duration-150 transform"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Featured News Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="bg-orange-500 text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6">
          <h2 className="text-lg font-semibold">Featured News</h2>
        </div>

        <div className="text-gray-500 text-center py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <p className="text-sm">No featured news available</p>
        </div>
      </div>

      {/* Floating Customer Contact Widget */}
      {/* <FloatingCustomerContact /> */}
    </div>
  );
}
