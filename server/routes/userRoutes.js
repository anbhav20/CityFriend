const express = require('express');
const multer  = require("multer");
const { authenticate } = require('../middlewares/authMiddleware');
const {
  allusers,
  checkUsername,
  getUserProfile,
  getUsersByCity,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowings,
  editProfile,
} = require('../controllers/userController');

const upload    = multer({ storage: multer.memoryStorage() });
const UserRoute = express.Router();

// ✅ CRITICAL: specific/static routes MUST come before /:param wildcards
// otherwise Express matches "city", "check-username", "edit-profile" as usernames

UserRoute.get('/users',                    authenticate, allusers);
UserRoute.get('/users/city',               authenticate, getUsersByCity);       // ✅ was after /:username — broken
UserRoute.get('/users/check-username/:username', authenticate, checkUsername);  // ✅ moved under /users/ prefix
UserRoute.patch('/users/edit-profile',     authenticate, upload.single("profilePic"), editProfile); // ✅ was clashing with /:username

// ✅ wildcard param routes always last
UserRoute.get('/:username',                authenticate, getUserProfile);
UserRoute.post('/:id/follow',              authenticate, followUser);
UserRoute.delete('/:id/unfollow',          authenticate, unfollowUser);
UserRoute.get('/:id/followers',            authenticate, getFollowers);
UserRoute.get('/:id/followings',           authenticate, getFollowings);

module.exports = UserRoute;