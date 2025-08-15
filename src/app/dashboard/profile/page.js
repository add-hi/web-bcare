"use client";
import { User, Badge, Briefcase } from "lucide-react";
import useAuth from "@/hooks/useAuth";

function Profile() {
  const { user, status } = useAuth();

  // Map API/store fields to the shape your JSX expects
  const employee = user
    ? {
        name: user.full_name || user.name || user.email || "User",
        id: user.npp || user.id || user.employee_id || "",
        email: user.email || "No email set",
        role:
          (user.role_details && user.role_details.role_name) ||
          user.role ||
          "No role set",
        picture: user.picture, // fallback handled in <img src=...>
      }
    : null;

  if (!employee || status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br ">
        <p className="text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-10">
      <div className=" w-full  flex items-center justify-center">
        <div className="w-full max-w-3xl ">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-orange-600 mb-1">
              Employee Profile
            </h1>
            <p className="text-gray-600 text-sm">
              View your personal and work information
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-orange-200">
            {/* Profile Content - Horizontal Layout */}
            <div className="flex items-center p-8">
              {/* Profile Picture Section */}
              <div className="flex-shrink-0 mr-8">
                <div className="relative group">
                  <img
                    src={employee.picture || "/images/profile.jpg"}
                    alt={employee.name}
                    className="w-24 h-24 rounded-full border-4 border-orange-200 shadow-lg object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                </div>
              </div>

              {/* Employee Information - Vertical */}
              <div className="flex-1 space-y-6">
                {/* Name */}
                <div className="flex items-center space-x-4">
                  <User className="w-6 h-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-lg font-bold text-orange-600">
                      {employee.name}
                    </p>
                  </div>
                </div>

                {/* NPP */}
                <div className="flex items-center space-x-4">
                  <Badge className="w-6 h-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">
                      Employee Number (NPP)
                    </p>
                    <p className="text-lg font-semibold text-orange-600">
                      {employee.id}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-4">
                  <Briefcase className="w-6 h-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {employee.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center space-x-4">
                  <Briefcase className="w-6 h-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {employee.role}
                    </p>
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

export default Profile;
