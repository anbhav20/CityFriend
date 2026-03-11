const UserModel = require("../models/user.model");
const Follow = require("../models/follow.model");

exports.allusers = async (req, res) => {
  try {

    const users = await UserModel.find().select("-password");

    if (users.length === 0) {
      return res.status(404).json({
        message: "No users found"
      });
    }

    res.status(200).json({
      users
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

exports.getUserProfile = async (req, res) => {

  const username = req.params.username;

  try {

    const user = await UserModel.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      user
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message
    });
  }
};

exports.getUsersByCity = async (req, res) => {

  try {

    const currentUser = await UserModel.findById(req.user.id);

    const users = await UserModel.find({
      city: currentUser.city,
      _id: { $ne: req.user.id }
    }).select("-password");

    if (users.length === 0) {
      return res.status(200).json({
       users:[]
      });
    }

    res.status(200).json({
      users
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message
    });
  }
};

exports.followUser = async (req, res) => {

  const followerId = req.user.id;
  const followingId = req.params.id;

  if (followerId.toString() === followingId.toString()) {
    return res.status(400).json({
      message: "You cannot follow yourself"
    });
  }

  try {

    const alreadyFollow = await Follow.exists({
      follower: followerId,
      following: followingId
    });

    if (alreadyFollow) {
      return res.status(400).json({
        message: "Already following this user"
      });
    }

    await Follow.create({
      follower: followerId,
      following: followingId
    });

    res.status(201).json({
      message: "followed"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message
    });
  }
};

exports.unfollowUser = async (req, res) => {

  const followerId = req.user.id;
  const followingId = req.params.id;

  if (followerId.toString() === followingId.toString()) {
    return res.status(400).json({
      message: "You cannot unfollow yourself"
    });
  }

  try {

    await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId
    });

    res.status(200).json({
      message: "unfollowed"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message
    });
  }
};

exports.getFollowers = async (req, res) => {

  const userId = req.params.id;

  try {

    const followers = await Follow.find({
      following: userId
    }).populate("follower", "username city profilePic");

    res.status(200).json({
      followers
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message
    });
  }
};

exports.getFollowings = async (req, res) => {

  const userId = req.params.id;

  try {

    const followings = await Follow.find({
      follower: userId
    }).populate("following", "username city profilePic");

    res.status(200).json({
      followings
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message
    });
  }
};