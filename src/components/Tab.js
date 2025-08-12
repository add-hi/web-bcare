"use client"
import Link from "next/link";
import React, { useState, useEffect } from "react";

const Tab = ({ items }) => {
  // Inisialisasi activeUrl kosong dulu, nanti di useEffect di-set ke current path
  const [activeUrl, setActiveUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      console.log("Current path:", currentPath); // cek path yang terbaca
      setActiveUrl(currentPath);
    }
  }, []);

  return (
    <div className="bg-[#5B91CD] flex items-center h-10 px-2">
      <div className="flex gap-2">
        {items.map((item) => {
          const isActive = activeUrl === item.url;
          return (
            <Link
              key={item.id}
              href={item.url}
              onClick={() => setActiveUrl(item.url)}
              className={`flex items-center gap-2 px-4 py-1 rounded-sm transition-colors ${
                isActive
                  ? "bg-white text-black"
                  : "bg-transparent text-black hover:bg-white"
              }`}
            >
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{
                  background: `linear-gradient(to right, ${item.from}, ${item.to})`,
                }}
              ></span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Tab;
