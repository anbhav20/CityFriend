const Notification  = require("../models/notification.model");
const User          = require("../models/user.model");
const webpush       = require("web-push");
const { getIO, onlineUsers } = require("../config/socket");

// ─── VAPID (set your keys in .env) ───────────────────────────────────────────
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ─── Human-readable push copy per type ───────────────────────────────────────
function buildPushPayload(type, sender, extra = {}) {
  const name = sender?.username ?? "Someone";
  const map = {
    follow:        { title: "New Follower",   body: `${name} started following you` },
    unfollow:      { title: "Unfollowed",      body: `${name} unfollowed you` },
    like_post:     { title: "New Like",        body: `${name} liked your post` },
    like_comment:  { title: "New Like",        body: `${name} liked your comment` },
    comment:       { title: "New Comment",     body: extra.text ? `${name}: ${extra.text}` : `${name} commented on your post` },
    mention:       { title: "You were mentioned", body: `${name} mentioned you in a comment` },
    message:       { title: "New Message",     body: extra.text ? `${name}: ${extra.text}` : `${name} sent you a message` },
    profile_visit: { title: "Profile Visit",   body: `${name} visited your profile` },
  };
  return map[type] ?? { title: "New Notification", body: `${name} interacted with you` };
}

// ─── Core helper — call this from any controller (follow, like, comment …) ───
/**
 * createNotification({ recipient, sender, type, post, comment, chat, text })
 * - Saves to DB (upserts to avoid duplicates for idempotent types)
 * - Emits socket event to recipient if online
 * - Sends Web Push if recipient has a push subscription
 */
const createNotification = async ({ recipient, sender, type, post = null, comment = null, chat = null, text = "" }) => {
  // Don't notify yourself
  if (recipient.toString() === sender.toString()) return null;

  try {
    // Upsert for idempotent types; insert for chattier ones (comment, message, mention)
    const idempotentTypes = ["follow", "unfollow", "like_post", "like_comment", "profile_visit"];
    let notification;

    if (idempotentTypes.includes(type)) {
      notification = await Notification.findOneAndUpdate(
        { recipient, sender, type, post: post ?? null },
        { recipient, sender, type, post, comment, chat, text, read: false },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).populate("sender", "username profilePic");
    } else {
      notification = await Notification.create({ recipient, sender, type, post, comment, chat, text });
      notification = await notification.populate("sender", "username profilePic");
    }

    // ── Real-time socket emit ──────────────────────────────────────────
    const io = getIO();
    const recipientSocketId = onlineUsers.get(recipient.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("new_notification", notification);

      // Also send updated unread count
      const unreadCount = await Notification.countDocuments({ recipient, read: false });
      io.to(recipientSocketId).emit("notification_count", unreadCount);
    }

    // ── Web Push (background) ─────────────────────────────────────────
    const recipientUser = await User.findById(recipient).select("pushSubscription");
    if (recipientUser?.pushSubscription) {
      const senderUser = await User.findById(sender).select("username profilePic");
      const { title, body } = buildPushPayload(type, senderUser, { text });
      const payload = JSON.stringify({
        title,
        body,
        icon:  senderUser?.profilePic ?? "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        data:  {
          type,
          senderId:   sender.toString(),
          postId:     post?.toString()    ?? null,
          chatId:     chat?.toString()    ?? null,
          commentId:  comment?.toString() ?? null,
          url:        buildClickUrl(type, { sender: senderUser, post, chat }),
        },
      });
      await webpush.sendNotification(recipientUser.pushSubscription, payload).catch((err) => {
        // Subscription expired — clean it up
        if (err.statusCode === 410) {
          User.findByIdAndUpdate(recipient, { $unset: { pushSubscription: 1 } }).exec();
        }
      });
    }

    return notification;
  } catch (err) {
    // Duplicate key = already notified, safe to ignore
    if (err.code === 11000) return null;
    console.error("createNotification error:", err);
    return null;
  }
};

function buildClickUrl(type, { sender, post, chat }) {
  if (type === "message")       return `/chats?userId=${sender?._id}&username=${sender?.username}`;
  if (type === "follow")        return `/${sender?.username}`;
  if (type === "profile_visit") return `/${sender?.username}`;
  if (post)                     return `/posts/${post}`;
  return "/notifications";
}

// ─── HTTP Controllers ─────────────────────────────────────────────────────────

/** GET /api/notifications?page=1&limit=20 */
const getNotifications = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [notifications, total, unread] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "username profilePic")
        .populate("post",   "image")
        .lean(),
      Notification.countDocuments({ recipient: req.user._id }),
      Notification.countDocuments({ recipient: req.user._id, read: false }),
    ]);

    res.json({ notifications, total, unread, page, hasMore: skip + notifications.length < total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/** GET /api/notifications/count */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ count });
  } catch {
    res.status(500).json({ message: "Failed to get count" });
  }
};

/** PATCH /api/notifications/read-all */
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });

    // Push updated count (0) via socket
    const io = getIO();
    const socketId = onlineUsers.get(req.user._id.toString());
    if (socketId) io.to(socketId).emit("notification_count", 0);

    res.json({ message: "All notifications marked as read" });
  } catch {
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

/** PATCH /api/notifications/:id/read */
const markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    );
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });

    const io = getIO();
    const socketId = onlineUsers.get(req.user._id.toString());
    if (socketId) io.to(socketId).emit("notification_count", count);

    res.json({ message: "Marked as read", count });
  } catch {
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

/** DELETE /api/notifications/:id */
const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete" });
  }
};

/** DELETE /api/notifications */
const clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    const io = getIO();
    const socketId = onlineUsers.get(req.user._id.toString());
    if (socketId) io.to(socketId).emit("notification_count", 0);
    res.json({ message: "Cleared all notifications" });
  } catch {
    res.status(500).json({ message: "Failed to clear" });
  }
};

/** POST /api/notifications/subscribe — save Web Push subscription */
const subscribePush = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) return res.status(400).json({ message: "No subscription provided" });
    await User.findByIdAndUpdate(req.user._id, { pushSubscription: subscription });
    res.json({ message: "Subscribed to push notifications" });
  } catch {
    res.status(500).json({ message: "Failed to subscribe" });
  }
};

/** DELETE /api/notifications/subscribe — remove push subscription */
const unsubscribePush = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $unset: { pushSubscription: 1 } });
    res.json({ message: "Unsubscribed" });
  } catch {
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
  deleteNotification,
  clearAll,
  subscribePush,
  unsubscribePush,
};