"use client";

import { useRef, useEffect } from "react";
import CustomerForm from "@/components/add_form/CustomerFormAdd";
import DataForm from "@/components/add_form/DataFormAdd";
import ActionForm from "@/components/add_form/ActionFormAdd";
import NotesForm from "@/components/add_form/NotesFormAdd";
import InputFormRow from "@/components/add_form/InputFormRowAdd";
import useAddComplaint from "@/hooks/useAddComplaint";
import Button from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";

function AddComplaint({ reset = false }) {
  const inputFormRef = useRef(null);
  const {
    customerData, searchContext, inputType, setCustomerData, setDataFormData, resetAllForms
  } = useAddComplaint();

  const handleCustomerData = (data, context, type) => {
    setCustomerData(data, context, type);
  };

  const handleFullReset = () => {
    resetAllForms();
    inputFormRef.current?.resetForm?.();
  };

  // Reset SEKALI saat pertama kali masuk halaman Add
  const didInitialReset = useRef(false);
  useEffect(() => {
    if (!didInitialReset.current) {
      handleFullReset();
      didInitialReset.current = true;
    }
  }, []);

  // (opsional) kalau parent kirim reset=true lagi di lain waktu, tetap reset
  useEffect(() => {
    if (reset) handleFullReset();
  }, [reset]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Add Complaint</h1>
        <Button variant="secondary" icon={RefreshCw} onClick={handleFullReset} title="Reset All Forms">
          Reset All
        </Button>
      </div>

      <InputFormRow ref={inputFormRef} onCustomerData={handleCustomerData} />

      <CustomerForm
        customerData={customerData}
        searchContext={searchContext}
        inputType={inputType}
        reset={reset} // boleh dikirim; CustomerForm akan menanganinya sebagai reset-sekali
        onChange={(data) => {
          // de-bounce microtask biar tidak setState saat render
          setTimeout(() => {
            const currentData = JSON.stringify(customerData || {});
            const newData = JSON.stringify({ ...customerData, ...data });
            if (currentData !== newData) {
              setCustomerData({ ...customerData, ...data }, searchContext, inputType);
            }
          }, 0);
        }}
      />

      <DataForm mode="add" onChange={setDataFormData} />
      <NotesForm />
      <ActionForm />
    </div>
  );
}

export default AddComplaint;
