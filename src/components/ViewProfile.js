'use client'
'use client'
import { useState, useEffect } from 'react';
import { User, Badge, Briefcase } from 'lucide-react';

export default function ProfilePage() {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setEmployee(JSON.parse(userData));
    }
  }, []);

  if (!employee) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <p className="text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-orange-600 mb-2">Employee Profile</h1>
          <p className="text-gray-600">View your personal and work information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-orange-200">
          {/* Cover Section */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-36 relative">
            <div className="absolute inset-0 bg-black/5"></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-10">
            {/* Profile Picture */}
            <div className="flex justify-center -mt-16 mb-8">
              <div className="relative group">
                <img
                  src={employee.picture || '/images/profile.jpg'}
                  alt={employee.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="space-y-8">
              {/* Name */}
              <div className="flex flex-col items-center space-y-2">
                <User className="w-8 h-8 text-orange-500" />
                <div className="text-center">
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-2xl font-bold text-orange-600">{employee.name}</p>
                </div>
              </div>

              {/* NPP */}
              <div className="flex flex-col items-center space-y-2">
                <Badge className="w-8 h-8 text-orange-500" />
                <div className="text-center">
                  <p className="text-sm text-gray-500">Employee Number (NPP)</p>
                  <p className="text-xl font-semibold text-orange-600">{employee.id}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex flex-col items-center space-y-2">
                <Briefcase className="w-8 h-8 text-orange-500" />
                <div className="text-center">
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-xl font-semibold text-orange-600">{employee.role || 'No role set'}</p>
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
