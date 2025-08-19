// src/__tests__/components/Attachment.test.js
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Komponen yang diuji
import Attachment from "@/components/Attachment";

// ---- Helper: data palsu dari server ----
const API_BASE_URL = "http://34.121.13.94:3001/api";
const serverFiles = [
  {
    filename: "photo.jpg",
    size: 2048, // 2 KB
    uploadDate: "2025-08-10T12:00:00Z",
    category: "general",
    path: "/files/general/photo.jpg",
  },
  {
    filename: "report.pdf",
    size: 10240, // 10 KB
    uploadDate: "2025-08-05T09:30:00Z",
    category: "finance",
    path: "/files/finance/report.pdf",
  },
];

// ---- Mock: URL.createObjectURL/revoke (dipakai saat download) ----
beforeEach(() => {
  vi.spyOn(global, "fetch").mockImplementation(async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    const method = (init.method || "GET").toUpperCase();

    // GET: loadDocuments
    if (url === `${API_BASE_URL}/files` && method === "GET") {
      return {
        ok: true,
        json: async () => ({ success: true, data: serverFiles }),
      };
    }

    // POST: upload
    if (url === `${API_BASE_URL}/upload` && method === "POST") {
      // balikan skema data yang diharapkan komponen saat upload sukses
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: "u-1",
            originalName: "new-image.png",
            size: 4096,
            uploadDate: "2025-08-18T10:00:00Z",
            uploadedBy: "Current User",
            category: "general",
            mimetype: "image/png",
            filename: "new-image.png",
            description: "Uploaded file: new-image.png",
          },
        }),
      };
    }

    // GET: download (url file)
    if (url.startsWith(`${API_BASE_URL}/files/`) && method === "GET") {
      return {
        ok: true,
        blob: async () =>
          new Blob(["dummy-bytes"], { type: "application/octet-stream" }),
      };
    }

    // default fallback
    return { ok: false, json: async () => ({ success: false }) };
  });

  // Stub URL blob methods
  // Polyfill +/or spy: blob URL methods (jsdom kadang nggak punya)
  if (!("createObjectURL" in URL)) {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(() => "blob:fake"),
    });
  } else {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:fake");
  }

  if (!("revokeObjectURL" in URL)) {
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
  } else {
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Attachment – skenario utama", () => {
  it("memuat data awal & menampilkan 2 baris dokumen; search & type filter bekerja", async () => {
    render(<Attachment />);

    // tunggu nama file muncul
    const rowPhoto = await screen.findByText("photo.jpg");
    const rowPdf = await screen.findByText("report.pdf");
    expect(!!rowPhoto).toBe(true);
    expect(!!rowPdf).toBe(true);

    // cek jumlah baris di tbody = 2
    const rows = screen.getAllByRole("row");
    // rows[0] adalah header <tr>, sisanya data
    const dataRows = rows.slice(1);
    expect(dataRows.length).toBe(2);

    // ---- Search: ketik 'report' → cuma pdf yang tersisa ----
    const search = screen.getByPlaceholderText(/Search documents/i);
    await userEvent.type(search, "report");

    // sekarang "photo.jpg" harus hilang, "report.pdf" masih ada
    expect(screen.queryByText("photo.jpg") === null).toBe(true);
    expect(!!screen.getByText("report.pdf")).toBe(true);

    // bersihkan search
    await userEvent.clear(search);

    // ---- Type Filter: pilih Images → hanya image yang tersisa ----
    const typeSelect = screen.getByRole("combobox");
    await userEvent.selectOptions(typeSelect, "image");

    // hanya photo.jpg tersisa
    expect(!!screen.getByText("photo.jpg")).toBe(true);
    expect(screen.queryByText("report.pdf") === null).toBe(true);
  });

  it("preview image: tombol Eye membuka modal, Zoom In ubah scale pada <img>, Close menutup", async () => {
    render(<Attachment />);

    // tunggu data
    await screen.findByText("photo.jpg");

    // pilih view semua tipe biar aman
    const typeSelect = screen.getByRole("combobox");
    await userEvent.selectOptions(typeSelect, "all");

    // klik Eye (title="Preview") pada baris photo.jpg
    // ambil baris yang mengandung text 'photo.jpg' lalu cari button preview di dalamnya
    const row = screen.getByText("photo.jpg").closest("tr");
    const previewBtn = within(row).getByRole("button", { name: /Preview/i });
    await userEvent.click(previewBtn);

    // dalam modal preview, <img alt="photo.jpg"> harus ada
    const img = await screen.findByAltText("photo.jpg");
    expect(!!img).toBe(true);

    // Zoom In → style transform harus mengandung scale(1.25)
    const zoomInBtn = screen.getByRole("button", { name: /Zoom In/i });
    await userEvent.click(zoomInBtn);

    const styleAfterZoom = img.getAttribute("style") || "";
    // cari 'scale(1.25)' di style
    expect(styleAfterZoom.includes("scale(1.25)")).toBe(true);

    // tutup modal
    const closeBtn = screen.getByRole("button", { name: /Close/i });
    await userEvent.click(closeBtn);

    // pastikan modal hilang (img tidak ada)
    expect(screen.queryByAltText("photo.jpg") === null).toBe(true);
  });

  it("download: klik tombol Download pada baris memicu fetch & tampil notifikasi berhasil", async () => {
    render(<Attachment />);

    await screen.findByText("report.pdf");

    const pdfRow = screen.getByText("report.pdf").closest("tr");
    const downloadBtn = within(pdfRow).getByRole("button", {
      name: /Download/i,
    });
    await userEvent.click(downloadBtn);

    // fetch dipanggil untuk URL file
    const expectedUrl = `${API_BASE_URL}/files/finance/report.pdf`;
    const calledWithFile = global.fetch.mock.calls.some(
      ([url]) => (typeof url === "string" ? url : url.url) === expectedUrl
    );
    expect(calledWithFile).toBe(true);

    // notifikasi "berhasil didownload!" muncul
    const notif = await screen.findByText(/berhasil didownload/i);
    expect(!!notif).toBe(true);
  });

  it('upload: memilih file memicu POST /upload, baris baru muncul dan ada notifikasi "berhasil diupload"', async () => {
    render(<Attachment />);

    // Pastikan data awal sudah tampil
    await screen.findByText("photo.jpg");

    // Ambil input file (hidden) langsung dari DOM
    const fileInput = document.querySelector('input[type="file"]');
    expect(!!fileInput).toBe(true);

    // Upload file baru
    const newFile = new File(["content"], "new-image.png", {
      type: "image/png",
    });
    await userEvent.upload(fileInput, newFile);

    // Notifikasi sukses upload muncul
    const notif = await screen.findByText(/berhasil diupload/i);
    expect(!!notif).toBe(true);

    // Baris baru dengan nama file harus muncul
    const newRow = await screen.findByText("new-image.png");
    expect(!!newRow).toBe(true);
  });
});
