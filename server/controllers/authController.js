const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const redis = require('../config/cache');

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const isExist = await UserModel.findOne({
            $or: [{ email }, { username }]
        });
        if (isExist) {
            if (isExist.email === email) {
                return res.status(409).json({ message: "Email already exist!" });
            }
            if (isExist.username === username) {
                return res.status(409).json({ message: "Username already exist" });
            }
        }
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.headers['x-real-ip'] ||
            req.socket.remoteAddress;
        let city = 'Unknown';
        const isLocalIP =
            ip === '::1' ||
            ip === '127.0.0.1' ||
            ip === '::ffff:127.0.0.1';
        if (!isLocalIP) {
            try {
                const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city`);
                const geoData = await geoRes.json();
                console.log('GeoIP result:', ip, geoData);
                if (geoData.status === 'success' && geoData.city) {
                    city = geoData.city;
                }
            } catch (geoErr) {
                console.warn('GeoIP lookup failed:', geoErr.message);
            }
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await UserModel.create({
            username, email, city, password: hashedPassword
        });
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
        );

        // 🍪 Cookie approach — commented out (blocked by browser cross-site policy)
        // res.cookie("token", token, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: "none",
        //     maxAge: 24 * 60 * 60 * 1000
        // });

        // Token sent in response body instead
        res.status(201).json({ message: "Account created successfully!", user, token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "server error!" });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const user = await UserModel.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        }).select("+password");

        if (!user) return res.status(404).json({ message: "user not found!" });

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) return res.status(401).json({ message: "Incorrect Password!" });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
        );

        // Cookie approach — commented out (blocked by browser cross-site policy)
        // res.cookie("token", token, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: "none",
        //     maxAge: 24 * 60 * 60 * 1000
        // });

        //  Token sent in response body instead
        res.status(200).json({ message: "login successfully!", user, token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
};

exports.logout = async (req, res) => {
    try {
        //  Cookie approach commented out
        // const token = req.cookies.token;
        // if (!token) return res.status(400).json({ message: "No token found" });
        // res.clearCookie("token");

        // ✅ Token now comes from Authorization header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) return res.status(400).json({ message: "No token found" });

        // blacklist the token in redis until it expires (1 day)
        await redis.set(token, Date.now().toString(), "EX", 60 * 60 * 24);

        res.status(200).json({ message: "Logout successful" });

    } catch (error) {
        res.status(500).json({ message: "Logout failed", error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id).select("-password");

        if (!user) return res.status(404).json({ message: "user not found" });

        res.status(200).json({ user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
};