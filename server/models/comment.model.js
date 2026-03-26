const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post:          { type: mongoose.Schema.Types.ObjectId, ref: "Post",    required: true, index: true },
    author:        { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
    text:          { type: String, required: true, trim: true, maxlength: 1000 },
    // null = top-level comment; ObjectId = reply to that comment
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null, index: true },
    likesCount:    { type: Number, default: 0 },
    repliesCount:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);