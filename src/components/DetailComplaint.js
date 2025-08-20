"use client";

import { useEffect } from "react";
import CustomerForm from "@/components/form/CustomerForm";
import DataForm from "@/components/form/DataForm";
import ActionForm from "@/components/form/ActionForm";
import NotesForm from "@/components/form/NotesForm";
import useTicketDetail from "@/hooks/useTicketDetail";
import FloatingCustomerContact from "@/components/FloatingCustomerContact";

function DetailComplaint({ ticketId }) {
  const { detail, loading, error, fetchTicketDetail } =
    useTicketDetail(ticketId);

  useEffect(() => {
    if (!detail && ticketId) fetchTicketDetail(ticketId, { force: false });
  }, [detail, ticketId, fetchTicketDetail]);

  if (loading && !detail) {
    return <div className="p-6">Loading detail…</div>;
  }
  if (error && !detail) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }
  if (!detail) {
    return <div className="p-6">No detail.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {detail?.ids?.ticketNumber || "Ticket Detail"}
        </h3>
      </div>
      {/* CUKUP kirimkan satu object 'detail' ke tiap child */}
      <CustomerForm detail={detail} />
      <DataForm detail={detail} />
      <NotesForm detail={detail} />
      <ActionForm detail={detail} />
      <FloatingCustomerContact room="general" detail={detail} />
    </div>
  );
}

export default DetailComplaint;
