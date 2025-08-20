'use client'

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { MessageCircle, TrendingUp, Users, Clock, AlertTriangle, CheckCircle, Star, Filter } from 'lucide-react';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newComplaint, setNewComplaint] = useState({ title: '', description: '', priority: 'medium', category: 'technical' });

  // Sample data
  useEffect(() => {
    const sampleComplaints = [
      {
        id: 1,
        title: 'Aplikasi sering crash',
        description: 'Aplikasi mobile sering mengalami crash saat membuka fitur pembayaran',
        category: 'technical',
        priority: 'high',
        status: 'open',
        customerName: 'Ahmad Rizki',
        createdAt: '2024-08-10',
        assignedTo: 'Agent 1',
        rating: null
      },
      {
        id: 2,
        title: 'Pembayaran tidak terproses',
        description: 'Sudah transfer tapi status pembayaran masih pending',
        category: 'payment',
        priority: 'high',
        status: 'in-progress',
        customerName: 'Sari Dewi',
        createdAt: '2024-08-09',
        assignedTo: 'Agent 2',
        rating: null
      },
      {
        id: 3,
        title: 'Layanan customer service lambat',
        description: 'Sudah menunggu 2 jam tapi belum ada respon dari CS',
        category: 'service',
        priority: 'medium',
        status: 'resolved',
        customerName: 'Budi Santoso',
        createdAt: '2024-08-08',
        assignedTo: 'Agent 1',
        rating: 4
      },
      {
        id: 4,
        title: 'Fitur tidak berfungsi',
        description: 'Fitur pencarian produk tidak menampilkan hasil yang akurat',
        category: 'technical',
        priority: 'low',
        status: 'resolved',
        customerName: 'Maya Indah',
        createdAt: '2024-08-07',
        assignedTo: 'Agent 3',
        rating: 5
      },
      {
        id: 5,
        title: 'Promo tidak berlaku',
        description: 'Kode promo yang digunakan tidak memberikan diskon',
        category: 'promotion',
        priority: 'medium',
        status: 'open',
        customerName: 'Andi Wijaya',
        createdAt: '2024-08-11',
        assignedTo: 'Agent 2',
        rating: null
      }
    ];
    setComplaints(sampleComplaints);
  }, []);

  // Analytics data
  const statusData = [
    { name: 'Open', value: complaints.filter(c => c.status === 'open').length, color: '#ef4444' },
    { name: 'In Progress', value: complaints.filter(c => c.status === 'in-progress').length, color: '#f59e0b' },
    { name: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: '#10b981' }
  ];

  const categoryData = [
    { name: 'Technical', value: complaints.filter(c => c.category === 'technical').length },
    { name: 'Payment', value: complaints.filter(c => c.category === 'payment').length },
    { name: 'Service', value: complaints.filter(c => c.category === 'service').length },
    { name: 'Promotion', value: complaints.filter(c => c.category === 'promotion').length }
  ];

  const priorityData = [
    { name: 'High', value: complaints.filter(c => c.priority === 'high').length },
    { name: 'Medium', value: complaints.filter(c => c.priority === 'medium').length },
    { name: 'Low', value: complaints.filter(c => c.priority === 'low').length }
  ];

  const trendData = [
    { date: '2024-08-07', complaints: 1 },
    { date: '2024-08-08', complaints: 1 },
    { date: '2024-08-09', complaints: 1 },
    { date: '2024-08-10', complaints: 1 },
    { date: '2024-08-11', complaints: 1 }
  ];

  const filteredComplaints = complaints.filter(complaint =>
    filterStatus === 'all' || complaint.status === filterStatus
  );

  const avgRating = complaints.filter(c => c.rating).reduce((sum, c) => sum + c.rating, 0) /
    complaints.filter(c => c.rating).length || 0;

  const handleSubmitComplaint = () => {
    if (!newComplaint.title || !newComplaint.description) {
      alert('Mohon lengkapi semua field yang diperlukan');
      return;
    }
    const complaint = {
      id: complaints.length + 1,
      ...newComplaint,
      status: 'open',
      customerName: 'Customer Baru',
      createdAt: new Date().toISOString().split('T')[0],
      assignedTo: 'Unassigned',
      rating: null
    };
    setComplaints([...complaints, complaint]);
    setNewComplaint({ title: '', description: '', priority: 'medium', category: 'technical' });
    alert('Complaint berhasil dikirim!');
  };

  const updateComplaintStatus = (id, newStatus) => {
    setComplaints(complaints.map(complaint =>
      complaint.id === id ? { ...complaint, status: newStatus } : complaint
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard Customer Service</h1>
          <p className="text-gray-600">Analytics & Management System untuk Tim CS</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center mb-8 space-x-2">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'complaints', label: 'Complaints', icon: MessageCircle },
            { key: 'submit', label: 'Submit Complaint', icon: AlertTriangle }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${selectedTab === key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-blue-50 shadow'
                }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Complaints</p>
                    <p className="text-3xl font-bold text-gray-800">{complaints.length}</p>
                  </div>
                  <MessageCircle className="text-blue-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Open Issues</p>
                    <p className="text-3xl font-bold text-red-600">{complaints.filter(c => c.status === 'open').length}</p>
                  </div>
                  <AlertTriangle className="text-red-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Resolved</p>
                    <p className="text-3xl font-bold text-green-600">{complaints.filter(c => c.status === 'resolved').length}</p>
                  </div>
                  <CheckCircle className="text-green-500" size={32} />
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
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">Complaints by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-4">Complaint Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {selectedTab === 'complaints' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-4">
                <Filter size={20} className="text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Complaints List */}
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800">{complaint.title}</h3>
                      <p className="text-gray-600 mt-2">{complaint.description}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${complaint.priority === 'high' ? 'bg-red-100 text-red-800' :
                          complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {complaint.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${complaint.status === 'open' ? 'bg-red-100 text-red-800' :
                          complaint.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div><strong>Customer:</strong> {complaint.customerName}</div>
                    <div><strong>Category:</strong> {complaint.category}</div>
                    <div><strong>Date:</strong> {complaint.createdAt}</div>
                    <div><strong>Assigned:</strong> {complaint.assignedTo}</div>
                  </div>

                  {complaint.rating && (
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-sm text-gray-600">Customer Rating:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < complaint.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {complaint.status !== 'resolved' && (
                      <>
                        <button
                          onClick={() => updateComplaintStatus(complaint.id, 'in-progress')}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          Mark In Progress
                        </button>
                        <button
                          onClick={() => updateComplaintStatus(complaint.id, 'resolved')}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Mark Resolved
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Complaint Tab */}
        {selectedTab === 'submit' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit New Complaint</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newComplaint.title}
                    onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={newComplaint.priority}
                      onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newComplaint.category}
                      onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="technical">Technical</option>
                      <option value="payment">Payment</option>
                      <option value="service">Service</option>
                      <option value="promotion">Promotion</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSubmitComplaint}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Submit Complaint
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;