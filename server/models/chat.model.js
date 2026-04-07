const mongoose = require('mongoose');

const chatsSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  }
}, { timestamps: true });

// ✅ Speeds up getChats: find({ participants: userId }) + sort({ updatedAt: -1 })
chatsSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.models.Chat || mongoose.model("Chat", chatsSchema);