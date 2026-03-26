const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    caption:{type :String, default:""},
    image:{type:String, required:true},
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    likesCount:    { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
});

const PostModel = mongoose.model("Post", PostSchema);

module.exports = PostModel;