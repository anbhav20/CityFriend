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
      // Remove any stale entry for this user before adding fresh one
      for (const [uid] of onlineUsers) {
        if (uid === userId) onlineUsers.delete(uid);
      }
      onlineUsers.set(userId, socket.id);
      socket.userId = userId; // ✅ store as string (matches JWT { id: ... })

      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log(`✅ ${userId} joined (socket: ${socket.id})`);

      // Send initial counts immediately on connect so badges are correct
      try {
        const mongoose = require("mongoose");
        const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId);

        const [notifCount, totalMsgCount] = await Promise.all([
          // ✅ FIXED: userId is a string from JWT { id: ... }, convert to ObjectId
          Notification.countDocuments({ recipient: userObjectId, read: false }),
          Message.countDocuments({ receiverId: userObjectId, seen: false }),
        ]);

        socket.emit("notification_count", notifCount);
        socket.emit("message_count", totalMsgCount);

        // Per-chat unread counts so chat list badges populate on reconnect
        const perChatCounts = await Message.aggregate([
          {
            $match: {
              receiverId: userObjectId,
              seen: false,
            },
          },
          { $group: { _id: "$chatId", count: { $sum: 1 } } },
        ]);

        perChatCounts.forEach(({ _id, count }) => {
          socket.emit("message_count_per_chat", { chatId: _id.toString(), count });
        });
      } catch (err) {
        console.error("join count error:", err);
      }
    });

    // ── Message delivery ───────────────────────────────────────────────
    socket.on("send_message", async (message) => {
      const receiverSocketId = onlineUsers.get(message.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);

        try {
          const mongoose = require("mongoose");
          const receiverObjectId = mongoose.Types.ObjectId.createFromHexString(message.receiverId);

          const totalCount = await Message.countDocuments({
            receiverId: receiverObjectId,
            seen: false,
          });
          io.to(receiverSocketId).emit("message_count", totalCount);

          const chatCount = await Message.countDocuments({
            chatId:     message.chatId,
            receiverId: receiverObjectId,
            seen:       false,
          });
          io.to(receiverSocketId).emit("message_count_per_chat", {
            chatId: message.chatId,
            count:  chatCount,
          });
        } catch (err) {
          console.error("send_message count error:", err);
        }
      }
    });

    // ── Mark messages read ─────────────────────────────────────────────
    socket.on("messages_read", async ({ chatId }) => {
      if (!socket.userId) return;
      try {
        const mongoose = require("mongoose");
        const userObjectId = mongoose.Types.ObjectId.createFromHexString(socket.userId);

        await Message.updateMany(
          { chatId, receiverId: userObjectId, seen: false },
          { seen: true }
        );

        const totalCount = await Message.countDocuments({
          receiverId: userObjectId,
          seen: false,
        });
        socket.emit("message_count", totalCount);
        socket.emit("message_count_per_chat", { chatId, count: 0 });
      } catch (err) {
        console.error("messages_read error:", err);
      }
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
  const mongoose = require("mongoose");
  const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId.toString());
  return Message.countDocuments({ receiverId: userObjectId, seen: false });
}

const emitNotificationCount = async (userId) => {
  if (!io) return;
  const socketId = onlineUsers.get(userId.toString());
  if (!socketId) return;
  try {
    const mongoose = require("mongoose");
    const userObjectId = mongoose.Types.ObjectId.createFromHexString(userId.toString());
    const count = await Notification.countDocuments({ recipient: userObjectId, read: false });
    io.to(socketId).emit("notification_count", count);
  } catch (err) {
    console.error("emitNotificationCount error:", err);
  }
};

const emitMessageCount = async (userId) => {
  if (!io) return;
  const socketId = onlineUsers.get(userId.toString());
  if (!socketId) return;
  try {
    const count = await getUnreadMessageCount(userId);
    io.to(socketId).emit("message_count", count);
  } catch (err) {
    console.error("emitMessageCount error:", err);
  }
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initSocket, getIO, onlineUsers, emitNotificationCount, emitMessageCount };