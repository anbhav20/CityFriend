const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
    // Optional references — populate only what's relevant per type
    post:    { type: mongoose.Schema.Types.ObjectId, ref: "Post",    default: null },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    chat:    { type: mongoose.Schema.Types.ObjectId, ref: "Chat",    default: null },
    // Short text snippet shown in the notification (e.g. comment body preview)
    text:    { type: String, default: "" },
    read:    { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Compound index for fast unread-count queries per user
notificationSchema.index({ recipient: 1, read: 1 });

// Never store duplicate "follow" notifications from the same sender to the same recipient
notificationSchema.index(
  { recipient: 1, sender: 1, type: 1, post: 1 },
  { unique: true, sparse: true, partialFilterExpression: { type: { $in: ["follow", "like_post", "like_comment", "profile_visit"] } } }
);

module.exports = mongoose.model("Notification", notificationSchema);