import CustomerForm from "@/components/form/CustomerForm";
import DataForm from "@/components/form/DataForm";
import ActionForm from "@/components/form/ActionForm";
import NotesForm from "@/components/form/NotesForm";
import ComplaintTable from "@/components/ComplaintTable";
import FloatingCustomerContact from "@/components/FloatingCustomerContact";
import InputFormRow from "@/components/form/InputFormRow";
import Tab from "@/components/Tab";

import { ChevronDown } from 'lucide-react';
function ViewData() {
  const tabs = [
    { id: "view-data", label: "VIEW DATA", from: "#6F946E", to: "#C4FEC2" },
    { id: "attachment", label: "ATTACHMENT", from: "#53A1CF", to: "#28B9D5" },
    { id: "raise-call", label: "RAISE CALL", from: "#7DA05C", to: "#81CA6E" },
  ];

  return (
    <div>
      <Tab items={tabs} />
      <InputFormRow />
    <CustomerForm/>
    <DataForm />
    <NotesForm />
    <ActionForm />
      <ComplaintTable />
      <FloatingCustomerContact />
    </div>



  );
}

export default ViewData;
