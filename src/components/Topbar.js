"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useUser from "@/hooks/useUser";
import Button from "@/components/ui/Button";

export default function Topbar() {
  const router = useRouter();
  const { user, logout } = useUser();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setBusy(false);
    }
  };

  const goToProfile = () => router.push("/dashboard/profile");

  // Normalize fields for display
  const displayName = user?.full_name || user?.name || user?.email || "User";
  const displayId = user?.npp || user?.id || user?.employee_id || "";
  const initial = displayName?.charAt(0) || "?";

  return (
    <header className="fixed top-0 left-0 right-0 ml-16 lg:ml-64 z-10">
      <div className="flex">
        <div className="flex-1 bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          {/* Desktop layout */}
          <div className="hidden md:flex items-center justify-between">
            <h1 className="text-2xl lg:text-3xl font-semibold text-cyan-700">
              B-Care Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              {user && (
                <div
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={goToProfile}
                >
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {initial}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {displayName}
                    </div>
                    <div className="text-gray-500">{displayId}</div>
                  </div>
                </div>
              )}
              <Button
                variant="primary"
                onClick={handleLogout}
                disabled={busy}
                loading={busy}
              >
                {busy ? "LOGGING OUT..." : "LOGOUT"}
              </Button>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="flex md:hidden items-center justify-between">
            {user && (
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={goToProfile}
              >
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {initial}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {displayName}
                  </div>
                  <div className="text-gray-500 text-xs">{displayId}</div>
                </div>
              </div>
            )}
            <Button
              variant="primary"
              onClick={handleLogout}
              disabled={busy}
              loading={busy}
              className="text-xs px-3 py-1"
            >
              {busy ? "..." : "LOGOUT"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
