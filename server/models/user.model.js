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
  name:{
    type:String,
   default:""
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
  required: true,
  select:false
  },
 city: {
      type: String,
      default: 'Unknown'  // ← remove required, add default
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
}, 
followersCount:{
  type:Number,
  default:0
},
followingCount:{
  type:Number,
  default:0
},
postCount:{
  type:Number,
  default:0
},
college:{
  type:String,
  default:"",
},
pushSubscription: { type: Object, default: null }

}, { timestamps: true });

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
