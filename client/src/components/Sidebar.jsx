import React, { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import api from "../service/api";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ selectedUser, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const onlineUsers = useAuthStore((s) => s.onlineUsers);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/user/sidebar");
        if (mounted && Array.isArray(res.data)) {
          setUsers(res.data);
        }
      } catch (e) {
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!showOnlineOnly) return users;
    return users.filter((u) => onlineUsers.includes(u._id));
  }, [users, showOnlineOnly, onlineUsers]);

  return (
    <div className="flex flex-col w-72 lg:w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
          <Users size={18} />
          <h2>Contacts</h2>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-sm rounded-full border-slate-600 bg-transparent"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
          />
          <span>
            Show online only{" "}
            <span className="ml-1 text-slate-400">
              ({onlineUsers.length} online)
            </span>
          </span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7e5f]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-10 text-slate-500 text-sm">
            No users found.
          </div>
        ) : (
          filtered.map((user) => (
            <button
              key={user._id}
              onClick={() => {
                if (onSelectUser) {
                  onSelectUser(user);
                } else {
                  navigate("/chat", { state: { user, userId: user._id } });
                }
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                selectedUser?._id === user._id
                  ? "bg-slate-200 dark:bg-slate-800"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#ff7e5f]/10 flex items-center justify-center font-bold text-[#ff7e5f]">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
                {onlineUsers.includes(user._id) && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-50 dark:ring-slate-900"></span>
                )}
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                  {user.fullName}
                </div>
                <div
                  className={`text-xs ${
                    onlineUsers.includes(user._id)
                      ? "text-emerald-500"
                      : "text-slate-500"
                  }`}
                >
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;

