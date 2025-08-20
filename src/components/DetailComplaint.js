"use client";

import CustomerForm from "@/components/form/CustomerForm";
import DataForm from "@/components/form/DataForm";
import ActionForm from "@/components/form/ActionForm";
import NotesForm from "@/components/form/NotesForm";
import FloatingCustomerContact from "@/components/FloatingCustomerContact";
import InputFormRow from "@/components/form/InputFormRow";
import { ArrowLeft } from "lucide-react";

function DetailComplaint() {
  const handleBack = () => {
    window.history.back(); // kembali ke halaman sebelumnya
  };

  return (
    <div>
      
      <CustomerForm />
      <DataForm />
      <NotesForm />
      <ActionForm />
     
    </div>
  );
}

export default DetailComplaint;
