const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res)=>{
    try {
    const {username,email, password, city} = req.body;

        const isExist = await UserModel.findOne({
            $or:[{email}, {username}]
        })

        if(isExist){
            if(isExist.email === email){
                return res.status(409).json({
                    message:"Email already exist!"
                })
            }
            if(isExist.username === username){
                return  res.status(409).json({
                    message:"Username already exist"
                })
            }
        }
        const hashedPassword = await bcrypt.hash(password , 12);
        const user = await UserModel.create({
            username, email, city, password:hashedPassword
        })

        const token = jwt.sign(
            {
                id:user._id
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn:"1d"
            }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,       // localhost ke liye false
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
            });

        res.status(201).json({
            message:"Account created successfully!",
            user
        })


    } catch (error) {
        console.error(error)
        res.status(500).json({
            message:"server error!"
        })
    }
}

exports.login = async(req, res)=>{
    try {
        const {identifier, password}= req.body;

        const user = await UserModel.findOne({
            $or:[{email:identifier}, {username:identifier}]
        })
        if(!user){
            return res.status(404).json({
                message:"user not found!"
            })
        }
        const isMatched = await bcrypt.compare(password, user.password)
        if(!isMatched){
            return res.status(401).json({
                message:"Incorrect Password!"
            })
        }

        const token = jwt.sign(
            {id:user._id},
        process.env.JWT_SECRET_KEY,
            {expiresIn:"1d"}
        )

            res.cookie("token", token,{
                httpOnly: true,
                secure: false,       // localhost ke liye false
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 1000
                });

        res.status(200).json({
            message:"login successfully!",
            user
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"internal server error"
        })
    }
}


exports.logout = async (req, res) => {
  res.clearCookie("token");
  
  res.status(200).json({
    message: "Logout successful"
  });
};
