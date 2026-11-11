const mongoose = require("mongoose");

// One document per logged-in device. MongoDB is the source of truth for sessions;
// Redis is no longer needed for refresh tokens.
const refreshSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true },      // sha256 of the CURRENT refresh token
    prevTokenHash: { type: String, default: null },   // previous token, valid only for a short grace window
    rotatedAt: { type: Date, default: null },
    userAgent: { type: String, default: "" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB deletes expired sessions automatically
refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshSession", refreshSessionSchema);