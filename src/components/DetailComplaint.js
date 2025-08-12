import CustomerForm from "@/components/form/CustomerForm";
import DataForm from "@/components/form/DataForm";
import ActionForm from "@/components/form/ActionForm";
import NotesForm from "@/components/form/NotesForm";
import ComplaintTable from "@/components/ComplaintTable";
import FloatingCustomerContact from "@/components/FloatingCustomerContact";
import InputFormRow from "@/components/form/InputFormRow";

function ViewData() {
  return (
    <div>
      {/* Konten halaman View Data */}
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
