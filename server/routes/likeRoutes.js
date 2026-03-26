const express  = require("express");
const router   = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const { togglePostLike, toggleCommentLike, getPostLikes } = require("../controllers/likeController");

router.post("/post/:postId",       authenticate, togglePostLike);
router.post("/comment/:commentId", authenticate, toggleCommentLike);
router.get( "/post/:postId",       authenticate, getPostLikes);

module.exports = router;