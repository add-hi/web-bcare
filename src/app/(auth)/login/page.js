"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simulasi login - ganti dengan API call sebenarnya
    if (formData.username === "admin" && formData.password === "password") {
      // Set session/token di sini
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: "CxC Agent",
          id: "123456",
          role: "Asisten BCC Divisi CXC",
        })
      );
      router.push("/dashboard/home");
    } else {
      alert("Username atau password salah!");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-4xl shadow-lg p-10 py-16 w-full max-w-md border-3 border-orange-400">
        {/* BNI Logo and Title */}
        <div className="text-center mb-8">
          <Image
            src="/BNI_logo.svg"
            alt="BNI Logo"
            width={200}
            height={100}
            className="mx-auto mb-2"
            priority
          />
          <p className="text-blue-500 text-lg font-bold tracking-widest">
            CX Communication
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all shadow-sm"
              required
            />
          </div>

          <div className="pt-8">
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 active:scale-95 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-150 shadow-lg transform"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
