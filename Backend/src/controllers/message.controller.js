import cloudinary from "../config/cloudnairy.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getIO, onlineUsers } from "../services/socket.js";

/* =================================
   Get All Users Except Logged In
   GET /api/messages/users
================================= */
export const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    // Fetch all users except the logged-in user
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    );

    // Attach unread message count for each user
    const usersWithUnread = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await Message.countDocuments({
          sender: user._id,
          receiver: loggedInUserId,
          seen: false,
        });

        return {
          ...user.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithUnread.length,
      users: usersWithUnread,
    });
  } catch (error) {
    console.error("GetAllUsers Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =================================
   Send Message
   POST /api/messages/:receiverId
================================= */
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { receiverId } = req.params;
    const senderId = req.user.id;

    // Validate receiver
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res
        .status(404)
        .json({ success: false, message: "Receiver not found" });
    }

    // Upload image to Cloudinary if provided
    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "quickchat_messages",
      });
      imageUrl = uploadResponse.secure_url;
    }

    // Ensure at least text or image exists
    if (!text?.trim() && !imageUrl) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Message must contain text or image",
        });
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text: text || "",
      image: imageUrl,
    });

    // Emit socket event if receiver is online
    const io = getIO();
    const receiverSocketId = onlineUsers.get(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", message);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("SendMessage Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =================================
   Get Conversation Between 2 Users
   GET /api/messages/:userId
================================= */
export const getConversation = async (req, res) => {
  try {
    const myId = req.user.id;
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("GetConversation Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =================================
   Mark Messages As Seen
   PUT /api/messages/seen/:userId
================================= */
export const markAsSeen = async (req, res) => {
  try {
    const myId = req.user.id;
    const { userId } = req.params;

    await Message.updateMany(
      { sender: userId, receiver: myId, seen: false },
      { $set: { seen: true } }
    );

    const io = getIO();
    const senderSocketId = onlineUsers.get(userId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { seenBy: myId });
    }

    res.status(200).json({ success: true, message: "Messages marked as seen" });
  } catch (error) {
    console.error("MarkAsSeen Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =================================
   Delete Message
   DELETE /api/messages/:messageId
================================= */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== myId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this message",
        });
    }

    await message.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("DeleteMessage Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
