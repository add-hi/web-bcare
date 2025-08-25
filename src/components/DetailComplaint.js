// src/components/DetailComplaint.js
"use client";

import { useEffect, useState, useCallback } from "react";
import CustomerForm from "@/components/form/CustomerForm";
import DataForm from "@/components/form/DataForm";
import ActionForm from "@/components/form/ActionForm";
import NotesForm from "@/components/form/NotesForm";
import useTicketDetail from "@/hooks/useTicketDetail";
import useTicket from "@/hooks/useTicket";
import FloatingCustomerContact from "./FloatingCustomerContact";

// --- helper mappers ---
function mapActionToSwagger(action) {
  const a = String(action || "").toLowerCase();
  if (a === "closed") return "CLOSED";
  if (a === "decline" || a === "declined") return "DECLINED";
  if (a === "eskalasi" || a === "escalated" || a === "escalate")
    return "ESCALATED";
  return "";
}
const toInt = (v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const pickId = (candidate, fallback) => {
  const n = toInt(candidate);
  if (n !== undefined) return n;
  const fb = toInt(fallback);
  return fb !== undefined ? fb : undefined;
};
const normalizeDivisionNotes = (notes) => {
  if (!notes) return [];
  if (Array.isArray(notes)) return notes;
  if (typeof notes === "string") {
    try {
      const parsed = JSON.parse(notes);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

function DetailComplaint({ ticketId, onSuccess }) {
  const { detail, loading, error, fetchTicketDetail } =
    useTicketDetail(ticketId);
  const { updateTicket } = useTicket();

  // tampung nilai dari child
  const [customerForm, setCustomerForm] = useState(null);
  const [dataForm, setDataForm] = useState(null);
  const [actionForm, setActionForm] = useState(null);
  const [divisionNotes, setDivisionNotes] = useState(
    detail?.notes?.division || []
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitOk, setSubmitOk] = useState(false);

  useEffect(() => {
    if (!detail && ticketId) fetchTicketDetail(ticketId, { force: false });
  }, [detail, ticketId, fetchTicketDetail]);

  const effectiveId = detail?.ids?.ticketId || detail?.ticket_id || ticketId;

  const handleSubmit = useCallback(async () => {
    if (!effectiveId) return;

    const actionCode = mapActionToSwagger(actionForm?.action);
    if (actionCode === "CLOSED" && !actionForm?.solution) {
      setSubmitError("Solution wajib diisi untuk action Closed");
      return;
    }
    if (actionCode === "DECLINED" && !actionForm?.reason) {
      setSubmitError("Reason wajib diisi untuk action Decline");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitOk(false);

    try {
      const fb = {
        issue_channel_id: detail?.ticket?.channel?.id,
        intake_source_id: detail?.ticket?.intakeSource?.id,
        complaint_id: detail?.ticket?.complaint?.id,
        terminal_id: detail?.ticket?.terminal?.id,
        priority_id:
          detail?.ticket?.priority?.id ?? detail?.ticket?.priority?.priority_id,
      };

      const df = dataForm || {};
      const notes = normalizeDivisionNotes(divisionNotes);
      const trxIso = df.transactionDate
        ? new Date(df.transactionDate).toISOString()
        : detail?.timestamps?.transactionDate || undefined;

      const payload = {
        action: actionCode || "",
        priority_id: pickId(df.priority_id ?? df.priority, fb.priority_id),
        record: df.record ?? detail?.ticket?.record ?? "",
        issue_channel_id: pickId(
          df.issue_channel_id ?? df.channel_id ?? df.channel,
          fb.issue_channel_id
        ),
        intake_source_id: 2, // TODO: ganti saat sudah ada master intake source
        complaint_id: pickId(
          df.complaint_id ?? df.category_id ?? df.category,
          fb.complaint_id
        ),
        amount: toInt(df.amount ?? df.nominal),
        transaction_date: trxIso,
        terminal_id: pickId(
          df.terminal_id ?? df.terminalCode ?? df.idTerminalATM,
          fb.terminal_id
        ),
        description: df.description ?? detail?.ticket?.description ?? "",
        division_notes: notes,
      };

      await updateTicket(effectiveId, payload);

      setSubmitOk(true);
      await fetchTicketDetail(effectiveId, { force: true }).catch(() => {});

      // === panggil parent untuk balik ke list & refresh ===
      onSuccess?.();
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "Gagal update tiket";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [
    effectiveId,
    detail,
    dataForm,
    actionForm,
    divisionNotes,
    updateTicket,
    fetchTicketDetail,
    onSuccess,
  ]);

  if (loading && !detail) return <div className="p-6">Loading detail…</div>;
  if (error && !detail)
    return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!detail) return <div className="p-6">No detail.</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {detail?.ids?.ticketNumber || "Ticket Detail"}
      </h3>

      <CustomerForm detail={detail} onChange={setCustomerForm} />
      <DataForm detail={detail} onChange={setDataForm} />
      <NotesForm detail={detail} onChange={setDivisionNotes} />

      <ActionForm
        detail={detail}
        onChange={setActionForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitOk={submitOk}
        submitError={submitError}
      />
      <FloatingCustomerContact room="general" detail={detail} />
    </div>
  );
}

export default DetailComplaint;
