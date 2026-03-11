const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next)=>{
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message:"not authorized, login required!"
        })
    }

    let decoded = null;
    try {
         decoded= jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:"invalid token!"
        })
    }

    req.user = decoded;
    next();
}
