import { create } from "zustand";
import api from "../service/api";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import TokenService from "../service/token.service";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isRegister: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  register: async (data) => {
    set({ isRegister: true });
    try {
      const response = await api.post("/user/register", data);
      set({ authUser: response.data });
      get().connectSocket();
      toast.success("Registration successful!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!");
      set({ authUser: null });
      throw error;
    } finally {
      set({ isRegister: false });
    }
  },
  logIn: async (data) => {
    set({ isLoggingIn: true });
    try {
      const response = await api.post("/user/login", data);
      set({ authUser: response.data });
      get().connectSocket();
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error.response.data.message || "Login failed!");
      set({ authUser: null });
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logOut: async () => {
    try {
      const response = await api.post("/user/logout");
      set({ authUser: null });
      get().disconnectSocket();
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response.data.message || "Logout failed!");
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const response = await api.put("/user/update-profile", data);
      toast.success(response.data.message || "Profile updated");

      // Refresh auth user from server to get updated fields
      try {
        const check = await api.get("/user/check-auth");
        set({ authUser: check.data });
      } catch (e) {
        console.error("Failed to refresh auth after profile update", e);
      }

      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed!");
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  checkAuth: async () => {
    try {
      const response = await api.get("/user/check-auth");
      set({ authUser: response.data });
      get().connectSocket();
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  connectSocket: (user) => {
    const { authUser, socket } = get();
    const baseUser = authUser || user || TokenService.getUser();
    if (!baseUser || socket?.connected) return;
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const newSocket = io(socketUrl, {
      query: {
        userId: baseUser._id || baseUser.id,
      },
    });
    newSocket.connect();
    set({ socket: newSocket, authUser: authUser || baseUser });
    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
    }
  },
}));
