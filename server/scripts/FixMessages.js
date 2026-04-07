/**
 * fixMessages.js — One-time migration script
 *
 * Run this ONCE from your server folder:
 *   node scripts/fixMessages.js
 *
 * Finds every Message missing receiverId, looks up the Chat
 * to find the other participant, and fills it in.
 * Safe to re-run — skips messages that already have receiverId.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Chat    = require("../models/chat.model");
const Message = require("../models/message.model");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const messages = await Message.find({
    $or: [
      { receiverId: { $exists: false } },
      { receiverId: null },
    ],
  }).lean();

  console.log(`📬 Found ${messages.length} messages missing receiverId`);

  if (messages.length === 0) {
    console.log("✅ Nothing to fix.");
    await mongoose.disconnect();
    return;
  }

  const chatIds = [...new Set(messages.map((m) => m.chatId.toString()))];
  const chats   = await Chat.find({ _id: { $in: chatIds } }).lean();
  const chatMap = {};
  chats.forEach((c) => { chatMap[c._id.toString()] = c; });

  let fixed = 0, skipped = 0;

  for (const msg of messages) {
    const chat = chatMap[msg.chatId.toString()];
    if (!chat) { skipped++; continue; }

    const receiverId = chat.participants.find(
      (p) => p.toString() !== msg.senderId.toString()
    );
    if (!receiverId) { skipped++; continue; }

    await Message.updateOne({ _id: msg._id }, { $set: { receiverId } });
    fixed++;
  }

  console.log(`✅ Fixed: ${fixed} | Skipped: ${skipped}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});