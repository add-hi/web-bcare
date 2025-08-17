"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react"; // ⬅️ drop useEffect
import useAuth from "@/hooks/useAuth";

export default function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await logout(); // hits /auth/logout, clears tokens/cookies in store
      router.replace("/login"); // middleware will allow /login once cookie is gone
    } finally {
      setBusy(false);
    }
  };

  const goToProfile = () => router.push("/dashboard/profile");

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex">
        <div className="w-64 bg-slate-700 text-white px-6 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
          <Image
            src="/BNI_logo_white.svg"
            alt="BNI Logo"
            width={140}
            height={70}
            priority
          />
        </div>

        <div className="flex-1 bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-cyan-700">
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
                      {user?.full_name?.charAt(0) ||
                        user?.name?.charAt(0) ||
                        "U"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {user?.full_name || user?.name}
                    </div>
                    <div className="text-gray-500">{user?.npp || user?.id}</div>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                disabled={busy}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                {busy ? "LOGGING OUT..." : "LOGOUT"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
