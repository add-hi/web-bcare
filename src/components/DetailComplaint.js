"use client";

import CustomerForm from "@/components/form/CustomerForm";
import DataForm from "@/components/form/DataForm";
import ActionForm from "@/components/form/ActionForm";
import NotesForm from "@/components/form/NotesForm";
import FloatingCustomerContact from "@/components/FloatingCustomerContact";
import InputFormRow from "@/components/form/InputFormRow";
import { ArrowLeft } from "lucide-react";

function ViewData() {
  const handleBack = () => {
    window.history.back(); // kembali ke halaman sebelumnya
  };

  return (
    <div>
      <button
  onClick={handleBack}
  className="flex items-center gap-2 px-4 py-2 mb-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors -ml-2"
  style={{ marginLeft: '0' }} // atau kalau mau lebih presisi bisa pakai style
>
  <ArrowLeft size={16} />
  Back
</button>


      <InputFormRow />
      <CustomerForm />
      <DataForm />
      <NotesForm />
      <ActionForm />
      <FloatingCustomerContact />
    </div>
  );
}

export default ViewData;
