"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import io from "socket.io-client";

/**
 * LiveChatWeb.jsx
 * Web client yang kompatibel dengan server Express (index.js) & alur chat.tsx
 * Props:
 *  - room?: string        // default "general"
 */
export default function LiveChatWeb({ room = "general" }) {
  // ====== Konfigurasi Socket ======
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

  // generate / ambil UID konsisten per browser
  const uid = useMemo(() => {
    if (typeof window === "undefined") return "guest";
    try {
      // Ambil dari localStorage auth
      const raw = localStorage.getItem("auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        const userId = parsed?.state?.user?.id; // <= id dari localStorage
        if (userId != null) {
          const gen = `EMP-${userId}`;
          // simpan agar konsisten di sesi berikutnya
          localStorage.setItem("chat:uid", gen);
          return gen;
        }
      }

      // Fallback: pakai uid yang pernah disimpan
      const existing = localStorage.getItem("chat:uid");
      if (existing) return existing;

      // Fallback terakhir: guest acak
      const gen = `guest_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem("chat:uid", gen);
      return gen;
    } catch (e) {
      return "guest";
    }
  }, []);

  const fallbackCallRoom = `call:${room}`;
  const [dmRoom, setDmRoom] = useState(null);
  const ACTIVE_ROOM = useMemo(
    () => dmRoom || fallbackCallRoom,
    [dmRoom, fallbackCallRoom]
  );

  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(1);
  const [activePeers, setActivePeers] = useState([]);
  const [isLiveChat, setIsLiveChat] = useState(false);

  // ====== State Chat ======
  const MAX_MSG = 200;
  const initialMessages = [
    {
      id: 1,
      text: "Halo! Saya BNI Assistant. Saya siap membantu Anda dengan keluhan atau masalah perbankan. Bisa ceritakan masalah yang Anda alami?",
      isBot: true,
      timestamp: "10:30",
    },
    {
      id: 2,
      text: "Halo, saya mengalami masalah dengan kartu ATM saya",
      isBot: false,
      timestamp: "10:31",
    },
    {
      id: 3,
      text: "Baik, saya akan membantu Anda dengan masalah kartu ATM. Bisa dijelaskan lebih detail masalah apa yang Anda alami?",
      isBot: true,
      timestamp: "10:31",
    },
    {
      id: 4,
      text: "Kartu ATM saya tertelan di mesin ATM BNI Thamrin",
      isBot: false,
      timestamp: "10:32",
    },
    {
      id: 5,
      text: "Saya mengerti situasinya. Apakah Anda ingin saya buatkan tiket complaint untuk masalah ini?",
      isBot: true,
      timestamp: "10:32",
      hasButtons: true,
    },
  ];
  const [messages, setMessages] = useState(initialMessages);
  const storageKey = `msgs:${ACTIVE_ROOM}`;

  // ====== Call / Frame Streaming ======
  const [callStatus, setCallStatus] = useState("idle"); // idle | ringing | in-call
  const [remoteFrame, setRemoteFrame] = useState(null);
  const [showCallUI, setShowCallUI] = useState(false);
  const localVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameTimer = useRef(null);
  const FPS = 1.5;
  const callStartAt = useRef(null);

  const startLocalStream = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    streamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  }, []);

  const stopLocalStream = useCallback(() => {
    if (frameTimer.current) {
      clearInterval(frameTimer.current);
      frameTimer.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startStreamingFrames = useCallback(() => {
    if (frameTimer.current) return;
    const sendFrame = () => {
      const video = localVideoRef.current;
      const canvas = canvasRef.current;
      const sock = socketRef.current;
      if (!video || !canvas || !sock) return;
      const w = video.videoWidth || 320;
      const h = video.videoHeight || 240;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.6); // "data:image/jpeg;base64,...."
      const base64 = dataUrl.split(",")[1];
      sock.emit("call:frame", { room: ACTIVE_ROOM, data: base64 });
    };
    frameTimer.current = setInterval(sendFrame, 1000 / FPS);
  }, [ACTIVE_ROOM]);

  const stopStreamingFrames = useCallback(() => {
    if (frameTimer.current) {
      clearInterval(frameTimer.current);
      frameTimer.current = null;
    }
  }, []);

  // ====== Input ======
  const [inputText, setInputText] = useState("");

  // ====== Helpers ======
  const nowHHMM = () =>
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const pushMsg = useCallback(
    (msg) => {
      setMessages((prev) => {
        const next = [...prev, msg].slice(-MAX_MSG);
        try {
          const pure = next.filter(
            (m) => !initialMessages.find((im) => im.id === m.id)
          );
          localStorage.setItem(storageKey, JSON.stringify(pure));
        } catch {}
        return next;
      });
    },
    [storageKey]
  );

  // ====== Socket lifecycle ======
  useEffect(() => {
    const sock = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = sock;

    const onConnect = () => {
      setConnected(true);
      sock.emit("auth:register", { userId: uid });
      sock.emit("join", { room: ACTIVE_ROOM, userId: uid });
      sock.emit("presence:get", { room: ACTIVE_ROOM });
    };
    const onDisconnect = () => {
      setConnected(false);
    };

    sock.on("connect", onConnect);
    sock.on("disconnect", onDisconnect);

    // DM / Presence
    sock.on("dm:pending", ({ room }) => {
      setDmRoom(room);
      sock.emit("presence:get", { room });
    });
    sock.on("dm:request", ({ room, fromUserId }) => {
      setDmRoom(room);
      sock.emit("dm:join", { room });
      sock.emit("presence:get", { room });
      setIsLiveChat(true);
      // Info ringan
      pushMsg({
        id: `sys_${Date.now()}`,
        text: `Live chat diminta oleh ${fromUserId}.`,
        isBot: true,
        timestamp: nowHHMM(),
      });
    });
    sock.on("dm:ready", ({ room }) => {
      sock.emit("presence:get", { room });
      setIsLiveChat(true);
    });
    sock.on("presence:list", ({ room, peers }) => {
      if (room !== ACTIVE_ROOM) return;
      setActivePeers(peers || []);
      setPeerCount((peers || []).length || 1);
    });

    // Chat
    sock.on("chat:new", (msg) => {
      if (msg?.room !== ACTIVE_ROOM) return;
      if (!msg?.text) return;
      pushMsg({
        id: String(msg._id || msg.id || Date.now()),
        text: msg.text,
        isBot: msg.author?.id !== uid,
        timestamp: nowHHMM(),
      });
    });

    // Call
    sock.on("call:ringing", () => {
      setCallStatus("ringing");
      setShowCallUI(true);
    });
    sock.on("call:accepted", async () => {
      setCallStatus("in-call");
      setShowCallUI(true);
      callStartAt.current = Date.now();
      await startLocalStream();
      startStreamingFrames();
    });
    sock.on("call:declined", () => {
      setCallStatus("idle");
      setShowCallUI(false);
      setRemoteFrame(null);
      stopStreamingFrames();
      stopLocalStream();
    });
    sock.on("call:ended", () => {
      if (callStartAt.current) {
        const dur = Math.floor((Date.now() - callStartAt.current) / 1000);
        const mm = String(Math.floor(dur / 60)).padStart(2, "0");
        const ss = String(dur % 60).padStart(2, "0");
        pushMsg({
          id: `call_${Date.now()}`,
          text: `📞 Panggilan selesai • Durasi: ${mm}:${ss}`,
          isBot: true,
          timestamp: nowHHMM(),
          isCallLog: true,
        });
      }
      callStartAt.current = null;
      setCallStatus("idle");
      setShowCallUI(false);
      setRemoteFrame(null);
      stopStreamingFrames();
      stopLocalStream();
    });
    sock.on("call:frame", ({ data }) => setRemoteFrame(data));

    if (sock.connected) onConnect();

    return () => {
      try {
        sock.emit("leave", { room: ACTIVE_ROOM, userId: uid });
      } catch {}
      sock.off();
      sock.disconnect();
      stopStreamingFrames();
      stopLocalStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SOCKET_URL, ACTIVE_ROOM, uid]);

  // Load riwayat per room
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const uniq = Array.from(new Map(parsed.map((m) => [m.id, m])).values());
      const merged = [
        ...initialMessages,
        ...uniq.filter((m) => !initialMessages.find((im) => im.id === m.id)),
      ];
      setMessages(merged);
    } catch {
      setMessages(initialMessages);
    }
  }, [storageKey]); // ganti room → ganti key

  // ====== Actions ======
  const handleSend = useCallback(() => {
    const sock = socketRef.current;
    if (!sock || !isLiveChat) return;
    const trimmed = (inputText || "").trim();
    if (!trimmed) return;
    const now = Date.now();
    const outgoing = {
      id: `m_${now}`,
      text: trimmed,
      isBot: false,
      timestamp: nowHHMM(),
      author: { id: String(uid), firstName: "You" },
      createdAt: now,
      type: "text",
      room: ACTIVE_ROOM,
    };
    pushMsg(outgoing);
    sock.emit("chat:send", outgoing);
    setInputText("");
  }, [inputText, isLiveChat, ACTIVE_ROOM, pushMsg, uid]);

  const quickDM = useCallback(() => {
    const sock = socketRef.current;
    if (!sock) return;
    // const target = activePeers.find((p) => p.userId && p.userId.startsWith());
    //
    const target = "CUS-3";
    console.log("ini isi target");
    console.log(target);
    if (!target) {
      alert("Peer tidak tersedia. Buka tab lain (user berbeda) untuk testing.");
      return;
    }
    sock.emit("dm:open", { toUserId: target.userId });
  }, [activePeers, uid]);

  const placeCall = useCallback(() => {
    const sock = socketRef.current;
    if (!sock) return;
    if (peerCount < 2) {
      alert("Agent tidak tersedia. Pastikan ada 2 user yang online.");
      return;
    }
    sock.emit("call:invite", { room: ACTIVE_ROOM });
    setCallStatus("ringing");
    setShowCallUI(true);
  }, [peerCount, ACTIVE_ROOM]);

  const acceptCall = useCallback(async () => {
    const sock = socketRef.current;
    if (!sock) return;
    await startLocalStream();
    sock.emit("call:accept", { room: ACTIVE_ROOM });
    setCallStatus("in-call");
    setShowCallUI(true);
    callStartAt.current = Date.now();
    startStreamingFrames();
  }, [ACTIVE_ROOM, startLocalStream, startStreamingFrames]);

  const declineCall = useCallback(() => {
    const sock = socketRef.current;
    if (!sock) return;
    sock.emit("call:decline", { room: ACTIVE_ROOM });
    setCallStatus("idle");
    setShowCallUI(false);
    stopStreamingFrames();
    stopLocalStream();
  }, [ACTIVE_ROOM, stopLocalStream, stopStreamingFrames]);

  const hangupCall = useCallback(() => {
    const sock = socketRef.current;
    if (!sock) return;
    sock.emit("call:hangup", { room: ACTIVE_ROOM });
    stopStreamingFrames();
    stopLocalStream();
    setCallStatus("idle");
    setShowCallUI(false);
    setRemoteFrame(null);
  }, [ACTIVE_ROOM, stopLocalStream, stopStreamingFrames]);

  const startLiveChat = () => {
    setIsLiveChat(true);
    pushMsg({
      id: `sys_${Date.now()}`,
      text: "Anda telah terhubung dengan live chat. Silakan mulai percakapan.",
      isBot: true,
      timestamp: nowHHMM(),
    });
    quickDM(); // langsung coba DM agar pindah ke room DM bila peer ada
  };

  const clearAll = () => {
    // reset semua state & storage
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith("msgs:")
      );
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {}
    setMessages([...initialMessages]);
    setIsLiveChat(false);
    setDmRoom(null);
    setActivePeers([]);
    setPeerCount(1);
    setCallStatus("idle");
    setRemoteFrame(null);
    setShowCallUI(false);
    stopStreamingFrames();
    stopLocalStream();

    // putus & sambung ulang socket
    const sock = socketRef.current;
    if (sock?.connected) {
      try {
        sock.emit("leave", { room: ACTIVE_ROOM, userId: uid });
      } catch {}
      sock.disconnect();
    }
    setTimeout(() => {
      const newSock = io(SOCKET_URL, { transports: ["websocket", "polling"] });
      socketRef.current = newSock;
    }, 400);
  };

  // ====== UI ======
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={styles.dot(connected ? "#4CAF50" : "#ccc")} />
          <b>Chat Agent</b>
          {isLiveChat && (
            <span style={{ fontSize: 12, color: "#4CAF50" }}>
              • Live Chat Aktif • Peers: {peerCount}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isLiveChat && (
            <button
              style={styles.ghostDanger}
              onClick={clearAll}
              title="Akhiri chat"
            >
              Akhiri
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        {!isLiveChat ? (
          <button style={styles.primary} onClick={startLiveChat}>
            Mulai Live Chat
          </button>
        ) : (
          <>
            <button style={styles.success} onClick={placeCall}>
              Panggil (Mock)
            </button>
            <button style={styles.info} onClick={quickDM}>
              Minta DM (Pair)
            </button>
          </>
        )}
      </div>

      {/* Messages */}
      <div style={styles.chatArea}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: m.isBot ? "flex-start" : "flex-end",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(m.isBot ? styles.botBubble : styles.meBubble),
              }}
            >
              <div>{m.text}</div>
              <div style={styles.time}>{m.timestamp}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isLiveChat ? "Ketik pesan Anda..." : "Live chat tidak aktif"
          }
          disabled={!isLiveChat}
          rows={2}
          style={styles.textarea}
        />
        <button
          style={isLiveChat ? styles.send : styles.sendDisabled}
          onClick={handleSend}
          disabled={!isLiveChat}
        >
          Kirim
        </button>
      </div>

      {/* Call UI */}
      {showCallUI && (
        <div style={styles.callOverlay}>
          <div style={styles.callBox}>
            <h3 style={{ margin: 0, marginBottom: 8 }}>
              {callStatus === "ringing"
                ? "Panggilan Berdering..."
                : "Dalam Panggilan"}
            </h3>
            <div style={styles.videoRow}>
              <div style={styles.videoPane}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={styles.video}
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <div style={styles.videoLabel}>Kamera Anda</div>
              </div>
              <div style={styles.videoPane}>
                {remoteFrame ? (
                  <img
                    alt="Remote"
                    src={`data:image/jpeg;base64,${remoteFrame}`}
                    style={styles.video}
                  />
                ) : (
                  <div style={styles.videoPlaceholder}>
                    Menunggu frame lawan…
                  </div>
                )}
                <div style={styles.videoLabel}>Agent</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              {callStatus === "ringing" ? (
                <>
                  <button style={styles.success} onClick={acceptCall}>
                    Terima
                  </button>
                  <button style={styles.ghostDanger} onClick={declineCall}>
                    Tolak
                  </button>
                </>
              ) : (
                <button style={styles.danger} onClick={hangupCall}>
                  Akhiri
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== Styles sederhana (tanpa Tailwind agar plug-n-play) ====== */
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "min(90vh, 800px)",
    maxWidth: 860,
    margin: "16px auto",
    border: "1px solid #eaeaea",
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
  },
  dot: (c) => ({
    width: 8,
    height: 8,
    borderRadius: 99,
    background: c,
    display: "inline-block",
  }),
  actions: {
    padding: "8px 12px",
    display: "flex",
    gap: 8,
    borderBottom: "1px solid #f3f3f3",
  },
  chatArea: {
    flex: 1,
    padding: 12,
    overflowY: "auto",
    background: "#fff",
  },
  bubble: {
    maxWidth: "76%",
    padding: "10px 12px",
    borderRadius: 14,
    margin: "6px 0",
    fontSize: 14,
    lineHeight: 1.4,
    whiteSpace: "pre-wrap",
  },
  botBubble: {
    background: "#FFF3EB",
    borderBottomLeftRadius: 4,
  },
  meBubble: {
    background: "#FF8636",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  time: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 4,
    textAlign: "right",
  },
  inputRow: {
    padding: 12,
    display: "flex",
    gap: 8,
    borderTop: "1px solid #eee",
    background: "#fff",
  },
  textarea: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    resize: "none",
    background: "#f8fafc",
    fontSize: 14,
  },
  send: {
    padding: "8px 14px",
    borderRadius: 10,
    background: "#FF8636",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  sendDisabled: {
    padding: "8px 14px",
    borderRadius: 10,
    background: "#e5e7eb",
    color: "#999",
    border: "none",
  },
  primary: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  success: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    background: "#16a34a",
    color: "#fff",
    cursor: "pointer",
  },
  info: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    background: "#0ea5e9",
    color: "#fff",
    cursor: "pointer",
  },
  danger: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
  },
  ghostDanger: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #fecaca",
    background: "#fff",
    color: "#ef4444",
    cursor: "pointer",
  },
  callOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  callBox: {
    width: 720,
    maxWidth: "100%",
    background: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  videoRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 8,
  },
  videoPane: {
    position: "relative",
    background: "#111",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 240,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  videoPlaceholder: {
    color: "#bbb",
    fontSize: 13,
  },
  videoLabel: {
    position: "absolute",
    left: 10,
    bottom: 8,
    color: "#fff",
    fontSize: 12,
    opacity: 0.85,
    background: "rgba(0,0,0,0.35)",
    padding: "2px 6px",
    borderRadius: 6,
  },
};
