const PostModel = require("../models/post.model");
const {uploadToImagekit} = require("../utils/imageKit")

exports.uploadImage = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required"
      });
    }

    const imageUrl = await uploadToImagekit(req.file);
    console.log(imageUrl)
    const post = await PostModel.create({
      caption: req.body.caption,
      image: imageUrl,
      user: req.user.id
    });

    res.status(201).json({
      message: "Post created successfully",
      post
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message || "Something went wrong!"
    });

  }

};

exports.getAllPosts = async (req, res)=>{
    try {
        const posts = await PostModel.find().populate("user", "username city  profilePic")
        if(!posts){
            return res.status(404).json({
                message:"No posts found!"
            })
        }
        res.status(200).json({
            posts
        })
    } catch (error) {
        res.status(500).json({
            error:error.message || "Something went wrong!"
        })
    }
}


exports.getUsersAllpost = async(req, res)=>{
    try {
        const posts = await PostModel.find({userId:req.user.id}).populate("user", "username  profilePic")
        if(!posts){
            return res.status(404).json({
                message:"No posts found!"
            })
        }
        res.status(200).json({
            posts
        })
        
    } catch (error) {
        res.status(500).json({
           error: error.message || "internal server error!"
        })
    }
}

exports.editProfile = async (req, res) => {

  const { username, bio, college, city, name } = req.body;

  const userId = req.user.id;

  try {

    let updateData = { username, bio, college, city, name };

    if (req.file) {
      const imageUrl = await uploadToImagekit(req.file);
      updateData.profilePic = imageUrl;
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });

  }

};