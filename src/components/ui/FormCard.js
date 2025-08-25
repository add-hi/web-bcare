"use client";

import React from "react";

const FormCard = ({ 
  title, 
  children, 
  bgColor = "bg-white", 
  headerColor = "bg-gray-600",
  className = "" 
}) => {
  return (
    <div className={`w-full ${bgColor} p-6 mb-6 relative rounded-lg border border-gray-300 ${className}`}>
      <div className={`${headerColor} text-white text-center py-2 px-4 rounded-t-lg -m-6 mb-6`}>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="bg-white border-gray-200 p-6 rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default FormCard;