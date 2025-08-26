"use client";

import React from "react";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

const StatusBadge = ({ status, type = "default" }) => {
  const statusConfigs = {
    default: {
      Open: { color: "bg-blue-100 text-blue-800", icon: Clock },
      "Handled by CxC": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      Escalated: { color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
      "Done by UIC": { color: "bg-purple-100 text-purple-800", icon: CheckCircle },
      Closed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      Inprogress: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      Completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      Overdue: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
    }
  };

  const config = statusConfigs[type][status] || {
    color: "bg-gray-100 text-gray-800",
    icon: Clock,
  };

  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <IconComponent size={12} />
      {status}
    </span>
  );
};

export default StatusBadge;