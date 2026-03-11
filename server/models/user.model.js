const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  profilePic:{
    type:String,
     default: "https://ik.imagekit.io/l63o2ofbp/defaultPfp.jpeg"

  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  bio:{
    type:String,
     default:""
  },
  posts:[
    {type:mongoose.Schema.Types.ObjectId, ref:"Post"}
  ],
 gender: {
  type: String,
  enum: ["male", "female", "other"]
}

}, { timestamps: true });

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
