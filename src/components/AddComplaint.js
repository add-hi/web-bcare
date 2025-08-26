"use client";

import { useRef, useEffect, useState } from "react";
import CustomerForm from "@/components/add_form/CustomerFormAdd";
import DataForm from "@/components/add_form/DataFormAdd";
import ActionForm from "@/components/add_form/ActionFormAdd";
import NotesForm from "@/components/add_form/NotesFormAdd";
import InputFormRow from "@/components/add_form/InputFormRowAdd";
import useAddComplaint from "@/hooks/useAddComplaint";
import Button from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";

function AddComplaint() {
  const inputFormRef = useRef();
  const {
    customerData, searchContext, inputType, dataFormData,
    setCustomerData, setDataFormData, resetAllForms
  } = useAddComplaint();

  const handleCustomerData = (data, context, type) => {
    setCustomerData(data, context, type);
  };

  const handleFullReset = () => {
    resetAllForms();
    if (inputFormRef.current) {
      inputFormRef.current.resetForm();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Add Complaint</h1>
        <Button
          variant="secondary"
          icon={RefreshCw}
          onClick={handleFullReset}
          title="Reset All Forms"
        >
          Reset All
        </Button>
      </div>
      <InputFormRow ref={inputFormRef} onCustomerData={handleCustomerData} />
      <CustomerForm 
        customerData={customerData} 
        searchContext={searchContext} 
        inputType={inputType}
        onChange={(data) => {
          // Use setTimeout to prevent setState during render
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
