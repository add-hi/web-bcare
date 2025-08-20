// src/__tests__/components/FloatingCustomerContact.test.js
import React from "react";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";

// sesuaikan path bila beda
import FloatingCustomerContact from "../../components/FloatingCustomerContact";

describe("FloatingCustomerContact", () => {
  let track, stream, pcInstance;

  beforeEach(() => {
    vi.useFakeTimers();

    // stub alert
    vi.spyOn(window, "alert").mockImplementation(() => {});

    // mock <audio>.play
    Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: vi.fn().mockResolvedValue(),
    });

    // mock scrollIntoView (jsdom gak punya)
    Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });

    // mock getUserMedia
    track = { enabled: true, stop: vi.fn(), kind: "audio" };
    stream = {
      getTracks: vi.fn(() => [track]),
      getAudioTracks: vi.fn(() => [track]),
    };
    global.navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue(stream),
    };

    // mock RTCPeerConnection
    pcInstance = {
      addTrack: vi.fn(),
      createOffer: vi.fn().mockResolvedValue({ sdp: "offer" }),
      setLocalDescription: vi.fn().mockResolvedValue(),
      close: vi.fn(),
      onicecandidate: null,
      ontrack: null,
      onconnectionstatechange: null,
      connectionState: "new",
    };
    global.RTCPeerConnection = vi.fn(() => pcInstance);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const openWidgetAndConnect = (customer = "ABC12345") => {
    render(<FloatingCustomerContact />);
    // buka floating button
    fireEvent.click(screen.getByRole("button"));
    // tunggu “simulated socket connection” (1s)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // isi Customer ID lalu Connect
    const input = screen.getByPlaceholderText(/Enter Customer ID/i);
    fireEvent.change(input, { target: { value: customer } });
    fireEvent.click(
      screen.getByRole("button", { name: /Connect to Customer/i })
    );
  };

  test("open → connect customer → auto ke tab Chat dengan placeholder", () => {
    openWidgetAndConnect("ABC12345");

    expect(screen.getByText(/Agent Contact/i)).toBeInTheDocument();
    expect(screen.getByText(/Start a conversation with/i)).toBeInTheDocument();

    // scope “ID:” ke header customer agar tidak bentrok dengan agent ID
    // sebelumnya:
    // const custHeader = screen.getByText(/Customer \d{4}/i).closest('div')

    const custHeaderH4 = screen.getAllByRole("heading", {
      level: 4,
      name: /Customer \d{4}/i,
    })[0];
    const custHeader = custHeaderH4.closest("div");
    expect(within(custHeader).getByText(/ID:\s*ABC12345/i)).toBeInTheDocument();
  });

  test("chat: kirim pesan → bubble muncul & input kosong", () => {
    openWidgetAndConnect("CUST9999");

    const inputMsg = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(inputMsg, { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(inputMsg).toHaveValue("");
  });

  test("call flow: start → connected → mute toggle → end", async () => {
    openWidgetAndConnect("CUST7777");

    // ke tab Call
    fireEvent.click(screen.getByRole("button", { name: "Call" }));

    // Ready to call → klik tombol hijau call
    const ready = screen.getByText(/Ready to call/i);
    const callPanel = ready.closest("div");
    const callBtn = within(callPanel).getByRole("button");
    await act(async () => {
      fireEvent.click(callBtn);
    });

    // awalnya Connecting...
    expect(screen.getByText(/Connecting/i)).toBeInTheDocument();
    // 2s → connected
    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByText(/On Call/i)).toBeInTheDocument();

    // tombol kontrol (mute, end, volume) tidak punya label → pakai selector class
    const controls = Array.from(document.querySelectorAll("button.w-14.h-14"));
    expect(controls.length).toBe(3);
    const [muteBtn, endBtn] = controls;

    // toggle mute
    fireEvent.click(muteBtn);
    expect(screen.getByText(/You:\s*🔇/)).toBeInTheDocument();
    fireEvent.click(muteBtn);
    expect(screen.getByText(/You:\s*🎤/)).toBeInTheDocument();

    // end call → kembali ke Ready to call
    fireEvent.click(endBtn);
    expect(screen.getByText(/Ready to call/i)).toBeInTheDocument();

    // resources ditutup
    expect(track.stop).toHaveBeenCalled();
    expect(pcInstance.close).toHaveBeenCalled();
  });
});
