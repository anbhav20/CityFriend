const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const mongoose = require("mongoose");
const Message = require("../models/message.model");
const Notification = require("../models/notification.model");

const SOCKET_SECRET = `${process.env.JWT_SECRET_KEY}:socket`;

// Legacy map so other files importing it keep working: userId -> most recent socketId.
// New code should use emitToUser(), which reaches EVERY device the user has open.
const onlineUsers = new Map();

let io;

const room = (userId) => `user:${userId}`;
const toObjectId = (id) => mongoose.Types.ObjectId.createFromHexString(String(id));
const isObjectIdString = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);
const isOnline = (userId) => (io?.sockets.adapter.rooms.get(room(userId))?.size ?? 0) > 0;

// ── Handshake auth: identity comes from a verified token, never from the client ──
const authenticateSocket = (socket, next) => {
  try {
    const socketToken = socket.handshake.auth?.token; // from GET /api/auth/socket-token
    if (socketToken) {
      const d = jwt.verify(socketToken, SOCKET_SECRET, { algorithms: ["HS256"] });
      socket.userId = String(d.id);
      return next();
    }

    // fallback: the httpOnly access cookie (only arrives if cookies reach the socket host)
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    if (!cookies.token) return next(new Error("unauthorized"));
    const d = jwt.verify(cookies.token, process.env.JWT_SECRET_KEY, { algorithms: ["HS256"] });
    socket.userId = String(d.id);
    return next();
  } catch {
    return next(new Error("unauthorized"));
  }
};

const sendInitialCounts = async (socket) => {
  try {
    const userObjectId = toObjectId(socket.userId);

    const [notifCount, totalMsgCount, perChatCounts] = await Promise.all([
      Notification.countDocuments({ recipient: userObjectId, read: false }),
      Message.countDocuments({ receiverId: userObjectId, seen: false }),
      Message.aggregate([
        { $match: { receiverId: userObjectId, seen: false } },
        { $group: { _id: "$chatId", count: { $sum: 1 } } },
      ]),
    ]);

    socket.emit("notification_count", notifCount);
    socket.emit("message_count", totalMsgCount);
    perChatCounts.forEach(({ _id, count }) => {
      socket.emit("message_count_per_chat", { chatId: String(_id), count });
    });
  } catch (err) {
    console.error("join count error:", err);
  }
};

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", process.env.CLIENT_URL].filter(Boolean),
      credentials: true,
    },
    maxHttpBufferSize: 1e5, // 100 KB per event is plenty for chat metadata
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.userId;

    // every device/tab of this user joins the same room
    socket.join(room(userId));
    const wasOnline = onlineUsers.has(userId);
    onlineUsers.set(userId, socket.id);

    socket.emit("online_users", [...onlineUsers.keys()]);
    if (!wasOnline) io.emit("online_users", [...onlineUsers.keys()]);

    // The client still emits "join" after connecting. The payload is IGNORED now:
    // identity is socket.userId from the verified handshake.
    socket.on("join", () => sendInitialCounts(socket));

    // ── Message delivery ────────────────────────────────────────────────
    // Don't relay what the client sent. Load the saved message from the DB and
    // make sure THIS user is its sender, so nobody can forge messages.
    socket.on("send_message", async (payload) => {
      try {
        if (!isObjectIdString(payload?._id)) return;

        const msg = await Message.findById(payload._id).lean();
        // NOTE: change "senderId" if your Message schema names the sender field differently
        if (!msg || String(msg.senderId) !== userId) return;

        const receiverId = String(msg.receiverId);
        io.to(room(receiverId)).emit("receive_message", msg);

        const receiverObjectId = toObjectId(receiverId);
        const [totalCount, chatCount] = await Promise.all([
          Message.countDocuments({ receiverId: receiverObjectId, seen: false }),
          Message.countDocuments({ chatId: msg.chatId, receiverId: receiverObjectId, seen: false }),
        ]);
        io.to(room(receiverId)).emit("message_count", totalCount);
        io.to(room(receiverId)).emit("message_count_per_chat", { chatId: String(msg.chatId), count: chatCount });
      } catch (err) {
        console.error("send_message error:", err);
      }
    });

    // ── Mark messages read ──────────────────────────────────────────────
    socket.on("messages_read", async ({ chatId } = {}) => {
      if (!isObjectIdString(chatId)) return;
      try {
        const userObjectId = toObjectId(userId);
        await Message.updateMany({ chatId, receiverId: userObjectId, seen: false }, { seen: true });

        const totalCount = await Message.countDocuments({ receiverId: userObjectId, seen: false });
        // update all of this user's devices, not just this one
        io.to(room(userId)).emit("message_count", totalCount);
        io.to(room(userId)).emit("message_count_per_chat", { chatId, count: 0 });
      } catch (err) {
        console.error("messages_read error:", err);
      }
    });

    // ── Typing indicators ───────────────────────────────────────────────
    socket.on("typing", ({ receiverId, chatId } = {}) => {
      if (!isObjectIdString(receiverId)) return;
      io.to(room(receiverId)).emit("typing", { chatId, senderId: userId });
    });

    socket.on("stop_typing", ({ receiverId, chatId } = {}) => {
      if (!isObjectIdString(receiverId)) return;
      io.to(room(receiverId)).emit("stop_typing", { chatId });
    });

    // ── Disconnect ──────────────────────────────────────────────────────
    // Only go "offline" when the user's LAST socket closes (old code marked them
    // offline as soon as any one tab closed).
    socket.on("disconnect", () => {
      const remaining = io.sockets.adapter.rooms.get(room(userId));
      if (remaining && remaining.size > 0) {
        onlineUsers.set(userId, [...remaining][remaining.size - 1]);
      } else {
        onlineUsers.delete(userId);
        io.emit("online_users", [...onlineUsers.keys()]);
      }
    });
  });

  return io;
};

// ── Helpers used by controllers ───────────────────────────────────────────
const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(room(userId)).emit(event, payload);
};

const emitNotificationCount = async (userId) => {
  if (!io || !isOnline(userId)) return;
  try {
    const count = await Notification.countDocuments({ recipient: toObjectId(userId), read: false });
    emitToUser(userId, "notification_count", count);
  } catch (err) {
    console.error("emitNotificationCount error:", err);
  }
};

const emitMessageCount = async (userId) => {
  if (!io || !isOnline(userId)) return;
  try {
    const count = await Message.countDocuments({ receiverId: toObjectId(userId), seen: false });
    emitToUser(userId, "message_count", count);
  } catch (err) {
    console.error("emitMessageCount error:", err);
  }
};

module.exports = { initSocket, getIO, onlineUsers, emitToUser, emitNotificationCount, emitMessageCount };