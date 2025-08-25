"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  ArrowRight,
  X,
  Mail,
  Phone,
  ArrowLeft,
  Shield,
  Copy,
} from "lucide-react";
import useUser from "@/hooks/useUser";
import toast from "react-hot-toast";

// --- helper to read division_code from user objects ---
function normalizeDivision(u) {
  return String(u?.division_code ?? u?.data.division_code ?? "")
    .trim()
    .toLowerCase();
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, status, user } = useUser();
  const isLoading = status === "authenticating" || status === "loading";

  // If already logged in and you hit /login, route by division from store
  useEffect(() => {
    if (!isAuthenticated) return;
    const division = normalizeDivision(user);
    if (division === "cxc") router.replace("/dashboard/home");
    else router.replace("/dashboard/mockdgo");
  }, [isAuthenticated, user, router]);

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({ npp: "" });
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({
        npp: formData.username,
        password: formData.password,
      });

      // Optional: route by division code if you want (kept close to your old logic)
      const div = result?.data?.division_code?.toLowerCase?.() || "";
      if (div === "cxc") router.push("/dashboard/home");
      else router.push("/dashboard/mockdgo");
    } catch (err) {
      toast.error(err?.message || "Login failed")
      // alert(err?.message || "Login failed");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit(e);
  };

  const handleForgotPasswordInputChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReset(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setForgotPasswordStep(2);
    setIsSubmittingReset(false);
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(1);
    setForgotPasswordData({ npp: "" });
    setIsSubmittingReset(false);
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-orange-300/10 rounded-full blur-2xl animate-pulse delay-500"></div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-900/10 p-8 pt-10 w-full max-w-md border border-white/20 relative z-10">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>

        <div className="relative z-10">
          {/* BNI Logo and Title */}
          <div className="text-center mb-10">
            <div className="relative mb-4">
              <Image
                src="/BNI_logo.svg"
                alt="BNI Logo"
                width={200}
                height={100}
                className="mx-auto drop-shadow-sm"
                priority
              />
            </div>
            <p className="text-blue-600 text-m font-semibold tracking-wide uppercase opacity-80">
              B-Care Dashboard
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full mx-auto mt-3"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Username Field */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-orange-600">
                  NPP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all duration-200 placeholder-gray-400 hover:bg-gray-50 group"
                    placeholder="Enter your NPP"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-orange-600">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all duration-200 placeholder-gray-400 hover:bg-gray-50"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full bg-gradient-to-r from-orange-500 to-orange-600 
             hover:from-orange-600 hover:to-orange-700 
             disabled:from-gray-400 disabled:to-gray-500
             text-white font-semibold py-4 px-6 rounded-xl 
             transition-all duration-300 shadow-lg shadow-orange-500/25 
             hover:shadow-orange-500/40 hover:shadow-xl 
             transform hover:-translate-y-0.5 active:translate-y-0 
             disabled:transform-none disabled:shadow-none 
             flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform duration-200"
                    />
                  </>
                )}
              </button>

            </div>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
            >
              Forgot your password?
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Secure login protected by BNI security protocols
            </p>
            <div className="flex items-center justify-center space-x-1 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                Password Reset
              </h2>
              <button
                onClick={resetForgotPassword}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {forgotPasswordStep === 1 && (
                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield size={24} className="text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Admin Access Required
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Password resets require system administrator approval for
                      security
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your NPP
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        name="npp"
                        value={forgotPasswordData.npp}
                        onChange={handleForgotPasswordInputChange}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all duration-200"
                        placeholder="Enter your NPP"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReset}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    {isSubmittingReset ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Checking NPP...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Admin Contact</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {forgotPasswordStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield size={24} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Contact System Administrator
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Please contact your system administrator to reset your
                      password
                    </p>
                  </div>

                  {/* Admin Contact Information */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            IT Support
                          </p>
                          <p className="text-sm text-gray-600">
                            itsupport@bni.co.id
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard("itsupport@bni.co.id")}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Copy email"
                      >
                        <Copy size={16} className="text-gray-500" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone size={18} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Help Desk</p>
                          <p className="text-sm text-gray-600">ext. 1234</p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard("1234")}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Copy extension"
                      >
                        <Copy size={16} className="text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <h4 className="font-medium text-orange-800 mb-2">
                      Required Information:
                    </h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>
                        • Your NPP:{" "}
                        <span className="font-mono bg-orange-100 px-2 py-1 rounded">
                          {forgotPasswordData.npp}
                        </span>
                      </li>
                      <li>• Full Name</li>
                      <li>• Department/Division</li>
                      <li>• Manager's Name</li>
                      <li>• Business Justification</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={resetForgotPassword}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                    >
                      Back to Login
                    </button>

                    <button
                      onClick={() => {
                        setForgotPasswordStep(1);
                        setForgotPasswordData({ npp: "" });
                      }}
                      className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft size={16} />
                      <span>Try Different NPP</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
