'use client'

import React, { useState } from "react";
import {
  MessageCircle,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  X,
  User,
} from "lucide-react";

export default function FloatingCustomerContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isOnCall, setIsOnCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // ===========================================
  // TODO: REMOVE ALL DUMMY MESSAGE CODE BELOW WHEN BACKEND IS READY
  // ===========================================

  // DUMMY: Initialize with sample messages - REPLACE WITH REAL CHAT HISTORY
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello, I need help with my BNI account please",
      sender: "customer",
      time: "10:30 AM",
    }, // DUMMY MESSAGE
  ]);
  const [newMessage, setNewMessage] = useState("");

  // ===========================================
  // TODO: REMOVE DUMMY DATA WHEN BACKEND IS READY
  // ===========================================

  // Sample customer data - REPLACE WITH REAL API DATA
  const customerData = {
    name: "Joko Santoso",
    phone: "081234567890",
    status: "online",
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const startCall = () => {
    setIsOnCall(true);
    setActiveTab("call");
  };

  const endCall = () => {
    setIsOnCall(false);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // ===========================================
  // TODO: REPLACE WITH REAL MESSAGE SENDING FUNCTION
  // ===========================================
  const sendMessage = () => {
    if (newMessage.trim()) {
      // TODO: Replace with real API call to send message
      const message = {
        id: messages.length + 1,
        text: newMessage,
        sender: "agent",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, message]);
      setNewMessage("");

      // ===========================================
      // TODO: REMOVE DUMMY AUTO-REPLY CODE BELOW
      // ===========================================

      // DUMMY: Simulate customer reply after 2 seconds - REMOVE THIS ENTIRE BLOCK
      setTimeout(() => {
        const replies = [
          // DUMMY CUSTOMER REPLIES - REMOVE
          "Hi, I need help with my account balance",
          "Can you help me with a transaction issue?",
          "I'm having trouble logging into my mobile banking",
          "There's an unauthorized charge on my statement",
          "Can you explain this fee on my account?",
          "I need to update my contact information",
          "My card was declined, can you check why?",
          "I want to apply for a loan",
          "How do I transfer money to another bank?",
          "I lost my debit card, please help me block it",
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const customerReply = {
          id: messages.length + 2,
          text: randomReply,
          sender: "customer",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, customerReply]);
      }, 2000); // DUMMY TIMEOUT - REMOVE

      // ===========================================
      // END OF DUMMY AUTO-REPLY CODE TO REMOVE
      // ===========================================
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // ===========================================
  // END OF DUMMY CODE SECTION
  // ===========================================

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={toggleWidget}
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          >
            <MessageCircle size={24} />
          </button>
        )}
      </div>

      {/* Popup Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
            <h3 className="font-semibold">Customer Contact</h3>
            <button
              onClick={toggleWidget}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Customer Info */}
          <div className="p-4 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <User size={20} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {customerData.name}
                </h4>
                <p className="text-sm text-gray-600">{customerData.phone}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "chat"
                  ? "text-orange-600 border-orange-600 bg-orange-50"
                  : "text-gray-600 border-transparent bg-white hover:text-gray-800"
                }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("call")}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "call"
                  ? "text-orange-600 border-orange-600 bg-orange-50"
                  : "text-gray-600 border-transparent bg-white hover:text-gray-800"
                }`}
            >
              Call
            </button>
          </div>

          {/* Tab Content */}
          <div className="h-72 bg-white">
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
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 flex space-x-2 border-t border-gray-100">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors text-sm font-medium"
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
                    <p className="text-gray-600 mb-8 text-sm">Ready to call</p>

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
                    <p className="text-green-600 mb-8 text-sm font-medium">
                      On Call
                    </p>

                    <div className="flex items-center justify-center space-x-6">
                      <button
                        onClick={toggleMute}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${isMuted
                            ? "bg-gray-400 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                      >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>

                      <button
                        onClick={endCall}
                        className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
                      >
                        <PhoneOff size={20} />
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
