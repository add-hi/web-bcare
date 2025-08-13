'use client'

import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  X,
  User,
  Volume2,
  Settings,
  UserPlus,
} from "lucide-react";

export default function FloatingCustomerContact() {
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");
  const [showCustomerSetup, setShowCustomerSetup] = useState(true);

  // Socket and Connection State
  const [agentId, setAgentId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [inputCustomerId, setInputCustomerId] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Call State
  const [isOnCall, setIsOnCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRemoteMicOn, setIsRemoteMicOn] = useState(true);
  const [connectionState, setConnectionState] = useState('new');
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);

  // Customer Data State
  const [customerData, setCustomerData] = useState({
    name: "No Customer Selected",
    phone: "",
    status: "offline",
  });

  // Refs
  const localAudio = useRef();
  const remoteAudio = useRef();
  const peerConnection = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  // WebRTC Configuration
  const pcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:80?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ],
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'all'
  };

  // Simulate socket connection for demo
  useEffect(() => {
    // Simulate socket connection
    const simulateConnection = () => {
      setAgentId('agent_' + Math.random().toString(36).substr(2, 9));
      setIsConnected(true);
      console.log('Simulated socket connection established');
    };

    const timer = setTimeout(simulateConnection, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Load customer data when customerId changes
  useEffect(() => {
    if (customerId) {
      // Simulate loading customer data
      const customerInfo = {
        name: `Customer ${customerId.slice(-4)}`,
        phone: `+62${Math.floor(Math.random() * 1000000000)}`,
        status: "online",
      };
      setCustomerData(customerInfo);

      // Load chat history from localStorage
      const savedMessages = localStorage.getItem(`chat_${customerId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([]);
      }

      console.log('Customer data loaded:', customerInfo);

      // Hide setup and show chat tab after customer is set
      setShowCustomerSetup(false);
      setActiveTab('chat');
    } else {
      setCustomerData({
        name: "No Customer Selected",
        phone: "",
        status: "offline",
      });
      setMessages([]);
    }
  }, [customerId]);

  // Auto-scroll chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebRTC Functions
  const createPeerConnection = (remoteId) => {
    const pc = new RTCPeerConnection(pcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate to customer');
        // In real implementation, emit via socket
        console.log('ice-candidate', { to: remoteId, candidate: event.candidate });
      } else {
        console.log('✅ ICE gathering complete');
      }
    };

    pc.ontrack = (event) => {
      console.log('🔊 Customer audio track received');
      const remoteStream = event.streams[0];
      if (remoteStream && remoteAudio.current) {
        console.log('🔊 Setting customer audio source');
        remoteAudio.current.srcObject = remoteStream;
        remoteAudio.current.play().then(() => {
          console.log('✅ Customer audio playing successfully');
        }).catch(e => {
          console.error('❌ Auto-play failed:', e.name, e.message);
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setConnectionState(pc.connectionState);
    };

    return pc;
  };

  const getLocalStream = async () => {
    try {
      console.log('🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log('🎤 Agent microphone stream obtained');
      return stream;
    } catch (error) {
      console.error('❌ Error accessing microphone:', error.name, error.message);
      alert(`Microphone error: ${error.name} - ${error.message}`);
      throw error;
    }
  };

  const startCall = async () => {
    if (!customerId) {
      alert('Please set a Customer ID first');
      return;
    }

    try {
      const stream = await getLocalStream();
      setLocalStream(stream);
      if (localAudio.current) {
        localAudio.current.srcObject = stream;
      }

      peerConnection.current = createPeerConnection(customerId);

      stream.getTracks().forEach(track => {
        console.log('🎤 Adding agent audio track');
        peerConnection.current.addTrack(track, stream);
      });

      const offer = await peerConnection.current.createOffer({
        offerToReceiveAudio: true
      });
      await peerConnection.current.setLocalDescription(offer);

      // In real implementation, emit via socket
      console.log('call-user', { offer, to: customerId });

      setIsOnCall(true);
      setActiveTab('call');

      // Simulate call acceptance after 2 seconds for demo
      setTimeout(() => {
        console.log('📞 Simulating call acceptance');
        setConnectionState('connected');
      }, 2000);
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Error accessing microphone: ' + error.message);
    }
  };

  const endCall = () => {
    console.log('📴 Ending call');

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    peerConnection.current = null;
    setLocalStream(null);
    setIsOnCall(false);
    setIsMuted(false);
    setIsRemoteMicOn(true);
    setConnectionState('new');

    if (localAudio.current) {
      localAudio.current.srcObject = null;
    }
    if (remoteAudio.current) {
      remoteAudio.current.srcObject = null;
    }
  };

  const handleEndCall = () => {
    // In real implementation, emit via socket
    console.log('end-call', { to: customerId });
    endCall();
  };

  const toggleMute = () => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);

      // In real implementation, emit via socket
      console.log('update-mic-status', { to: customerId, isMicOn: audioTrack.enabled });
    }
  };

  // Chat Functions
  const sendMessage = () => {
    if (!newMessage.trim() || !customerId) return;

    const messageData = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: 'agent',
      timestamp: new Date().toISOString(),
      time: formatTime(new Date())
    };

    // In real implementation, emit via socket
    console.log('send-message', { to: customerId, message: newMessage.trim(), timestamp: messageData.timestamp });

    // Add to local state
    const updatedMessages = [...messages, messageData];
    setMessages(updatedMessages);

    // Save to localStorage - Note: localStorage is not supported in Claude artifacts
    // In real implementation, you would use this line:
    // localStorage.setItem(`chat_${customerId}`, JSON.stringify(updatedMessages));

    setNewMessage('');
    setIsTyping(false);
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping && customerId) {
      setIsTyping(true);
      // In real implementation, emit via socket
      console.log('typing', { to: customerId, isTyping: true });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (customerId) {
        console.log('typing', { to: customerId, isTyping: false });
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSetCustomerId = () => {
    if (!inputCustomerId.trim()) {
      alert('Please enter a valid Customer ID');
      return;
    }

    setCustomerId(inputCustomerId.trim());
    setInputCustomerId('');
  };

  const handleDisconnectCustomer = () => {
    if (isOnCall) {
      handleEndCall();
    }
    setCustomerId('');
    setMessages([]);
    setShowCustomerSetup(true);
    setActiveTab('setup');
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Hidden audio elements */}
      <audio ref={localAudio} autoPlay muted />
      <audio ref={remoteAudio} autoPlay />

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
            {/* Connection Status Indicator */}
            <div
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
            />
            {/* Customer Connected Indicator */}
            {customerId && (
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
            )}
          </div>
        )}
      </div>

      {/* Popup Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">Agent Contact</h3>
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'
                  }`}
              />
            </div>
            <button
              onClick={toggleWidget}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Agent Info */}
          <div className="p-4 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">
                  Agent Portal
                </h4>
                {agentId && (
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500 font-mono">ID: {agentId}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(agentId).then(() => {
                          // Show temporary success message
                          const button = event.target;
                          const originalText = button.textContent;
                          button.textContent = '✓';
                          button.className = 'text-green-600 text-xs font-semibold';
                          setTimeout(() => {
                            button.textContent = originalText;
                            button.className = 'text-blue-600 hover:text-blue-800 text-xs font-semibold cursor-pointer';
                          }, 1000);
                        }).catch(() => {
                          alert('Failed to copy ID');
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold cursor-pointer"
                      title="Copy my ID"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
            </div>
          </div>

          {/* Customer Info */}
          {customerId && (
            <div className="p-4 bg-blue-50 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {customerData.name}
                  </h4>
                  <p className="text-xs text-gray-500">ID: {customerId.slice(0, 8)}...</p>
                </div>
                <button
                  onClick={handleDisconnectCustomer}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Disconnect Customer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex">
            {showCustomerSetup && (
              <button
                onClick={() => setActiveTab("setup")}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "setup"
                  ? "text-orange-600 border-orange-600 bg-orange-50"
                  : "text-gray-600 border-transparent bg-white hover:text-gray-800"
                  }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <Settings size={14} />
                  <span>Setup</span>
                </div>
              </button>
            )}
            <button
              onClick={() => setActiveTab("chat")}
              disabled={!customerId}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "chat"
                ? "text-orange-600 border-orange-600 bg-orange-50"
                : "text-gray-600 border-transparent bg-white hover:text-gray-800"
                } ${!customerId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("call")}
              disabled={!customerId}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "call"
                ? "text-orange-600 border-orange-600 bg-orange-50"
                : "text-gray-600 border-transparent bg-white hover:text-gray-800"
                } ${!customerId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Call
              {isOnCall && (
                <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="h-72 bg-white overflow-hidden">
            {activeTab === "setup" && (
              <div className="h-full overflow-y-auto p-4">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserPlus size={20} className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">Connect to Customer</h3>
                  <p className="text-gray-600 text-xs">
                    Enter the customer's ID to start a conversation
                  </p>
                </div>

                {/* My ID Display */}
                {agentId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-700 font-medium mb-2 text-center">Share this ID with customers:</p>
                    <div className="bg-white border rounded-md p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-gray-700 truncate mr-2">{agentId}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(agentId).then(() => {
                              // Show temporary success message
                              const button = event.target;
                              const originalText = button.textContent;
                              button.textContent = '✓';
                              button.className = 'text-green-600 text-xs font-semibold px-2 py-1 bg-green-50 rounded';
                              setTimeout(() => {
                                button.textContent = originalText;
                                button.className = 'text-blue-600 hover:text-blue-800 text-xs font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors flex-shrink-0';
                              }, 1000);
                            }).catch(() => {
                              alert('Failed to copy ID');
                            });
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors flex-shrink-0"
                          title="Copy my ID"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Customer ID"
                      value={inputCustomerId}
                      onChange={(e) => setInputCustomerId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSetCustomerId()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSetCustomerId}
                    disabled={!inputCustomerId.trim() || !isConnected}
                    className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {!isConnected ? 'Connecting...' : 'Connect to Customer'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="h-full flex flex-col">
                {/* Chat Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm flex items-center justify-center h-full">
                      Start a conversation with {customerData.name}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "agent"
                            ? "justify-end"
                            : "justify-start"
                            }`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${message.sender === "agent"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-800"
                              }`}
                          >
                            <p>{message.text}</p>
                            <p
                              className={`text-xs mt-1 ${message.sender === "agent"
                                ? "text-orange-100"
                                : "text-gray-500"
                                }`}
                            >
                              {message.time}
                            </p>
                          </div>
                        </div>
                      ))}
                      {remoteTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-200 rounded-lg px-3 py-2 text-sm">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 flex space-x-2 border-t border-gray-100">
                  <input
                    type="text"
                    placeholder={isConnected ? "Type a message..." : "Connecting..."}
                    value={newMessage}
                    onChange={handleMessageChange}
                    onKeyPress={handleKeyPress}
                    disabled={!isConnected || !customerId}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !isConnected || !customerId}
                    className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {activeTab === "call" && (
              <div className="h-full flex items-center justify-center p-6">
                {!isOnCall ? (
                  // Ready to call state
                  <div className="text-center w-full">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <User size={32} className="text-gray-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">
                      {customerData.name}
                    </h4>
                    <p className="text-gray-600 mb-2 text-sm">
                      Ready to call
                    </p>
                    <p className="text-xs text-gray-500 mb-6">
                      Customer ID: {customerId.slice(0, 8)}...
                    </p>

                    <div className="flex justify-center">
                      <button
                        onClick={startCall}
                        className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
                      >
                        <Phone size={24} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // On call state
                  <div className="text-center w-full">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <User size={32} className="text-gray-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">
                      {customerData.name}
                    </h4>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`} />
                      <p className="text-green-600 text-sm font-medium">
                        {connectionState === 'connected' ? 'On Call' : `Connecting... (${connectionState})`}
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-4 mb-6 text-xs text-gray-600">
                      <span>You: {isMuted ? '🔇' : '🎤'}</span>
                      <span>Customer: {isRemoteMicOn ? '🎤' : '🔇'}</span>
                    </div>

                    <div className="flex items-center justify-center space-x-6">
                      <button
                        onClick={toggleMute}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${isMuted
                          ? "bg-red-400 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                      >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>

                      <button
                        onClick={handleEndCall}
                        className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
                      >
                        <PhoneOff size={20} />
                      </button>

                      <button
                        onClick={() => {
                          console.log('🔊 Manual play attempt');
                          remoteAudio.current?.play().then(() => {
                            console.log('✅ Manual play successful');
                          }).catch(e => {
                            console.error('❌ Manual play failed:', e);
                          });
                        }}
                        className="w-14 h-14 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
                      >
                        <Volume2 size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}