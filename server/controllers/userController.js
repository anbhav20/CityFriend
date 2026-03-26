const UserModel = require("../models/user.model");
const Follow    = require("../models/follow.model");
const { uploadToImagekit } = require("../utils/imageKit");
const { createNotification } = require("./notificationController");

exports.allusers = async (req, res) => {
  try {
    const users = await UserModel.find();
    if (users.length === 0) return res.status(404).json({ message: "No users found" });
    res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  const username = req.params.username;
  try {
    const user = await UserModel.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let isFollowing = false;
    if (req.user?.id) {
      isFollowing = !!(await Follow.exists({ follower: req.user.id, following: user._id }));
    }

    // Fire profile_visit notification (non-fatal, skip if visiting own profile)
    if (req.user?.id && req.user.id.toString() !== user._id.toString()) {
      createNotification({
        recipient: user._id,
        sender:    req.user.id,
        type:      "profile_visit",
      }).catch(() => {});
    }

    res.status(200).json({ user, isFollowing });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUsersByCity = async (req, res) => {
  try {
    const currentUser = await UserModel.findById(req.user.id);
    const users = await UserModel.find({ city: currentUser.city, _id: { $ne: req.user.id } });
    res.status(200).json({ users: users ?? [] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.followUser = async (req, res) => {
  const followerId  = req.user.id;
  const followingId = req.params.id;

  if (followerId.toString() === followingId.toString()) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  try {
    const alreadyFollow = await Follow.exists({ follower: followerId, following: followingId });
    if (alreadyFollow) return res.status(400).json({ message: "Already following this user" });

    await Follow.create({ follower: followerId, following: followingId });
    await UserModel.findByIdAndUpdate(followingId, { $inc: { followersCount:  1 } });
    await UserModel.findByIdAndUpdate(followerId,  { $inc: { followingCount:  1 } });

    // ── Notify the followed user ──────────────────────────────────────
    await createNotification({
      recipient: followingId,
      sender:    followerId,
      type:      "follow",
    }).catch(() => {}); // non-fatal

    res.status(201).json({ message: "followed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  const followerId  = req.user.id;
  const followingId = req.params.id;

  if (followerId.toString() === followingId.toString()) {
    return res.status(400).json({ message: "You cannot unfollow yourself" });
  }

  try {
    await Follow.findOneAndDelete({ follower: followerId, following: followingId });
    await UserModel.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });
    await UserModel.findByIdAndUpdate(followerId,  { $inc: { followingCount: -1 } });

    // ── Notify the unfollowed user ────────────────────────────────────
    await createNotification({
      recipient: followingId,
      sender:    followerId,
      type:      "unfollow",
    }).catch(() => {});

    res.status(200).json({ message: "unfollowed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFollowers = async (req, res) => {
  const userId = req.params.id;
  try {
    const followers = await Follow.find({ following: userId })
      .populate("follower", "username profilePic")
      .select("follower");
    res.status(200).json({ followers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFollowings = async (req, res) => {
  const userId = req.params.id;
  try {
    const followings = await Follow.find({ follower: userId })
      .populate("following", "username profilePic")
      .select("following");
    res.status(200).json({ followings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editProfile = async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized." });

  const { name, username, bio, city, college } = req.body;

  try {
    if (username) {
      const existing = await UserModel.findOne({
        username: username.toLowerCase().trim(),
        _id: { $ne: userId },
      });
      if (existing) return res.status(409).json({ message: "Username already taken." });
    }

    const updateData = {
      ...(name                  && { name:     name.trim()                   }),
      ...(username              && { username: username.toLowerCase().trim() }),
      ...(bio !== undefined     && { bio:      bio.trim()                    }),
      ...(city                  && { city:     city.trim()                   }),
      ...(college               && { college:  college.trim()                }),
    };

    if (req.file) {
      const imageUrl = await uploadToImagekit(req.file);
      updateData.profilePic = imageUrl;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({ message: "Profile updated successfully.", user: updatedUser });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ message: `${field} is already taken.` });
    }
    console.error("editProfile error:", err.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

exports.checkUsername = async (req, res) => {
  try {
    const username = req.params.username?.toLowerCase().trim();
    if (!username || username.length < 2) {
      return res.status(400).json({ available: false, message: "Username too short." });
    }
    const validFormat = /^[a-z0-9._]+$/.test(username);
    if (!validFormat) {
      return res.status(400).json({ available: false, message: "Invalid username format." });
    }
    const existing = await UserModel.findOne({ username });
    return res.json({ available: !existing });
  } catch (err) {
    console.error("checkUsername error:", err.message);
    return res.status(500).json({ available: false, message: "Server error." });
  }
};