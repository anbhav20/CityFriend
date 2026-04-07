const Chat = require("../models/chat.model");
const Message = require("../models/message.model");

// POST /api/message/send/:receiverId
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Find or create chat between the two participants
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, receiverId],
      });
    }

    // ✅ FIX: Save receiverId so unread-count queries work correctly
    const message = await Message.create({
      chatId: chat._id,
      senderId,
      receiverId, // ← was missing before; all count queries depend on this
      text: text.trim(),
    });

    // Update lastMessage reference on the chat
    chat.lastMessage = message._id;
    await chat.save();

    // Populate sender info before returning
    await message.populate("senderId", "username profilePic");

    res.status(201).json(message);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Error sending message" });
  }
};

// GET /api/message/chats  — get all chats for the logged-in user
exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "username profilePic")
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "username" },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    console.error("getChats error:", err);
    res.status(500).json({ message: "Error fetching chats" });
  }
};

// GET /api/message/:chatId  — get all messages in a chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    // Verify the user is a participant in this chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ chatId })
      .populate("senderId", "username profilePic")
      .sort({ createdAt: 1 });

    // Mark all unseen messages (sent by the other person) as seen
    await Message.updateMany(
      { chatId, senderId: { $ne: userId }, seen: false },
      { seen: true }
    );

    res.status(200).json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};