import React from "react";

const ReusableNavbar = ({ items }) => {
  return (
    <div className="bg-[#5B91CD] flex items-center h-10 px-2">
      <div className="flex gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            className="flex items-center gap-2 px-4 py-1 bg-transparent text-black hover:bg-white  rounded-sm transition-colors"
          >
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: `linear-gradient(to right, ${item.from}, ${item.to})` }}
            ></span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReusableNavbar;
