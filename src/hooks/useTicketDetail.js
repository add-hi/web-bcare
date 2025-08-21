"use client";
import { useCallback, useMemo } from "react";
import httpClient from "@/lib/httpClient";
import useTicketStore from "@/store/ticketStore";

function getAccessToken() {
    try {
        const raw = localStorage.getItem("auth");
        if (!raw) return "";
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.accessToken || "";
        return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    } catch {
        return "";
    }
}

// normalizer: response GET /v1/tickets/:id -> shape yang dipakai layar
function mapDetail(data) {
    // activities -> notes ringkas (division log) + raw division_notes
    const activities = Array.isArray(data?.activities) ? data.activities : [];
    const division = activities.map((a) => ({
        division: a?.sender_type?.sender_type_name || a?.sender_type?.sender_type_code || "-",
        timestamp: a?.ticket_activity_time || null,
        msg: a?.content || "",
        author: (a?.sender_type?.sender_type_name || "Unknown"),
    }));

    const customer = data?.customer || {};
    const relatedAcc = data?.related_account || {};
    const relatedCard = data?.related_card || {};
    const policy = data?.policy || {};
    const issue_channel = data?.issue_channel || {};
    const complaint = data?.complaint || {};
    const intake_source = data?.intake_source || {};
    const employee = data?.employee || {};
    const priority = data?.priority || {};
    const employee_status = data?.employee_status || {};
    const customer_status = data?.customer_status || {};
    const sla_info = data?.sla_info || {};

    return {
        ids: {
            ticketId: data?.ticket_id ?? null,
            ticketNumber: data?.ticket_number ?? null,
            customerId: customer?.customer_id ?? null,
            complaintId: complaint?.complaint_id ?? null,
            employeeId: employee?.employee_id ?? null,
        },
        timestamps: {
            createdTime: data?.created_time ?? null,
            transactionDate: data?.transaction_date ?? null,
            committedDueAt: data?.committed_due_at ?? sla_info?.committed_due_at ?? null,
            closedTime: data?.closed_time ?? null,
        },
        customer: {
            cif: String(customer?.cif ?? ""),
            gender: String((customer?.gender_type || ""))
                .toUpperCase()
                .replace("FEMALE", "FEMALE")
                .replace("MALE", "MALE"),
            address: customer?.address ?? "",
            accountNumber: relatedAcc?.account_number != null ? String(relatedAcc.account_number) : "",
            placeOfBirth: customer?.place_of_birth ?? "",
            billingAddress: customer?.billing_address ?? "",
            cardNumber: relatedCard?.card_number != null ? String(relatedCard.card_number) : "",
            homePhone: customer?.home_phone != null ? String(customer.home_phone) : "",
            postalCode: customer?.postal_code != null ? String(customer.postal_code) : "",
            customerName: customer?.full_name ?? "",
            handphone: customer?.phone_number != null ? String(customer.phone_number) : "",
            officePhone: customer?.office_phone != null ? String(customer.office_phone) : "",
            personId: customer?.nik != null ? String(customer.nik) : "",
            email: customer?.email ?? "",
            faxPhone: customer?.fax_phone != null ? String(customer.fax_phone) : "",
            listDebitCardNumber: relatedCard?.card_number != null ? String(relatedCard.card_number) : "",
        },
        ticket: {
            description: data?.description ?? "",
            amount: data?.amount ?? null,
            channel: { code: issue_channel?.channel_code ?? "", name: issue_channel?.channel_name ?? "" },
            terminal: { code: data?.terminal?.terminal_code ?? "", location: data?.terminal?.location ?? "" },
            complaint: { code: complaint?.complaint_code ?? "", name: complaint?.complaint_name ?? "" },
            intakeSource: { code: intake_source?.source_code ?? "", name: intake_source?.source_name ?? "" },
            employee: { fullName: employee?.full_name ?? "", npp: employee?.npp ?? "", email: employee?.email ?? "" },
            priority: { code: priority?.priority_code ?? "", name: priority?.priority_name ?? "" },
        },
        statuses: {
            customer: {
                id: customer_status?.customer_status_id ?? null,
                code: customer_status?.customer_status_code ?? "",
                name: customer_status?.customer_status_name ?? "",
            },
            employee: {
                id: employee_status?.employee_status_id ?? null,
                code: employee_status?.employee_status_code ?? "",
                name: employee_status?.employee_status_name ?? "",
            },
        },
        policy: {
            id: policy?.policy_id ?? null,
            slaDays: policy?.sla_days ?? policy?.sla ?? null,
            slaHours: policy?.sla_hours ?? null,
            uicId: policy?.uic_id ?? null,
        },
        sla: {
            committedDueAt: sla_info?.committed_due_at ?? null,
            remainingHours: sla_info?.remaining_hours ?? null,
            isOverdue: !!sla_info?.is_overdue,
            status: sla_info?.status ?? "",
        },
        notes: {
            division,
            raw: data?.division_notes ?? null,
        },
        activities: activities || [],
        attachments: Array.isArray(data?.attachments) ? data.attachments : [],
        __raw: data,
    };
}

export default function useTicketDetail(ticketId) {
    const {
        selectedId, setSelectedId,
        detailById, loadingDetail, errorDetail,
        setDetailLoading, setDetailError, upsertDetail,
    } = useTicketStore();

    const BASE = useMemo(() =>
        (process.env.NEXT_PUBLIC_TICKET_API_BASE_URL || "https://275232686ea9.ngrok-free.app").replace(/\/$/, ""),
        []);

    const effectiveId = ticketId ?? selectedId;
    const detail = effectiveId ? detailById[effectiveId] : null;

    const fetchTicketDetail = useCallback(async (id, { force = true } = {}) => {
        console.log('fetch Detail Ticket hit');
        
        const ticketIdToFetch = id ?? effectiveId;
        if (!ticketIdToFetch) return;

        // if (!force && detailById[ticketIdToFetch]) {
        //     setSelectedId(ticketIdToFetch);
        //     return; // pakai cache
        // }

        setDetailLoading(true);
        setDetailError(null);

        try {
            const Authorization = getAccessToken();
            if (!Authorization) throw new Error("Token tidak ditemukan. Silakan login ulang.");

            const res = await httpClient.get(`/v1/tickets/${ticketIdToFetch}`, {
                baseURL: BASE,
                headers: {
                    Accept: "application/json",
                    Authorization,
                    "ngrok-skip-browser-warning": "true",
                },
            });

            const payload = res?.data;
            if (!payload?.success) throw new Error(payload?.message || "Gagal mengambil detail tiket");

            const normalized = mapDetail(payload.data || {});
            upsertDetail(ticketIdToFetch, normalized);
            setSelectedId(ticketIdToFetch);
        } catch (e) {
            setDetailError(e?.response?.data?.message || e?.message || "Terjadi kesalahan saat mengambil detail tiket");
        } finally {
            setDetailLoading(false);
        }
    }, [BASE, effectiveId, detailById, setDetailLoading, setDetailError, upsertDetail, setSelectedId]);

    return {
        selectedId,
        detail,
        loading: loadingDetail,
        error: errorDetail,
        fetchTicketDetail,
    };
}
