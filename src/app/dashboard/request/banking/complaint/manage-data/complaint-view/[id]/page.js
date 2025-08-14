'use client';
import DetailComplaint from "@/components/DetailComplaint";
import { useRouter } from 'next/navigation';

function ViewData() {
  const router = useRouter();
  const handleBackToTable = () => {
    router.back();
  };

  return (
    <div>
      <DetailComplaint />
    </div>
  );
}

export default ViewData;
