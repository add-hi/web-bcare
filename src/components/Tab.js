"use client"
import Link from "next/link";
import React, { useState, useEffect } from "react";

const Tab = ({ items }) => {
  const [activeUrl, setActiveUrl] = useState("");
  const [activeTabId, setActiveTabId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      setActiveUrl(currentPath);

      // Cari tab dengan url prefix terpanjang yang cocok
      let matchedItem = null;
      let maxLength = -1;
      items.forEach((item) => {
        if (
          currentPath.startsWith(item.url) &&
          item.url.length > maxLength
        ) {
          matchedItem = item;
          maxLength = item.url.length;
        }
      });

      setActiveTabId(matchedItem?.id || null);
    }
  }, [items]);

  return (
    <div className="bg-[#5B91CD] flex items-center h-10 px-2">
      <div className="flex gap-2">
        {items.map((item) => {
          const isActive = item.id === activeTabId;
          return (
            <Link
              key={item.id}
              href={item.url}
        
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
