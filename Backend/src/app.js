import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("QuickChat Backend is up and running! ✨");
});

export default app;
