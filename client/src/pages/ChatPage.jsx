import React, { useState, useEffect } from "react";
import { Users, Send, X, MessageSquare } from "lucide-react";
import api from "../service/api"; // ตรวจสอบว่า path ของ api.js ถูกต้อง

const ChatPage = () => {
  const [users, setUsers] = useState([]); // รายชื่อผู้ใช้จริงจาก Backend
  const [activeChat, setActiveChat] = useState(null); // เก็บ Object ของ User ที่เราเลือกแชทด้วย
  const [isLoading, setIsLoading] = useState(true);

  console.log("✅ ChatPage loaded");

  // 1. ดึงข้อมูลรายชื่อผู้ใช้คนอื่นทั้งหมด (ยกเว้นเรา)
  useEffect(() => {
    console.log("🔄 useEffect fetchUsers running");
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        console.log("📡 Fetching from /user/sidebar");
        // ยิงไปที่ /user/sidebar ตามที่ตั้งไว้ใน Server Router
        const res = await api.get("/user/sidebar");

        console.log("✅ Response:", res.data);
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        }
      } catch (error) {
        console.error("❌ Error fetching sidebar users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full max-w-7xl mx-auto bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Sidebar: รายชื่อผู้ติดต่อ */}
      <div
        className={`${activeChat ? "hidden md:flex" : "flex"} flex-col w-full md:w-72 lg:w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
            <Users size={18} />
            <h2>Contacts</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7e5f]"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-10 text-slate-500 text-sm">
              No other users found.
            </div>
          ) : (
            users.map((user) => (
              <button
                key={user._id} // ใช้ _id จาก MongoDB
                onClick={() => setActiveChat(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  activeChat?._id === user._id
                    ? "bg-slate-200 dark:bg-slate-800"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#ff7e5f]/10 flex items-center justify-center font-bold text-[#ff7e5f]">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                    {user.fullName}
                  </div>
                  <div className="text-xs text-emerald-500">Available</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area: ห้องแชท */}
      <div
        className={`${!activeChat ? "hidden md:flex" : "flex"} flex-1 flex-col bg-white dark:bg-transparent`}
      >
        {activeChat ? (
          <>
            {/* Header ห้องแชท */}
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
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare size={40} className="mb-2 opacity-20" />
              <p className="text-sm">No messages yet. Start a conversation!</p>
            </div>

            {/* Footer Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message ${activeChat.fullName}...`}
                  className="flex-1 bg-slate-100 dark:bg-slate-900 border-none rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#ff7e5f]"
                />
                <button className="p-3 bg-[#ff7e5f] text-white rounded-xl hover:bg-[#ff6b4a] transition-all shadow-lg shadow-[#ff7e5f]/20">
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
