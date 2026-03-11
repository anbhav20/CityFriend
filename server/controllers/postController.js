const ImageKit = require("@imagekit/nodejs");
const { toFile } = require("@imagekit/nodejs");
const PostModel = require("../models/post.model");

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

exports.uploadImage = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required"
      });
    }

    const file = await imagekit.files.upload({
      file: await toFile(Buffer.from(req.file.buffer), "file"),
      fileName: "posts/" + Date.now() + "_" + req.file.originalname
    });

    const post = await PostModel.create({
      caption: req.body.caption,
      image: file.url,
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
        const posts = await PostModel.find({userId:req.user.id}).populate("user", "username city profilePic")
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