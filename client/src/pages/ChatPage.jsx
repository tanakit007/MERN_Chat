import React, { useEffect, useState } from "react";
import { Users, Send, X, MessageSquare, Image as ImageIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useLocation } from "react-router";
import api from "../service/api";
import TokenService from "../service/token.service";

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState("");
  const [sending, setSending] = useState(false);
  const location = useLocation();
  const me = TokenService.getUser();

  useEffect(() => {
    const state = location?.state;
    if (!state) return;
    if (state.user) {
      setActiveChat(state.user);
      return;
    }
    const id = state.userId;
    if (id) {
      (async () => {
        try {
          const res = await api.get("/user/sidebar");
          const found = Array.isArray(res.data)
            ? res.data.find((u) => u._id === id)
            : null;
          if (found) setActiveChat(found);
        } catch (e) {
        }
      })();
    }
  }, [location]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat?._id) {
        setMessages([]);
        return;
      }
      try {
        const res = await api.get(`/message/${activeChat._id}`);
        const data = res?.data?.data;
        setMessages(Array.isArray(data) ? data : []);
      } catch (e) {
        setMessages([]);
      }
    };
    fetchMessages();
  }, [activeChat?._id]);

  const handleSend = async () => {
    if (!activeChat) return;
    const text = newMessage.trim();
    const file = fileDataUrl?.trim() || "";
    if (!text && !file) return;
    try {
      setSending(true);
      const res = await api.post(`/message/send/${activeChat._id}`, {
        text,
        file,
      });
      const sent = res?.data?.data;
      if (sent) {
        setMessages((prev) => [...prev, sent]);
      }
      setNewMessage("");
      setFileDataUrl("");
    } catch (e) {
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full max-w-7xl mx-auto bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <div className={`${activeChat ? "hidden md:flex" : "flex"}`}>
        <Sidebar selectedUser={activeChat} onSelectUser={setActiveChat} />
      </div>

      <div
        className={`${!activeChat ? "hidden md:flex" : "flex"} flex-1 flex-col bg-white dark:bg-transparent`}
      >
        {activeChat ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ff7e5f]/10 flex items-center justify-center font-bold text-[#ff7e5f]">
                  {activeChat.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {activeChat.fullName}
                  </h3>
                  <p className="text-xs text-slate-500">Active Now</p>
                </div>
              </div>
              <button
                onClick={() => setActiveChat(null)}
                className="md:hidden p-2 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* พื้นที่ข้อความ (No Messages Yet) */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              {messages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-slate-400">
                  <div className="flex flex-col items-center">
                    <MessageSquare size={40} className="mb-2 opacity-20" />
                    <p className="text-sm">No messages yet. Start a conversation!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((m) => {
                    const isMine = (m.sender?._id || m.sender) === (me?.id || me?._id);
                    return (
                      <div
                        key={m._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        {m.file ? (
                          <img
                            src={m.file}
                            alt=""
                            className="max-w-[60%] rounded-xl object-cover"
                          />
                        ) : (
                          <div
                            className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                              isMine
                                ? "bg-[#ff7e5f] text-white"
                                : "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            <p>{m.text}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <label className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = typeof reader.result === "string" ? reader.result : "";
                        setFileDataUrl(result);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <ImageIcon size={18} className="text-slate-600 dark:text-slate-300" />
                </label>
                <input
                  type="text"
                  placeholder={`Message ${activeChat.fullName}...`}
                  className="flex-1 bg-slate-100 dark:bg-slate-900 border-none rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#ff7e5f]"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  className="p-3 bg-[#ff7e5f] text-white rounded-xl hover:bg-[#ff6b4a] transition-all shadow-lg shadow-[#ff7e5f]/20 disabled:opacity-60"
                  onClick={handleSend}
                  disabled={sending || (!newMessage.trim() && !fileDataUrl)}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen เมื่อยังไม่เลือกแชท */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
              <Users size={32} className="text-[#ff7e5f]" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Welcome to SE Chat!
            </h2>
            <p className="text-sm">
              Select a conversation from the sidebar to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
