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

export default function FloatingCustomerContact({ room, detail }) {
  // ====== Socket Configuration ======
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

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
  const [remoteAudio, setRemoteAudio] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Chat State
  const MAX_MSG = 200;
  const initialMessages = [];
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const storageKey = `msgs:${ACTIVE_ROOM}`;

  // Refs
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const callStartAt = useRef(null);

  // ====== Helpers ======
  const nowHHMM = () =>
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const pushMsg = useCallback(
    (msg) => {
      setMessages((prev) => {
        const prevArray = Array.isArray(prev) ? prev : [];
        const next = [...prevArray, msg].slice(-MAX_MSG);
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [storageKey]
  );

  // ====== Audio Streaming Functions ======
  const startLocalStream = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      streamRef.current = stream;
      // Audio stream doesn't need video element setup
      return stream;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(`Microphone error: ${error.message}`);
      throw error;
    }
  }, []);

  const stopLocalStream = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const createPeerConnection = useCallback(async () => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Handle remote audio stream
    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("webrtc:ice-candidate", {
          room: ACTIVE_ROOM,
          candidate: event.candidate,
        });
      }
    };

    // Add local audio stream
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, [ACTIVE_ROOM]);

  const createOffer = useCallback(async () => {
    const pc = await createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socketRef.current?.emit("webrtc:offer", {
      room: ACTIVE_ROOM,
      offer: offer,
    });
  }, [createPeerConnection, ACTIVE_ROOM]);

  const createAnswer = useCallback(
    async (offer) => {
      const pc = await createPeerConnection();
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current?.emit("webrtc:answer", {
        room: ACTIVE_ROOM,
        answer: answer,
      });
    },
    [createPeerConnection, ACTIVE_ROOM]
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
      // Automatically start live chat when connected
      setIsLiveChat(true);
      quickDM();
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
      setCallDuration(0);
      setTimeout(() => {
        createOffer();
      }, 1000);
    });
    sock.on("call:declined", () => {
      setCallStatus("idle");
      setShowCallUI(false);
      setRemoteAudio(null);
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
      setRemoteAudio(null);
      setCallDuration(0);
      stopLocalStream();
    });
    // WebRTC signaling
    sock.on("webrtc:offer", async ({ offer }) => {
      await createAnswer(offer);
    });

    sock.on("webrtc:answer", async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(answer);
      }
    });

    sock.on("webrtc:ice-candidate", async ({ candidate }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    });

    if (sock.connected) onConnect();

    return () => {
      try {
        sock.emit("leave", { room: ACTIVE_ROOM, userId: uid });
      } catch {}
      sock.off();
      sock.disconnect();
      stopLocalStream();
    };
  }, [SOCKET_URL, ACTIVE_ROOM, uid]);

  // Call timer effect
  useEffect(() => {
    let interval;
    if (callStatus === "in-call") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

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
      alert("Customer tidak tersedia. Pastikan ada customer yang online.");
      return;
    }
    try {
      await startLocalStream();
      sock.emit("call:invite", { room: ACTIVE_ROOM });
      setCallStatus("in-call");
      setShowCallUI(true);
      setActiveTab("call");
      callStartAt.current = Date.now();
      setCallDuration(0);
    } catch (error) {
      console.error("Failed to start microphone for call:", error);
    }
  }, [peerCount, ACTIVE_ROOM, startLocalStream]);

  const acceptCall = useCallback(async () => {
    const sock = socketRef.current;
    if (!sock) return;
    try {
      await startLocalStream();
      sock.emit("call:accept", { room: ACTIVE_ROOM });
      setCallStatus("in-call");
      setShowCallUI(true);
      callStartAt.current = Date.now();
      setCallDuration(0);
    } catch (error) {
      console.error("Failed to start audio stream:", error);
    }
  }, [ACTIVE_ROOM, startLocalStream]);

  const declineCall = useCallback(() => {
    const sock = socketRef.current;
    if (!sock) return;
    sock.emit("call:decline", { room: ACTIVE_ROOM });
    setCallStatus("idle");
    setShowCallUI(false);
    stopLocalStream();
  }, [ACTIVE_ROOM, stopLocalStream]);

  const hangupCall = useCallback(() => {
    const sock = socketRef.current;
    if (!sock) return;
    sock.emit("call:hangup", { room: ACTIVE_ROOM });
    stopLocalStream();
    setCallStatus("idle");
    setShowCallUI(false);
    setRemoteAudio(null);
    setCallDuration(0);
  }, [ACTIVE_ROOM, stopLocalStream]);

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
    setRemoteAudio(null);
    setShowCallUI(false);
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
      {/* Hidden audio element for remote audio */}
      <audio ref={remoteAudioRef} autoPlay style={{ display: "none" }} />

      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <div className="relative group">
            <button
              onClick={toggleWidget}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl group-hover:animate-pulse"
            >
              <MessageCircle size={24} className="drop-shadow-sm" />
            </button>

            {/* Connection Status Indicator */}
            <div className="absolute -top-1 -right-1">
              <div
                className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                  connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                }`}
              />
            </div>

            {/* Live Chat Indicator */}
            {isLiveChat && (
              <div className="absolute -bottom-1 -left-1">
                <div className="w-3 h-3 bg-amber-400 rounded-full border-2 border-white shadow-sm animate-bounce" />
              </div>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Contact Customer
                <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popup Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Customer Contact</h3>
                  <div className="flex items-center space-x-2 text-xs opacity-90">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        connected
                          ? "bg-emerald-300 animate-pulse"
                          : "bg-red-300"
                      }`}
                    />
                    <span>{connected ? "Online" : "Offline"}</span>
                    {isLiveChat && <span>• {peerCount} active</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {isLiveChat && (
                  <>
                    <button
                      onClick={quickDM}
                      className="text-white hover:text-orange-200 p-1.5 rounded-full hover:bg-white/20 transition-all duration-200"
                      title="Connect to customer"
                    >
                      <Users size={14} />
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-white hover:text-red-200 p-1.5 rounded-full hover:bg-white/20 transition-all duration-200"
                      title="End session"
                    >
                      <LogOut size={14} />
                    </button>
                  </>
                )}
                <button
                  onClick={toggleWidget}
                  className="text-white hover:text-gray-200 p-1.5 rounded-full hover:bg-white/20 transition-all duration-200"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-50 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 relative ${
                activeTab === "chat"
                  ? "text-orange-600 bg-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <MessageCircle size={16} />
                <span>Chat</span>
                {isLiveChat && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                )}
              </div>
              {activeTab === "chat" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("call")}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-200 relative ${
                activeTab === "call"
                  ? "text-orange-600 bg-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Phone size={16} />
                <span>Call</span>
                {callStatus !== "idle" && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              {activeTab === "call" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="h-96 bg-white overflow-hidden">
            {activeTab === "chat" && (
              <div className="h-full flex flex-col">
                {/* Chat Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {!isLiveChat ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-4">
                        <MessageCircle size={24} className="text-orange-500" />
                      </div>
                      <p className="text-gray-500 text-sm mb-2">
                        Agent Chat Panel
                      </p>
                      <p className="text-gray-400 text-xs">
                        {connected ? "Ready to chat with customers" : "Connecting..."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex animate-in slide-in-from-bottom-2 duration-300 ${
                            !message.isBot ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`px-4 py-2 rounded-2xl text-sm shadow-sm max-w-xs ${
                              !message.isBot
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-md"
                                : "bg-gray-100 text-gray-800 rounded-bl-md border border-gray-200"
                            } ${
                              message.isCallLog
                                ? "bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 border border-emerald-200"
                                : ""
                            }`}
                          >
                            <p className="leading-relaxed">{message.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                !message.isBot
                                  ? "text-white/70"
                                  : "text-gray-500"
                              }`}
                            >
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
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder={
                        isLiveChat
                          ? "Type your message..."
                          : "Start chat to send messages"
                      }
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      disabled={!isLiveChat}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() || !isLiveChat}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full transition-all duration-200 text-sm font-medium disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "call" && (
              <div className="h-full flex flex-col">
                {/* Audio Call Area */}
                <div className="flex-1 p-8 pt-12 pb-12 overflow-hidden">
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* Avatar */}
                    <div className="relative mb-6 mt-8">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                          callStatus === "in-call"
                            ? "bg-gradient-to-br from-emerald-400 to-emerald-600 animate-pulse"
                            : callStatus === "ringing"
                            ? "bg-gradient-to-br from-amber-400 to-orange-500 animate-bounce"
                            : "bg-gradient-to-br from-gray-200 to-gray-400"
                        }`}
                      >
                        <User size={28} className="text-white drop-shadow-sm" />
                      </div>

                      {/* Call Status Ring */}
                      {callStatus !== "idle" && (
                        <div
                          className={`absolute inset-0 rounded-full border-4 ${
                            callStatus === "in-call"
                              ? "border-emerald-300"
                              : "border-amber-300"
                          } animate-ping`}
                        ></div>
                      )}
                    </div>

                    {/* Status Text */}
                    <div className="text-center mb-4">
                      {callStatus !== "idle" ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full animate-pulse ${
                                callStatus === "in-call"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            <p className="text-lg font-semibold text-gray-800">
                              {callStatus === "in-call"
                                ? "Call Active"
                                : callStatus === "ringing"
                                ? "Calling Customer"
                                : "Connecting..."}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {callStatus === "in-call"
                              ? "Voice call in progress"
                              : callStatus === "ringing"
                              ? "Waiting for customer to answer"
                              : "Please wait..."}
                          </p>
                          {callStatus === "in-call" && (
                            <div className="text-2xl font-mono text-gray-700 mt-2">
                              {String(Math.floor(callDuration / 60)).padStart(
                                2,
                                "0"
                              )}
                              :{String(callDuration % 60).padStart(2, "0")}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-lg font-medium text-gray-700">
                            Voice Call Ready
                          </p>
                          {peerCount < 2 && (
                            <div className="flex items-center justify-center space-x-2 mt-3">
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                              <p className="text-xs text-gray-400">
                                Waiting for customer to connect...
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Call Controls */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-6">
                    {callStatus === "idle" ? (
                      <button
                        onClick={placeCall}
                        disabled={peerCount < 2}
                        className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed"
                        title={
                          peerCount < 2
                            ? "Waiting for customer..."
                            : "Call Customer"
                        }
                      >
                        <Phone size={20} />
                      </button>
                    ) : callStatus === "ringing" ? (
                      <button
                        onClick={hangupCall}
                        className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                        title="Cancel Call"
                      >
                        <PhoneOff size={20} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${
                            isMuted
                              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                              : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                          } text-white`}
                          title={
                            isMuted ? "Unmute Microphone" : "Mute Microphone"
                          }
                        >
                          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <button
                          onClick={hangupCall}
                          className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                          title="End Call"
                        >
                          <PhoneOff size={20} />
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
