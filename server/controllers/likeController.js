const Like    = require("../models/like.model");
const Post    = require("../models/post.model");       // adjust path
const Comment = require("../models/comment.model");
const { createNotification } = require("./notificationController");

// ─── Helper: attach isLiked to any list of posts for a given userId ──────────
/**
 * attachIsLiked(posts, userId)
 * posts  — array of plain objects (use .lean() when querying)
 * userId — the logged-in user's _id (string or ObjectId)
 *
 * Returns the same array with isLiked: true/false on each post.
 */
const attachIsLiked = async (posts, userId) => {
  if (!userId || !posts.length) return posts.map((p) => ({ ...p, isLiked: false }));

  const postIds = posts.map((p) => p._id);
  const likes   = await Like.find({ user: userId, post: { $in: postIds } }).select("post").lean();
  const likedSet = new Set(likes.map((l) => l.post.toString()));

  return posts.map((p) => ({ ...p, isLiked: likedSet.has(p._id.toString()) }));
};

// ─── Helper: attach isCommented to posts ─────────────────────────────────────
const attachIsCommented = async (posts, userId) => {
  if (!userId || !posts.length) return posts.map((p) => ({ ...p, isCommented: false }));

  const Comment = require("../models/comment.model");
  const postIds  = posts.map((p) => p._id);
  const comments = await Comment.find({
    author: userId,
    post: { $in: postIds },
    parentComment: null,         // top-level only
  }).select("post").lean();
  const commentedSet = new Set(comments.map((c) => c.post.toString()));

  return posts.map((p) => ({ ...p, isCommented: commentedSet.has(p._id.toString()) }));
};

// ─── POST /api/likes/post/:postId — toggle like on a post ────────────────────
const togglePostLike = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).select("author likesCount");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existing = await Like.findOne({ user: userId, post: postId });

    if (existing) {
      // ── Unlike ──
      await existing.deleteOne();
      const likesCount = Math.max(0, (post.likesCount ?? 1) - 1);
      await Post.findByIdAndUpdate(postId, { likesCount });
      return res.json({ liked: false, likesCount });
    }

    // ── Like ──
    await Like.create({ user: userId, post: postId });
    const likesCount = (post.likesCount ?? 0) + 1;
    await Post.findByIdAndUpdate(postId, { likesCount });

    // Notify post author (skip if liking own post)
    if (post.author.toString() !== userId.toString()) {
      await createNotification({
        recipient: post.author,
        sender:    userId,
        type:      "like_post",
        post:      postId,
      }).catch(() => {}); // non-fatal
    }

    return res.json({ liked: true, likesCount });
  } catch (err) {
    if (err.code === 11000) {
      // Race condition — already liked
      return res.json({ liked: true });
    }
    console.error("togglePostLike:", err);
    res.status(500).json({ message: "Error toggling like" });
  }
};

// ─── POST /api/likes/comment/:commentId — toggle like on a comment ───────────
const toggleCommentLike = async (req, res) => {
  const userId = req.user.id;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId).select("author likesCount post");
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const existing = await Like.findOne({ user: userId, comment: commentId });

    if (existing) {
      await existing.deleteOne();
      const likesCount = Math.max(0, (comment.likesCount ?? 1) - 1);
      await Comment.findByIdAndUpdate(commentId, { likesCount });
      return res.json({ liked: false, likesCount });
    }

    await Like.create({ user: userId, comment: commentId });
    const likesCount = (comment.likesCount ?? 0) + 1;
    await Comment.findByIdAndUpdate(commentId, { likesCount });

    if (comment.author.toString() !== userId.toString()) {
      await createNotification({
        recipient: comment.author,
        sender:    userId,
        type:      "like_comment",
        post:      comment.post,
        comment:   commentId,
      }).catch(() => {});
    }

    return res.json({ liked: true, likesCount });
  } catch (err) {
    if (err.code === 11000) return res.json({ liked: true });
    console.error("toggleCommentLike:", err);
    res.status(500).json({ message: "Error toggling like" });
  }
};

// ─── GET /api/likes/post/:postId — who liked a post ──────────────────────────
const getPostLikes = async (req, res) => {
  try {
    const likes = await Like.find({ post: req.params.postId })
      .populate("user", "username profilePic")
      .lean();
    res.json({ likes: likes.map((l) => l.user), count: likes.length });
  } catch (err) {
    res.status(500).json({ message: "Error fetching likes" });
  }
};

module.exports = { togglePostLike, toggleCommentLike, getPostLikes, attachIsLiked, attachIsCommented };