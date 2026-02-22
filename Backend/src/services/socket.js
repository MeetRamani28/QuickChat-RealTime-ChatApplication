// src/services/socket.js
import { Server } from "socket.io";

// Socket.IO instance
let io;

// Map to track online users: userId => socketId
const onlineUsers = new Map();

/**
 * Initialize Socket.IO server
 * @param {http.Server} server - The HTTP server instance
 * @returns {Server} io - The Socket.IO server instance
 */
export const initSocket = (server) => {
  if (io) return io; // Prevent multiple initializations

  io = new Server(server, {
    cors: {
      origin: "*", // Replace with your frontend origin in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // When a user joins, map their userId to their socketId
    socket.on("join", (userId) => {
      if (!userId) return;
      onlineUsers.set(userId.toString(), socket.id);
      io.emit("getOnlineUsers", [...onlineUsers.keys()]);
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      for (let [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("getOnlineUsers", [...onlineUsers.keys()]);
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

/**
 * Get initialized Socket.IO instance
 * @returns {Server} io
 */
export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.io not initialized! Call initSocket(server) first."
    );
  }
  return io;
};

export { onlineUsers };
