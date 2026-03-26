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

// ✅ Fix: export was missing / misplaced in original code
module.exports = mongoose.models.Chat || mongoose.model("Chat", chatsSchema);