import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// --- Mock child components supaya fokus ke ComplaintList ---
vi.mock("@/components/DetailComplaint", () => ({
  default: ({ selectedComplaint }) => (
    <div data-testid="detail-view">
      Detail Mock: {selectedComplaint?.noTiket}
    </div>
  ),
}));
vi.mock("@/components/AddComplaint", () => ({
  default: () => <div data-testid="add-view">Add Complaint Form (Mock)</div>,
}));
vi.mock("@/components/Attachment", () => ({
  default: ({ ticketId }) => (
    <div data-testid="attachments-view">Attachment Mock for {ticketId}</div>
  ),
}));

// --- Import komponen yang diuji ---
import ComplaintList from "@/components/form/ComplaintList";

// (jaga-jaga, bersihkan spy/mocks tiap test)
beforeEach(() => vi.restoreAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("ComplaintList – behavior utama", () => {
  it("menampilkan header kolom & info jumlah", () => {
    render(<ComplaintList />);
    // cek SEMUA header ada
    const expectedHeaders = [
      /^No$/i,
      /^Tgl Input$/i,
      /^No\.?\s*Tiket$/i, // titik opsional, spasi fleksibel
      /^Channel$/i,
      /^Category$/i,
      /^Customer Name$/i,
      /^Number$/i,
      /^Card Number$/i,
      /^Created By Unit$/i,
      /^Unit Now$/i,
      /^Status$/i,
      /^SLA$/i,
    ];
    const ths = screen.getAllByRole("columnheader");
    // pastikan setiap regex ada yang match salah satu <th>
    expectedHeaders.forEach((rx) => {
      const found = ths.some((th) => rx.test(th.textContent.trim()));
      expect(found).toBe(true);
    });
    // tetap cek info jumlah (biasanya muncul 2x)
    const infos = screen.getAllByText(/Showing\s+\d+\s+of\s+\d+\s+entries/i);
    expect(infos.length).toBeGreaterThan(0);
  });

  it('toggle sort pada kolom "Tgl Input" (ikon naik/turun berubah)', async () => {
    render(<ComplaintList />);
    const th = screen.getByText("Tgl Input").closest("th");
    const [sortBtn] = within(th).getAllByRole("button"); // [sort, filter]

    // default: chevron-down abu
    const defaultDown = th.querySelector(
      "svg.lucide-chevron-down.text-gray-400"
    );
    expect(!!defaultDown).toBe(true);

    // klik 1 → ASC → chevron-up
    await userEvent.click(sortBtn);
    const up = th.querySelector("svg.lucide-chevron-up");
    expect(!!up).toBe(true);

    // klik 2 → DESC → chevron-down aktif (bukan abu)
    await userEvent.click(sortBtn);
    const activeDown = th.querySelector("svg.lucide-chevron-down");
    expect(!!activeDown).toBe(true);
    expect(activeDown.classList.contains("text-gray-400")).toBe(false);
  });

  it("filter Channel=ATM → chip muncul → Clear All Filters menghapus chip", async () => {
    render(<ComplaintList />);

    const channelTh = screen.getByText("Channel").closest("th");
    const [, filterBtn] = within(channelTh).getAllByRole("button"); // [sort, filter]
    await userEvent.click(filterBtn);

    await userEvent.click(within(channelTh).getByText("ATM"));
    await userEvent.click(
      within(channelTh).getByRole("button", { name: /Apply/i })
    );

    const chip = screen.getByText(/Channel:/i);
    expect(!!chip).toBe(true);

    await userEvent.click(
      screen.getByRole("button", { name: /Clear All Filters/i })
    );
    expect(screen.queryByText(/Channel:/i) === null).toBe(true);
  });

  it('filter tanggal cepat "Today" → hasil 0 of 1', async () => {
    render(<ComplaintList />);

    const tglTh = screen.getByText("Tgl Input").closest("th");
    const [, filterBtn] = within(tglTh).getAllByRole("button");
    await userEvent.click(filterBtn);

    await userEvent.click(screen.getByRole("button", { name: "Today" }));
    await userEvent.click(
      screen.getByRole("button", { name: /Apply Filter/i })
    );

    const zeros = screen.getAllByText(/Showing\s+0\s+of\s+\d+\s+entries/i);

    expect(zeros.length).toBeGreaterThan(0);
  });

  it("klik Add → masuk view Add → Back to List → kembali ke table", async () => {
    render(<ComplaintList />);

    await userEvent.click(screen.getByRole("button", { name: /^Add$/i }));
    const backBtn = screen.getByRole("button", { name: /Back to List/i });
    expect(!!backBtn).toBe(true);
    expect(!!screen.getByTestId("add-view")).toBe(true);

    await userEvent.click(backBtn);
    const headerNo = screen.getByRole("columnheader", { name: /^No$/i });
    expect(!!headerNo).toBe(true);
  });

  it("row click → Detail → Attachments → Back to Detail → kembali Detail", async () => {
    render(<ComplaintList />);

    await userEvent.click(screen.getByText("123456778"));
    expect(!!screen.getByTestId("detail-view")).toBe(true);

    await userEvent.click(screen.getByRole("button", { name: /Attachments/i }));
    expect(!!screen.getByTestId("attachments-view")).toBe(true);

    const backFromAttachments = screen.getByRole("button", {
      name: /Back to Detail/i,
    });
    expect(!!backFromAttachments).toBe(true);

    await userEvent.click(backFromAttachments);
    expect(!!screen.getByTestId("detail-view")).toBe(true);
  });
});
