const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Either post OR comment must be set — enforced at controller level
    post:    { type: mongoose.Schema.Types.ObjectId, ref: "Post",    default: null },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  },
  { timestamps: true }
);

// One like per user per post
likeSchema.index({ user: 1, post: 1 },    { unique: true, sparse: true });
// One like per user per comment
likeSchema.index({ user: 1, comment: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Like", likeSchema);