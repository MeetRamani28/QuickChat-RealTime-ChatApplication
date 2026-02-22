import cloudinary from "../config/cloudnairy.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io, onlineUsers } from "../../server.js";

/* =================================
   Get All Users Except Logged In
   GET /api/messages/users
================================= */
export const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    // Get all users except logged in
    const users = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    // Attach unread count to each user
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    let imageUrl = "";

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "quickchat_messages",
      });

      imageUrl = uploadResponse.secure_url;
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
      image: imageUrl,
    });

    const recieverSocketId = onlineUsers.get(receiverId);

    if (recieverSocketId) {
      io.to(recieverSocketId).emit("receiveMessage", message);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
      {
        sender: userId,
        receiver: myId,
        seen: false,
      },
      { $set: { seen: true } }
    );

    const senderSocketId = onlineUsers.get(userId);

    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", {
        seenBy: myId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Messages marked as seen",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =================================
   Delete Message (Optional)
================================= */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender can delete
    if (message.sender.toString() !== myId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
