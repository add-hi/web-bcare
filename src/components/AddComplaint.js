"use client";

import CustomerForm from "@/components/form/CustomerForm";
import DataForm from "@/components/form/DataForm";
import ActionForm from "@/components/form/ActionForm";
import NotesForm from "@/components/form/NotesForm";
import InputFormRow from "@/components/form/InputFormRow";

function AddComplaint() {
  return (
    <div>
      <InputFormRow />
      <CustomerForm />
      <DataForm />
      <NotesForm />
      <ActionForm />
    </div>
  );
}

export default AddComplaint;
