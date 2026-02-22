import express from "express";
const app = express();
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";

app.use(cors());
app.use(express.json({ limit: "4mb" }));

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("QuickChat Backend is up and running! ✨");
});

export default app;
