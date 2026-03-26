const express  = require("express");
const router   = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const {
  addComment,
  addReply,
  getComments,
  getReplies,
  deleteComment,
  editComment,
} = require("../controllers/commentController");

router.post(  "/:postId",                       authenticate, addComment);
router.post(  "/:postId/reply/:commentId",      authenticate, addReply);
router.get(   "/:postId",                       authenticate, getComments);
router.get(   "/:postId/replies/:commentId",    authenticate, getReplies);
router.delete("/:commentId",                    authenticate, deleteComment);
router.patch( "/:commentId",                    authenticate, editComment);

module.exports = router;