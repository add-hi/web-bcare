'use client'

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';
import { MessageCircle, TrendingUp, AlertTriangle, Star, Filter } from 'lucide-react';
import { useAuthStore } from "@/store/userStore";
import useFeedback from "@/hooks/useFeedback";
import useTicket from "@/hooks/useTicket";

// Normalisasi status berbagai istilah API ke 3 bucket
function normalizeStatus(s) {
  const x = String(s || '').toLowerCase();
  if (/(closed|selesai|done|resolved)/.test(x)) return 'closed';
  if (/(processing|progress|handled|escalated|verification|accepted|in\s*-?\s*progress)/.test(x)) return 'in-progress';
  return 'open';
}

// Format ISO -> 'YYYY-MM-DD'
const toYMD = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return d.toISOString().slice(0, 10);
};

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showMyTicketsOnly, setShowMyTicketsOnly] = useState(true);

  // LIST untuk tab Complaints (tetap dari useFeedback)
  const { items: feedbackItems, status: feedbackStatus, error: feedbackError, fetchAll } = useFeedback();
  const { user } = useAuthStore();

  // ANALYTICS untuk tab Overview (dari useTicket)
  const { list: ticketList, loading: ticketLoading, error: ticketError, fetchTickets } = useTicket();

  useEffect(() => {
    // feedback list
    fetchAll();
    // ambil banyak data tiket untuk analitik (ubah angka sesuai kebutuhan)
    fetchTickets({ limit: 200, offset: 0 });
  }, [fetchAll, fetchTickets]);

  // ========== DATA ANALYTICS (dari tickets) ==========
  const analyticsTickets = useMemo(() => {
    if (!Array.isArray(ticketList)) return [];
    return ticketList.map((t) => ({
      id: t?.ticket_id ?? t?.id,
      ticket_number: t?.ticket_number ?? t?.ticket_id ?? '-',
      description: t?.description || t?.complaint?.complaint_name || '-',
      category: t?.complaint?.complaint_name || t?.complaint?.complaint_code || 'Unknown',
      status: normalizeStatus(t?.customer_status?.customer_status_name || t?.status),
      rating: t?.rating ?? null,
      assignedTo: t?.employee?.id ?? t?.employee_id ?? null,
      createdAtISO: t?.created_time || null,
      createdAtYMD: toYMD(t?.created_time),
    }));
  }, [ticketList]);

  // KPI
  const totalTickets = analyticsTickets.length;
  const openCount = analyticsTickets.filter(c => c.status === 'open').length;

  const avgRating = useMemo(() => {
    const rated = analyticsTickets.filter(c => typeof c.rating === 'number');
    if (!rated.length) return 0;
    const sum = rated.reduce((s, c) => s + c.rating, 0);
    return sum / rated.length;
  }, [analyticsTickets]);

  // Status distribution (pie)
  const statusData = useMemo(() => ([
    { name: 'Open', value: analyticsTickets.filter(c => c.status === 'open').length, color: '#ef4444' },
    { name: 'In Progress', value: analyticsTickets.filter(c => c.status === 'in-progress').length, color: '#f59e0b' },
    { name: 'Closed', value: analyticsTickets.filter(c => c.status === 'closed').length, color: '#10b981' },
  ]), [analyticsTickets]);

  // Category distribution (top 8)
  const categoryData = useMemo(() => {
    const map = new Map();
    analyticsTickets.forEach(c => {
      const k = c.category || 'Unknown';
      map.set(k, (map.get(k) || 0) + 1);
    });
    const arr = [...map.entries()].map(([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    return arr.slice(0, 8);
  }, [analyticsTickets]);

  // Trend per tanggal (urut naik)
  const trendData = useMemo(() => {
    const map = new Map();
    analyticsTickets.forEach(c => {
      if (!c.createdAtYMD) return;
      map.set(c.createdAtYMD, (map.get(c.createdAtYMD) || 0) + 1);
    });
    const arr = [...map.entries()]
      .map(([date, complaints]) => ({ date, complaints }))
      .sort((a, b) => a.date.localeCompare(b.date));
    // (opsional) batasi 30 hari terakhir:
    return arr.slice(-30);
  }, [analyticsTickets]);

  // ========== DATA LIST (dari feedback) ==========
  // filter "my tickets only" hanya untuk LIST (sesuai permintaan)
  const displayComplaints = useMemo(() => {
    if (!Array.isArray(feedbackItems)) return [];
    if (showMyTicketsOnly && user?.id) {
      return feedbackItems.filter(t => t.assignedTo === user.id);
    }
    return feedbackItems;
  }, [feedbackItems, showMyTicketsOnly, user?.id]);

  // filter by status di tab Complaints
  const filteredComplaints = useMemo(() => {
    if (filterStatus === 'all') return displayComplaints;
    return displayComplaints.filter(c => c.status === filterStatus);
  }, [displayComplaints, filterStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard Customer Service</h1>
          <p className="text-gray-600">Analytics & Management System untuk Tim CS</p>

          {/* indikator status per tab */}
          {selectedTab === 'overview' && (
            <>
              {ticketLoading && <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg">Loading tickets…</div>}
              {ticketError && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">Error: {ticketError}</div>}
              {!ticketLoading && !ticketError && totalTickets === 0 && (
                <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">Tidak ada data tiket</div>
              )}
            </>
          )}

          {selectedTab === 'complaints' && (
            <>
              {feedbackStatus === 'loading' && <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg">Loading data…</div>}
              {feedbackStatus === 'error' && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">Error: {feedbackError}</div>}
              {feedbackStatus === 'success' && feedbackItems.length === 0 && (
                <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">Tidak ada data complaint</div>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center mb-8 space-x-2">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'complaints', label: 'Complaints', icon: MessageCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${selectedTab === key ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-blue-50 shadow'
                }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ===== Overview (Analytics dari useTicket) ===== */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Tickets</p>
                    <p className="text-3xl font-bold text-gray-800">{totalTickets}</p>
                  </div>
                  <MessageCircle className="text-blue-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Open Issues</p>
                    <p className="text-3xl font-bold text-red-600">{openCount}</p>
                  </div>
                  <AlertTriangle className="text-red-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Avg Rating</p>
                    <p className="text-3xl font-bold text-yellow-600">{avgRating.toFixed(1)}</p>
                  </div>
                  <Star className="text-yellow-500" size={32} />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">Tickets by Category (Top 8)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-4">Ticket Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ===== Complaints (List dari useFeedback) ===== */}
        {selectedTab === 'complaints' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                

                {user && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">My Tickets Only:</label>
                    <input
                      type="checkbox"
                      checked={showMyTicketsOnly}
                      onChange={(e) => setShowMyTicketsOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Complaints List */}
            <div className="space-y-4">
              {feedbackStatus === 'loading' ? (
                <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading complaints...</p>
                </div>
              ) : feedbackStatus === 'error' ? (
                <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center">
                  <MessageCircle size={48} className="text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-red-600 mb-2">Error loading data</h3>
                  <p className="text-gray-500">{feedbackError}</p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center">
                  <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No complaints found</h3>
                  <p className="text-gray-500">No complaints available from API.</p>
                </div>
              ) : (
                filteredComplaints.map((complaint) => (
                  <div key={complaint.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">#{complaint.ticket_number}</h3>
                        </div>
                        <p className="text-gray-600 mt-2 leading-relaxed">{complaint.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div><strong>Customer:</strong> {complaint.customerName}</div>
                      <div><strong>Date:</strong> {complaint.createdAt}</div>
                    </div>

                    {complaint.rating && (
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < complaint.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">({complaint.rating}/5)</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
