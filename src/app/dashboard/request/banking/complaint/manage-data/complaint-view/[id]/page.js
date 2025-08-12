'use client';
import DetailComplaint from "@/components/DetailComplaint";
import { ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';

function ViewData() {
  const router = useRouter();
  const handleBackToTable = () => {
    router.back();
  };

  return (
    <div>
      {/* Konten halaman View Data */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBackToTable}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Table
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          Complaint Detail
        </h2>
      </div>
      <DetailComplaint />
    </div>
  );
}

export default ViewData;
