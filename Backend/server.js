import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import app from "./src/app.js";
import { connectToDB } from "./src/config/database.connection.js";

dotenv.config();
await connectToDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

/* ================================
   Socket.IO Setup
================================ */
export const io = new Server(server, {
  cors: {
    origin: "*", // production ma frontend URL mukvu
    methods: ["GET", "POST"],
  },
});

export const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("User joined:", userId);
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);

    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
