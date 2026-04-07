const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: [
        "follow",
        "unfollow",
        "like_post",
        "like_comment",
        "comment",
        "mention",
        "message",
        "profile_visit",
      ],
      required: true,
    },
    post:    { type: mongoose.Schema.Types.ObjectId, ref: "Post",    default: null },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    chat:    { type: mongoose.Schema.Types.ObjectId, ref: "Chat",    default: null },
    text:    { type: String, default: "" },
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ PRIMARY index — speeds up getNotifications (the query causing timeouts)
// covers: find({ recipient }) + sort({ createdAt: -1 })
notificationSchema.index({ recipient: 1, createdAt: -1 });

// ✅ Speeds up unread count queries: countDocuments({ recipient, read: false })
notificationSchema.index({ recipient: 1, read: 1 });

// ✅ Prevents duplicate idempotent notifications (follow, like, etc.)
notificationSchema.index(
  { recipient: 1, sender: 1, type: 1, post: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      type: { $in: ["follow", "like_post", "like_comment", "profile_visit"] }
    }
  }
);

module.exports = mongoose.model("Notification", notificationSchema);