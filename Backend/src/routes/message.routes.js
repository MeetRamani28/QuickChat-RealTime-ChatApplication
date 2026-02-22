import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  sendMessage,
  getConversation,
  markAsSeen,
  deleteMessage,
  getAllUsers,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protect, getAllUsers);

router.post("/:receiverId", protect, sendMessage);
router.get("/:userId", protect, getConversation);
router.put("/seen/:userId", protect, markAsSeen);
router.delete("/:messageId", protect, deleteMessage);

export default router;
