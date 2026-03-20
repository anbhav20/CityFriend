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

        // Render sets x-forwarded-for but sometimes has multiple IPs
        // Also Render's own internal IPs start with 10. which you're skipping!
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.headers['x-real-ip'] ||
            req.socket.remoteAddress;

        let city = 'Unknown';

        // ✅ updated — only skip true localhost, NOT 10.x (Render passes real user IP in x-forwarded-for)
        const isLocalIP =
            ip === '::1' ||
            ip === '127.0.0.1' ||
            ip === '::ffff:127.0.0.1';

         if (!isLocalIP) {
            try {
                const geoRes = await fetch(`https://ipwho.is/${ip}`);
                const geoData = await geoRes.json();
                console.log('GeoIP result:', ip, geoData); // ← add this to debug
                if (geoData.success && geoData.city) {
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

        res.cookie("token", token, {
            httpOnly: true,
            secure: true, 
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({ message: "Account created successfully!", user });

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

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: "login successfully!", user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
};

exports.logout = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) return res.status(400).json({ message: "No token found" });

        await redis.set(token, Date.now().toString(), "EX", 60 * 60);
        res.clearCookie("token");

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