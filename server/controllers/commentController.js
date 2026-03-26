const Comment = require("../models/comment.model");
const Post    = require("../models/post.model");      // adjust path
const Like    = require("../models/like.model");
const { createNotification } = require("./notificationController");

// ─── POST /api/comments/:postId ── add a top-level comment ───────────────────
const addComment = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  const { text } = req.body;

  if (!text?.trim()) return res.status(400).json({ message: "Comment text is required" });

  try {
    const post = await Post.findById(postId).select("author commentsCount");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({ post: postId, author: userId, text: text.trim() });
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    await comment.populate("author", "username profilePic");

    // Notify post author
    if (post.author.toString() !== userId.toString()) {
      await createNotification({
        recipient: post.author,
        sender:    userId,
        type:      "comment",
        post:      postId,
        comment:   comment._id,
        text:      text.trim().slice(0, 80),
      }).catch(() => {});
    }

    res.status(201).json({ comment, isLiked: false });
  } catch (err) {
    console.error("addComment:", err);
    res.status(500).json({ message: "Error adding comment" });
  }
};

// ─── POST /api/comments/:postId/reply/:commentId ── reply to a comment ───────
const addReply = async (req, res) => {
  const userId = req.user.id;
  const { postId, commentId } = req.params;
  const { text } = req.body;

  if (!text?.trim()) return res.status(400).json({ message: "Reply text is required" });

  try {
    const [post, parent] = await Promise.all([
      Post.findById(postId).select("author"),
      Comment.findById(commentId).select("author post"),
    ]);
    if (!post)   return res.status(404).json({ message: "Post not found" });
    if (!parent) return res.status(404).json({ message: "Parent comment not found" });

    const reply = await Comment.create({
      post:          postId,
      author:        userId,
      text:          text.trim(),
      parentComment: commentId,
    });

    await Comment.findByIdAndUpdate(commentId, { $inc: { repliesCount: 1 } });
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    await reply.populate("author", "username profilePic");

    // Notify parent comment author (if not replying to yourself)
    if (parent.author.toString() !== userId.toString()) {
      await createNotification({
        recipient: parent.author,
        sender:    userId,
        type:      "comment",
        post:      postId,
        comment:   reply._id,
        text:      text.trim().slice(0, 80),
      }).catch(() => {});
    }

    // Also notify post author if different from comment author
    if (
      post.author.toString() !== userId.toString() &&
      post.author.toString() !== parent.author.toString()
    ) {
      await createNotification({
        recipient: post.author,
        sender:    userId,
        type:      "mention",
        post:      postId,
        comment:   reply._id,
        text:      text.trim().slice(0, 80),
      }).catch(() => {});
    }

    res.status(201).json({ comment: reply, isLiked: false });
  } catch (err) {
    console.error("addReply:", err);
    res.status(500).json({ message: "Error adding reply" });
  }
};

// ─── GET /api/comments/:postId ── get top-level comments for a post ──────────
const getComments = async (req, res) => {
  const userId = req.user?.id;
  const { postId } = req.params;
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(30, parseInt(req.query.limit) || 15);
  const skip  = (page - 1) * limit;

  try {
    const [comments, total] = await Promise.all([
      Comment.find({ post: postId, parentComment: null })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username profilePic")
        .lean(),
      Comment.countDocuments({ post: postId, parentComment: null }),
    ]);

    // Attach isLiked per comment for the logged-in user
    let result = comments;
    if (userId && comments.length) {
      const commentIds = comments.map((c) => c._id);
      const likes = await Like.find({ user: userId, comment: { $in: commentIds } }).select("comment").lean();
      const likedSet = new Set(likes.map((l) => l.comment.toString()));
      result = comments.map((c) => ({ ...c, isLiked: likedSet.has(c._id.toString()) }));
    }

    res.json({ comments: result, total, page, hasMore: skip + comments.length < total });
  } catch (err) {
    console.error("getComments:", err);
    res.status(500).json({ message: "Error fetching comments" });
  }
};

// ─── GET /api/comments/:postId/replies/:commentId ── get replies ─────────────
const getReplies = async (req, res) => {
  const userId = req.user?.id;
  const { commentId } = req.params;

  try {
    const replies = await Comment.find({ parentComment: commentId })
      .sort({ createdAt: 1 })
      .populate("author", "username profilePic")
      .lean();

    let result = replies;
    if (userId && replies.length) {
      const ids = replies.map((r) => r._id);
      const likes = await Like.find({ user: userId, comment: { $in: ids } }).select("comment").lean();
      const likedSet = new Set(likes.map((l) => l.comment.toString()));
      result = replies.map((r) => ({ ...r, isLiked: likedSet.has(r._id.toString()) }));
    }

    res.json({ replies: result });
  } catch (err) {
    console.error("getReplies:", err);
    res.status(500).json({ message: "Error fetching replies" });
  }
};

// ─── DELETE /api/comments/:commentId ─────────────────────────────────────────
const deleteComment = async (req, res) => {
  const userId = req.user.id;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const isReply = !!comment.parentComment;

    // Delete the comment + all its replies (if top-level)
    const idsToDelete = [comment._id];
    if (!isReply) {
      const replies = await Comment.find({ parentComment: commentId }).select("_id").lean();
      replies.forEach((r) => idsToDelete.push(r._id));
    }

    await Comment.deleteMany({ _id: { $in: idsToDelete } });
    await Like.deleteMany({ comment: { $in: idsToDelete } });

    // Decrement counts
    const countToRemove = idsToDelete.length;
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -countToRemove } });
    if (isReply) {
      await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } });
    }

    res.json({ message: "Deleted", deletedCount: countToRemove });
  } catch (err) {
    console.error("deleteComment:", err);
    res.status(500).json({ message: "Error deleting comment" });
  }
};

// ─── PATCH /api/comments/:commentId ── edit own comment ──────────────────────
const editComment = async (req, res) => {
  const userId = req.user.id;
  const { text } = req.body;

  if (!text?.trim()) return res.status(400).json({ message: "Text is required" });

  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Not found" });
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.text = text.trim();
    await comment.save();
    await comment.populate("author", "username profilePic");

    res.json({ comment });
  } catch (err) {
    res.status(500).json({ message: "Error editing comment" });
  }
};

module.exports = { addComment, addReply, getComments, getReplies, deleteComment, editComment };