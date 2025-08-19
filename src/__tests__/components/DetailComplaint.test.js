// src/__tests__/components/DetailComplaint.test.js
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import DetailComplaint, {
  CustomerInfo,
  DataForm,
  NotesForm,
  ActionForm,
} from "@/components/DetailComplaint";

// helper: cari elemen <label> yg teksnya mungkin mengandung "*"
function getLabel(labelText) {
  const labs = Array.from(document.querySelectorAll("label"));
  return labs.find(
    (el) => (el.textContent || "").replace("*", "").trim() === labelText
  );
}

describe("CustomerInfo", () => {
  it("menampilkan judul & semua label, tipe kontrol sesuai", () => {
    render(<CustomerInfo />);

    // judul
    expect(!!screen.getByText(/Customer Info/i)).toBe(true);

    // semua label yang diharapkan
    const expected = [
      "CIF",
      "Gender",
      "Address",
      "Account Number",
      "Place Of Birth",
      "Billing Address",
      "Card Number",
      "Home Phone",
      "Postal Code",
      "Customer Name",
      "Handphone",
      "Office Phone",
      "Person ID",
      "Email",
      "Fax Phone",
      "List Debit Card Number",
    ];
    expected.forEach((name) => {
      expect(!!getLabel(name)).toBe(true);
    });
    expect(document.querySelectorAll("label").length).toBe(16);

    // required star: Gender, Address, Home Phone, Customer Name, Handphone (total 5)
    const requiredNames = new Set([
      "Gender",
      "Address",
      "Home Phone",
      "Customer Name",
      "Handphone",
    ]);
    const stars = Array.from(document.querySelectorAll("label")).filter(
      (l) => !!l.querySelector("span.text-red-500")
    );
    expect(stars.length).toBe(5);
    Array.from(document.querySelectorAll("label")).forEach((l) => {
      const name = (l.textContent || "").replace("*", "").trim();
      const hasStar = !!l.querySelector("span.text-red-500");
      expect(hasStar === requiredNames.has(name)).toBe(true);
    });

    // tipe kontrol: 1 select (Gender), 2 textarea (Address, Billing Address), 13 input
    expect(document.querySelectorAll("select").length).toBe(1);
    expect(document.querySelectorAll("textarea").length).toBe(2);
    expect(document.querySelectorAll("input").length).toBe(13);
  });
});

describe("DataForm", () => {
  it("menampilkan judul, label, required star & tipe kontrol sesuai", () => {
    render(<DataForm />);

    expect(!!screen.getByText(/^Data$/)).toBe(true);

    const expected = [
      "Service",
      "Priority",
      "Record",
      "Channel",
      "Source",
      "Nominal",
      "Category",
      "Transaction Date",
      "Commited Date",
      "Created Time",
      "ID Terminal ATM",
      "SLA",
      "Description",
    ];
    expected.forEach((name, i) => {
      expect(!!getLabel(name)).toBe(true);
    });
    expect(document.querySelectorAll("label").length).toBe(13);

    // required: Service, Channel, Source, Category, Commited Date, SLA, Description → 7 bintang
    const required = new Set([
      "Service",
      "Channel",
      "Source",
      "Category",
      "Commited Date",
      "SLA",
      "Description",
    ]);
    const starCount = Array.from(document.querySelectorAll("label")).filter(
      (l) => !!l.querySelector("span.text-red-500")
    ).length;
    expect(starCount).toBe(7);

    // tipe kontrol:
    // select: Service, Priority, Channel, Source, Category → 5
    // textarea: Record → 1
    // input[type=date]: Transaction Date, Commited Date, Created Time → 3
    // input[text]: Nominal, ID Terminal ATM, SLA, Description → 4
    expect(document.querySelectorAll("select").length).toBe(5);
    expect(document.querySelectorAll("textarea").length).toBe(1);
    expect(document.querySelectorAll('input[type="date"]').length).toBe(3);
    // total input (date + text)
    expect(document.querySelectorAll("input").length).toBe(7);
  });
});

describe("NotesForm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('empty state: tombol "DEV: Load Mock Data" memunculkan 2 messages', () => {
    render(
      <NotesForm
        currentUser={{ name: "A", division: "B" }}
        formId={null}
        initialNotes={[]}
      />
    );

    // empty state visible
    expect(!!screen.getByText(/No Notes yet/i)).toBe(true);
    const devBtn = screen.getByText(/DEV: Load Mock Data/i);
    fireEvent.click(devBtn);

    // setelah klik, count jadi 2 messages
    const counter = screen.getByText(/\b2 messages\b/);
    expect(!!counter).toBe(true);
  });

  it("menambahkan note baru (async 500ms) menambah jumlah messages & menampilkan textnya", async () => {
    render(
      <NotesForm
        currentUser={{ name: "Jane", division: "Divisi CXC" }}
        formId={null}
        initialNotes={[]}
      />
    );

    // ketik note
    const textarea = screen.getByPlaceholderText(
      /Add your communication note here/i
    );
    fireEvent.change(textarea, { target: { value: "Hello world" } });

    const addBtn = screen.getByRole("button", { name: /Add Note/i });
    fireEvent.click(addBtn);

    // jalankan timer 500ms
    await act(async () => {
      vi.runAllTimers();
    });

    // sekarang harus ada 1 messages & teks note muncul
    const counter = screen.getByText(/\b1 messages\b/);
    expect(!!counter).toBe(true);

    const noteText = screen.getByText("Hello world");
    expect(!!noteText).toBe(true);
  });
});

describe("ActionForm", () => {
  it("pilih Action=Closed menampilkan field Solution; Action=Decline menampilkan Reason", () => {
    render(<ActionForm />);

    // cari select Action via label terdekat
    const actionLabel = getLabel("Action");
    const actionSelect = actionLabel?.parentElement?.querySelector("select");
    expect(!!actionSelect).toBe(true);

    // Closed -> Solution muncul
    fireEvent.change(actionSelect, { target: { value: "Closed" } });
    expect(!!getLabel("Solution")).toBe(true);
    expect(!!document.querySelector('input[placeholder="Isi Solution"]')).toBe(
      true
    );

    // Decline -> Reason muncul, Solution hilang
    fireEvent.change(actionSelect, { target: { value: "Decline" } });
    expect(!!getLabel("Reason")).toBe(true);
    expect(document.querySelector('input[placeholder="Isi Solution"]')).toBe(
      null
    );

    // Eskalasi -> keduanya tidak tampil
    fireEvent.change(actionSelect, { target: { value: "Eskalasi" } });
    expect(getLabel("Reason")).toBe(undefined);
    expect(getLabel("Solution")).toBe(undefined);
  });

  it("klik Save memanggil console.log dengan payload formData", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<ActionForm />);

    // isi beberapa field
    const formUnitInput = screen.getByPlaceholderText("Isi Form Unit");
    fireEvent.change(formUnitInput, { target: { value: "Unit A" } });

    // set Closed agar Solution muncul lalu isi
    const actionLabel = getLabel("Action");
    const actionSelect = actionLabel?.parentElement?.querySelector("select");
    fireEvent.change(actionSelect, { target: { value: "Closed" } });

    const solutionInput = screen.getByPlaceholderText("Isi Solution");
    fireEvent.change(solutionInput, { target: { value: "Solved it" } });

    // klik Save
    const saveBtn = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveBtn);

    // dipanggil dengan "Saving data:" dan object
    expect(spy.mock.calls.length > 0).toBe(true);
    const [firstArg, secondArg] = spy.mock.calls[0];
    expect(firstArg).toBe("Saving data:");
    expect(typeof secondArg).toBe("object");

    spy.mockRestore();
  });
});

describe("DetailComplaint", () => {
  it("render semua section judul: Customer Info, Data, Notes, Action", () => {
    render(<DetailComplaint />);

    expect(
      !!screen.getByRole("heading", { level: 2, name: /^Customer Info$/i })
    ).toBe(true);
    expect(!!screen.getByRole("heading", { level: 2, name: /^Data$/i })).toBe(
      true
    );
    expect(!!screen.getByRole("heading", { level: 2, name: /^Notes$/i })).toBe(
      true
    );
    expect(!!screen.getByRole("heading", { level: 2, name: /^Action$/i })).toBe(
      true
    );
  });
});
