const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  seen: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// ✅ Indexes for fast unread count queries (fixes timeout)
messageSchema.index({ receiverId: 1, seen: 1 });            // unread count per user
messageSchema.index({ chatId: 1, createdAt: 1 });           // fetch messages in a chat
messageSchema.index({ chatId: 1, receiverId: 1, seen: 1 }); // per-chat unread count

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);