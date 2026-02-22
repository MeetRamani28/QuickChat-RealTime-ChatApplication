/* eslint-disable no-unused-vars */
import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Axios default base URL
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);

  /* ===============================
     Check current logged-in user
  =============================== */
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/users/me");

      if (data.success) {
        setAuthUser(data.user);
      } else {
        setAuthUser(null);
      }
    } catch (error) {
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Setup Axios Authorization Header
  =============================== */
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuth();
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setAuthUser(null);
      setLoading(false);
    }
  }, [token]);

  /* ===============================
     Initialize Socket.IO
  =============================== */
  useEffect(() => {
    if (!authUser) return;

    socketRef.current = io(backendUrl, {
      transports: ["websocket"],
    });

    // Join user to socket
    socketRef.current.emit("join", authUser._id);

    // Listen for online users
    socketRef.current.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // Listen for incoming messages
    socketRef.current.on("receiveMessage", (message) => {
      console.log("📩 New message received:", message);
      // You can later push this into chat state in ChatContainer
    });

    // Cleanup socket on unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, [authUser]);

  /* ===============================
     Login and store token
  =============================== */
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    toast.success("Login successful");
  };

  /* ===============================
     Logout and clear state
  =============================== */
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    socketRef.current?.disconnect();
    toast.success("Logged out");
  };

  const value = {
    axios,
    authUser,
    setAuthUser,
    token,
    login,
    logout,
    onlineUsers,
    socket: socketRef,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
