"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MessageCircle,
  Phone,
  PhoneOff,
  X,
  User,
  Mic,
  MicOff,
  Users,
  LogOut,
} from "lucide-react";
import io from "socket.io-client";

export default function FloatingCustomerContact({ room = "general", detail }) {
  // ====== Socket Configuration ======
  const SOCKET_URL = "https://bcare.my.id";

  // console.log(`CUS-${detail.ids.customerId}`);

  // Generate consistent UID per browser
  const uid = useMemo(() => {
    if (typeof window === "undefined") return "guest";
    try {
      const raw = localStorage.getItem("auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        const userId = parsed?.state?.user?.id;
        if (userId != null) {
          const gen = `EMP-${userId}`;
          localStorage.setItem("chat:uid", gen);
          return gen;
        }
      }
      const existing = localStorage.getItem("chat:uid");
      if (existing) return existing;
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

  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  // Socket and Connection State
  const [connected, setConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(1);
  const [activePeers, setActivePeers] = useState([]);
  const [isLiveChat, setIsLiveChat] = useState(false);

  // Call State
  const [callStatus, setCallStatus] = useState("idle");
  const [showCallUI, setShowCallUI] = useState(false);
  const [remoteFrame, setRemoteFrame] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Chat State
  const MAX_MSG = 200;
  // const initialMessages = [
  //   {
  //     id: 1,
  //     text: "Halo! Saya BNI Assistant. Saya siap membantu Anda dengan keluhan atau masalah perbankan. Bisa ceritakan masalah yang Anda alami?",
  //     isBot: true,
  //     timestamp: "10:30",
  //   },
  // ];
  const [messages, setMessages] = useState();
  const [inputText, setInputText] = useState("");
  const storageKey = `msgs:${ACTIVE_ROOM}`;

  // Refs
  const localVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const frameTimer = useRef(null);
  const callStartAt = useRef(null);
  const FPS = 1.5;

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

  // ====== Video Streaming Functions ======
  const startLocalStream = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    try {
      console.log("Requesting camera access...");

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: false,
      });
      console.log("Camera access granted");
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play();
        console.log("Video element ready");
      }
      return stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(`Camera error: ${error.message}`);
      throw error;
    }
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
    console.log("Starting frame streaming...");
    const sendFrame = () => {
      const video = localVideoRef.current;
      const canvas = canvasRef.current;
      const sock = socketRef.current;
      if (!video || !canvas || !sock) {
        console.log("Missing elements:", {
          video: !!video,
          canvas: !!canvas,
          sock: !!sock,
        });
        return;
      }
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.log("Video not ready yet");
        return;
      }
      const w = video.videoWidth;
      const h = video.videoHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
      const base64 = dataUrl.split(",")[1];
      sock.emit("call:frame", { room: ACTIVE_ROOM, data: base64 });
      console.log("Frame sent, size:", w, "x", h);
    };
    frameTimer.current = setInterval(sendFrame, 1000 / FPS);
  }, [ACTIVE_ROOM]);

  const stopStreamingFrames = useCallback(() => {
    if (frameTimer.current) {
      clearInterval(frameTimer.current);
      frameTimer.current = null;
    }
  }, []);

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
    sock.on("dm:request", ({ room }) => {
      setDmRoom(room);
      sock.emit("dm:join", { room });
      sock.emit("presence:get", { room });
      setIsLiveChat(true);
      pushMsg({
        id: `sys_${Date.now()}`,
        text: `Live chat diminta oleh ${detail.ids.customerId}.`,
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
      setTimeout(() => {
        startStreamingFrames();
      }, 1000);
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
  }, [SOCKET_URL, ACTIVE_ROOM, uid]);

  // Load chat history per room
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
  }, [storageKey]);

  // Auto-scroll chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    const target = `CUS-${detail.ids.customerId}`;
    if (!target) {
      alert("Peer tidak tersedia. Buka tab lain (user berbeda) untuk testing.");
      return;
    }
    sock.emit("dm:open", { toUserId: target });
  }, []);

  const placeCall = useCallback(async () => {
    const sock = socketRef.current;
    if (!sock) return;
    if (peerCount < 2) {
      alert("Agent tidak tersedia. Pastikan ada 2 user yang online.");
      return;
    }
    try {
      await startLocalStream();
      sock.emit("call:invite", { room: ACTIVE_ROOM });
      setCallStatus("ringing");
      setShowCallUI(true);
      setActiveTab("call");
      setTimeout(() => {
        startStreamingFrames();
      }, 1000);
    } catch (error) {
      console.error("Failed to start camera for call:", error);
    }
  }, [peerCount, ACTIVE_ROOM, startLocalStream, startStreamingFrames]);

  const acceptCall = useCallback(async () => {
    const sock = socketRef.current;
    if (!sock) return;
    try {
      await startLocalStream();
      sock.emit("call:accept", { room: ACTIVE_ROOM });
      setCallStatus("in-call");
      setShowCallUI(true);
      callStartAt.current = Date.now();
      setTimeout(() => {
        startStreamingFrames();
      }, 1000);
    } catch (error) {
      console.error("Failed to start video stream:", error);
    }
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
    quickDM();
  };

  const clearAll = () => {
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

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Hidden media elements */}
      <video ref={localVideoRef} autoPlay muted style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <div className="relative">
            <button
              onClick={toggleWidget}
              className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
            >
              <MessageCircle size={24} />
            </button>
            <div
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {isLiveChat && (
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white" />
            )}
          </div>
        )}
      </div>

      {/* Popup Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-orange-500 text-white p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-sm">Chat Agent</h3>
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-green-300" : "bg-red-300"
                }`}
              />
              {isLiveChat && (
                <span className="text-xs opacity-90">• {peerCount} peers</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {!isLiveChat ? (
                <button
                  onClick={startLiveChat}
                  className="text-white hover:text-green-200 text-xs px-2 py-1 rounded border border-white/30 hover:bg-white/10"
                  title="Start chat"
                >
                  Start
                </button>
              ) : (
                <>
                  <button
                    onClick={quickDM}
                    className="text-white hover:text-blue-200 text-xs px-1.5 py-1 rounded border border-white/30 hover:bg-white/10"
                    title="Pair DM"
                  >
                    <Users size={12} />
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-white hover:text-red-200 text-xs px-1.5 py-1 rounded border border-white/30 hover:bg-white/10"
                    title="End chat"
                  >
                    <LogOut size={12} />
                  </button>
                </>
              )}
              <button
                onClick={toggleWidget}
                className="text-white hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "chat"
                  ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Chat{" "}
              {isLiveChat && (
                <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("call")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "call"
                  ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Call{" "}
              {callStatus !== "idle" && (
                <span className="ml-1 w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="h-72 bg-white overflow-hidden">
            {activeTab === "chat" && (
              <div className="h-full flex flex-col">
                {/* Chat Messages Area */}
                <div className="flex-1 p-3 overflow-y-auto">
                  {!isLiveChat ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      Click "Start" to begin live chat
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            !message.isBot ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              !message.isBot
                                ? "bg-orange-500 text-white rounded-br-sm"
                                : "bg-gray-100 text-gray-800 rounded-bl-sm"
                            } ${
                              message.isCallLog
                                ? "bg-blue-100 text-blue-800"
                                : ""
                            }`}
                          >
                            <p className="leading-relaxed">{message.text}</p>
                            <p className={`text-xs mt-1 opacity-70`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder={
                        isLiveChat ? "Type message..." : "Chat not active"
                      }
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      disabled={!isLiveChat}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-gray-50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() || !isLiveChat}
                      className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors text-sm disabled:bg-gray-300"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "call" && (
              <div className="h-full flex flex-col">
                {/* Video Area */}
                <div className="flex-1 p-3 overflow-hidden">
                  {remoteFrame ? (
                    <div className="w-full h-full">
                      <img
                        src={`data:image/jpeg;base64,${remoteFrame}`}
                        alt="Remote video"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-3 shadow-inner">
                        <User size={24} className="text-gray-600" />
                      </div>

                      {callStatus !== "idle" ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full animate-pulse ${
                              callStatus === "in-call"
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          />
                          <p className="text-sm font-medium text-gray-700">
                            {callStatus === "in-call"
                              ? "On Call"
                              : callStatus === "ringing"
                              ? "Ringing..."
                              : "Connecting..."}
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500 mb-2">
                            Ready to call
                          </p>
                          {peerCount < 2 && (
                            <p className="text-xs text-gray-400 text-center">
                              Waiting for peer to connect...
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Call Controls - Fixed at bottom */}
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-center space-x-4">
                    {callStatus === "idle" ? (
                      <button
                        onClick={placeCall}
                        disabled={peerCount < 2}
                        className="w-12 h-12 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                        title={
                          peerCount < 2 ? "Waiting for peer..." : "Start Call"
                        }
                      >
                        <Phone size={18} />
                      </button>
                    ) : callStatus === "ringing" ? (
                      <>
                        <button
                          onClick={acceptCall}
                          className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                          title="Accept Call"
                        >
                          <Phone size={18} />
                        </button>
                        <button
                          onClick={declineCall}
                          className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                          title="Decline Call"
                        >
                          <PhoneOff size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className={`w-10 h-10 ${
                            isMuted
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-gray-500 hover:bg-gray-600"
                          } text-white rounded-full flex items-center justify-center transition-colors shadow-lg`}
                          title={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                        </button>
                        <button
                          onClick={hangupCall}
                          className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                          title="End Call"
                        >
                          <PhoneOff size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

