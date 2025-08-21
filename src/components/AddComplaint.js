"use client";

import { useRef, useEffect, useState } from "react";
import CustomerForm from "@/components/add_form/CustomerForm";
import DataForm from "@/components/add_form/DataForm";
import ActionForm from "@/components/add_form/ActionForm";
import NotesForm from "@/components/add_form/NotesForm";
import InputFormRow from "@/components/add_form/InputFormRow";
import useAddComplaint from "@/hooks/useAddComplaint";

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
        <button
          onClick={handleFullReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          title="Reset All Forms"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset All
        </button>
      </div>
      <InputFormRow ref={inputFormRef} onCustomerData={handleCustomerData} />
      <CustomerForm 
        customerData={customerData} 
        searchContext={searchContext} 
        inputType={inputType}
        onChange={(data) => {
          console.log('CustomerForm onChange called with:', data);
          // Customer form data is already handled by setCustomerData
          // We don't need to store it separately since it's managed by the hook
        }}
      />
      <DataForm mode="add" onChange={setDataFormData} />
      <NotesForm />
      <ActionForm />
    </div>
  );
}

export default AddComplaint;
