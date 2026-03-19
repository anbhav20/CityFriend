const jwt = require("jsonwebtoken");
const redis = require("../config/cache");

exports.authenticate = async (req, res, next) => {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Not authorized, login required!"
        });
    }

    // check blacklist
    const isBlacklisted = await redis.get(token);

    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized! Token expired"
        });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = decoded;

        next();

    } catch (error) {

        console.log(error);

        return res.status(401).json({
            message: "Invalid token!"
        });

    }

};