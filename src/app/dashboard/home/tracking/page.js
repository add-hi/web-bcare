"use client";

import React, { useState } from "react";

export default function Tracking() {
    const [selectedTab, setSelectedTab] = useState('DATA');

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header with tabs and customer info */}
            <div className="bg-blue-400 text-white px-6 py-4 rounded-t-lg">
                <div className="flex justify-between items-center">
                    <div className="flex space-x-6">
                        {['DATA', 'ATTACHMENT', 'HISTORY'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${selectedTab === tab
                                    ? 'bg-orange-200 text-orange-800'
                                    : 'bg-blue-300 text-white hover:bg-blue-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium">CUSTOMER NAME / 123456788/ 4473920458680706</div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="p-6 bg-green-50 border-b">
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Input Type 234<span className="text-red-500">*</span>
                        </label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                            <option>Nasabah</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Source Type <span className="text-red-500">*</span>
                        </label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                            <option>Account</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            defaultValue="987654321"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Exp Date
                        </label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                            <option>yyMM exmp(1801)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Left Column - Workflow */}
                    <div className="col-span-5">
                        <div className="border border-orange-300 rounded-lg p-6 bg-orange-50">
                            <div className="space-y-8">
                                {/* Step 1 */}
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Sudah terkirim ke UIC terkait
                                        </h3>
                                    </div>
                                    <div className="ml-4">
                                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Connector Line */}
                                <div className="flex justify-end mr-6">
                                    <div className="w-px h-8 bg-gray-300"></div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Belum Over SLA
                                        </h3>
                                    </div>
                                    <div className="ml-4">
                                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Connector Line */}
                                <div className="flex justify-end mr-6">
                                    <div className="w-px h-8 bg-gray-300"></div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Over SLA → Sending Notification (UIC Terkait)
                                        </h3>
                                    </div>
                                    <div className="ml-4">
                                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Connector Line */}
                                <div className="flex justify-end mr-6">
                                    <div className="w-px h-8 bg-gray-300"></div>
                                </div>

                                {/* Step 4 */}
                                <div className="flex items-center">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Call
                                        </h3>
                                    </div>
                                    <div className="ml-4">
                                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="col-span-7">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Left Details */}
                            <div className="space-y-4">
                                <div>
                                    <div className="bg-gray-200 px-3 py-2 text-sm font-medium rounded-t">Service</div>
                                    <div className="bg-white border border-t-0 px-3 py-2 text-sm rounded-b">Complaint</div>
                                </div>
                                <div>
                                    <div className="bg-gray-200 px-3 py-2 text-sm font-medium rounded-t">Channel</div>
                                    <div className="bg-white border border-t-0 px-3 py-2 text-sm rounded-b">ATM</div>
                                </div>
                                <div>
                                    <div className="bg-gray-200 px-3 py-2 text-sm font-medium rounded-t">Category</div>
                                    <div className="bg-white border border-t-0 px-3 py-2 text-sm rounded-b">Tarik Tunai di Mesin ATM BNI</div>
                                </div>
                                <div>
                                    <div className="bg-gray-200 px-3 py-2 text-sm font-medium rounded-t">Created Time</div>
                                    <div className="bg-white border border-t-0 px-3 py-2 text-sm rounded-b">09/08/2025</div>
                                </div>
                            </div>

                            {/* Right Details with New Record Form */}
                            <div className="space-y-4">
                                <div>
                                    <div className="bg-gray-200 px-3 py-2 text-sm font-medium rounded-t">Record</div>
                                    <div className="bg-green-100 px-3 py-2 text-sm rounded-b">New Record</div>
                                </div>
                                <div>
                                    <div className="bg-gray-200 px-3 py-2 text-sm font-medium rounded-t">Nominal</div>
                                    <div className="bg-white border border-t-0 px-3 py-2 rounded-b">
                                        <input
                                            type="text"
                                            defaultValue="500.000"
                                            className="w-full text-sm border-0 bg-transparent focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="bg-gray-200 px-3 py-2 text-sm font-medium rounded-t">Divisi</div>
                                    <div className="bg-white border border-t-0 px-3 py-2 rounded-b">
                                        <input
                                            type="text"
                                            defaultValue="BCC"
                                            className="w-full text-sm border-0 bg-transparent focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="bg-gray-200 px-3 py-2 text-sm font-medium rounded-t">SLA</div>
                                    <div className="bg-white border border-t-0 px-3 py-2 rounded-b">
                                        <input
                                            type="text"
                                            defaultValue="7"
                                            className="w-full text-sm border-0 bg-transparent focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
