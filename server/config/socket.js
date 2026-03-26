const { Server } = require("socket.io");
const Message      = require("../models/message.model");
const Notification = require("../models/notification.model");

const onlineUsers = new Map(); // userId -> socketId

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        process.env.CLIENT_URL,
      ].filter(Boolean),
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // ── User comes online ──────────────────────────────────────────────
    socket.on("join", async (userId) => {
      for (const [uid] of onlineUsers) {
        if (uid === userId) onlineUsers.delete(uid);
      }
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log(`✅ ${userId} joined (socket: ${socket.id})`);

      // Send initial counts on connect so badges are instant
      try {
        const [notifCount, totalMsgCount] = await Promise.all([
          Notification.countDocuments({ recipient: userId, read: false }),
          Message.countDocuments({ receiverId: userId, seen: false }),
        ]);
        socket.emit("notification_count", notifCount);
        socket.emit("message_count", totalMsgCount);

        // Per-chat unread counts so chat list badges populate on reconnect
        const mongoose = require("mongoose");
        const perChatCounts = await Message.aggregate([
          {
            $match: {
              receiverId: mongoose.Types.ObjectId.createFromHexString(userId),
              seen: false,
            },
          },
          { $group: { _id: "$chatId", count: { $sum: 1 } } },
        ]);
        perChatCounts.forEach(({ _id, count }) => {
          socket.emit("message_count_per_chat", { chatId: _id.toString(), count });
        });
      } catch { /* non-fatal */ }
    });

    // ── Message delivery ───────────────────────────────────────────────
    socket.on("send_message", async (message) => {
      const receiverSocketId = onlineUsers.get(message.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);

        try {
          // Update total unread count for receiver
          const totalCount = await Message.countDocuments({
            receiverId: message.receiverId,
            seen: false,
          });
          io.to(receiverSocketId).emit("message_count", totalCount);

          // Update per-chat count for this specific chat
          const chatCount = await Message.countDocuments({
            chatId:     message.chatId,
            receiverId: message.receiverId,
            seen:       false,
          });
          io.to(receiverSocketId).emit("message_count_per_chat", {
            chatId: message.chatId,
            count:  chatCount,
          });
        } catch { /* non-fatal */ }
      }
    });

    // ── Mark messages read — only fires when user opens a specific chat ─
    socket.on("messages_read", async ({ chatId }) => {
      if (!socket.userId) return;
      try {
        await Message.updateMany(
          { chatId, receiverId: socket.userId, seen: false },
          { seen: true }
        );
        const totalCount = await Message.countDocuments({
          receiverId: socket.userId,
          seen: false,
        });
        socket.emit("message_count", totalCount);
        socket.emit("message_count_per_chat", { chatId, count: 0 });
      } catch { /* non-fatal */ }
    });

    // ── Typing indicators ──────────────────────────────────────────────
    socket.on("typing", ({ receiverId, chatId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { chatId, senderId: socket.userId });
      }
    });

    socket.on("stop_typing", ({ receiverId, chatId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stop_typing", { chatId });
      }
    });

    // ── Disconnect ─────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
        console.log(`❌ ${socket.userId} disconnected`);
      }
    });
  });

  return io;
};

async function getUnreadMessageCount(userId) {
  return Message.countDocuments({ receiverId: userId, seen: false });
}

const emitNotificationCount = async (userId) => {
  if (!io) return;
  const socketId = onlineUsers.get(userId.toString());
  if (!socketId) return;
  try {
    const count = await Notification.countDocuments({ recipient: userId, read: false });
    io.to(socketId).emit("notification_count", count);
  } catch { }
};

const emitMessageCount = async (userId) => {
  if (!io) return;
  const socketId = onlineUsers.get(userId.toString());
  if (!socketId) return;
  try {
    const count = await getUnreadMessageCount(userId);
    io.to(socketId).emit("message_count", count);
  } catch { }
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initSocket, getIO, onlineUsers, emitNotificationCount, emitMessageCount };