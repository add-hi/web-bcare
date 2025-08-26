"use client";
import { User, Badge, Briefcase } from "lucide-react";
import useAuth from "@/hooks/useUser";

function Profile() {
  const { user, status } = useAuth();

  const employee = user
    ? {
      name: user.full_name || user.name || user.email || "User",
      id: user.npp || user.id || user.employee_id || "",
      email: user.email || "No email set",
      role:
        (user.role_details && user.role_details.role_name) ||
        user.role ||
        "No role set",
      picture: user.picture,
    }
    : null;

  if (!employee || status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-6 sm:pt-8 md:pt-10">
      <div className="w-full max-w-3xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-orange-600 mb-1">
            Employee Profile
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            View your personal and work information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-orange-200">
          {/* Mobile-first: vertical; md+: horizontal */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
            {/* Avatar */}
            <div className="flex-shrink-0 self-center md:self-auto">
              <div className="relative group">
                <img
                  src={employee.picture || "/images/profile.jpg"}
                  alt={employee.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-orange-200 shadow-lg object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white"></div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 w-full space-y-4 sm:space-y-5">
              {/* Name */}
              <div className="flex items-start sm:items-center gap-3">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0"> {/* min-w-0 untuk truncation bekerja */}
                  <p className="text-[11px] sm:text-xs text-gray-500">Full Name</p>
                  <p className="text-base sm:text-lg font-bold text-orange-600 truncate">
                    {employee.name}
                  </p>
                </div>
              </div>

              {/* NPP */}
              <div className="flex items-start sm:items-center gap-3">
                <Badge className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs text-gray-500">
                    Employee Number (NPP)
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-orange-600 break-words">
                    {employee.id}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start sm:items-center gap-3">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs text-gray-500">Email</p>
                  {/* gunakan break-words + text-wrap untuk mobile */}
                  <p className="text-base sm:text-lg font-semibold text-orange-600 break-words text-balance">
                    {employee.email}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start sm:items-center gap-3">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs text-gray-500">Role</p>
                  <p className="text-base sm:text-lg font-semibold text-orange-600 break-words">
                    {employee.role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* (Opsional) Divider untuk mobile agar terasa terstruktur */}
          <div className="block md:hidden border-t border-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default Profile;
