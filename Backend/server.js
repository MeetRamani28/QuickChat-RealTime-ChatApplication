// server.js
import http from "http";
import dotenv from "dotenv";
import app from "./src/app.js";
import { connectToDB } from "./src/config/database.connection.js";
import { initSocket } from "./src/services/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDB();
    console.log("✅ Database connected successfully");

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    initSocket(server);
    console.log("✅ Socket.IO initialized");

    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // Handle server errors
    server.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
