const express = require("express");
const sendMessageRoute = express.Router();
const Message = require("../models/message.model"); // ← was missing, caused crash
const {
  sendMessage,
  getChats,
  getMessages,
} = require("../controllers/messageController");
const { authenticate } = require("../middlewares/authMiddleware");

// ⚠️  IMPORTANT: /unread-count MUST be declared before /:chatId
// otherwise Express matches "unread-count" as a chatId param
sendMessageRoute.get("/unread-count", authenticate, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      seen: false,
    });
    res.json({ count });
  } catch (err) {
    console.error("unread-count error:", err);
    res.status(500).json({ message: "Error fetching unread count" });
  }
});

sendMessageRoute.post("/send/:receiverId", authenticate, sendMessage);
sendMessageRoute.get("/chats",             authenticate, getChats);
sendMessageRoute.get("/:chatId",           authenticate, getMessages);

module.exports = sendMessageRoute;