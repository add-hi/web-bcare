import { ChevronDown } from "lucide-react";

export default function SelectField({ label, required, defaultValue, options }) {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative flex-1">
        <select
          defaultValue={defaultValue}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
