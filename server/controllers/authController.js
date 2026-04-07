const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const redis = require('../config/cache');
const crypto = require('crypto');

// ─── helpers ──────────────────────────────────────────────
const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '15m' }  // short-lived
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,  // separate secret!
    { expiresIn: '30d' }
  );
  return { accessToken, refreshToken };
};

// store refresh token hash in Redis with 30d TTL
const saveRefreshToken = async (userId, refreshToken) => {
  const hash = hashToken(refreshToken);
  // key: refresh:<userId>, value: hash, TTL: 30 days
  await redis.set(`refresh:${userId}`, hash, 'EX', 30 * 24 * 60 * 60);
};

// ─── signup ───────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const isExist = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (isExist) {
      if (isExist.email === email)
        return res.status(409).json({ message: "Email already exist!" });
      if (isExist.username === username)
        return res.status(409).json({ message: "Username already exist" });
    }

    // geo-ip (same as before)
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
      || req.headers['x-real-ip']
      || req.socket.remoteAddress;
    let city = 'Unknown';
    const isLocalIP = ['::1', '127.0.0.1', '::ffff:127.0.0.1'].includes(ip);
    if (!isLocalIP) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city`);
        const geoData = await geoRes.json();
        if (geoData.status === 'success' && geoData.city) city = geoData.city;
      } catch (geoErr) {
        console.warn('GeoIP lookup failed:', geoErr.message);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ username, email, city, password: hashedPassword });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await saveRefreshToken(user._id.toString(), refreshToken);

    res.status(201).json({
      message: "Account created successfully!",
      user,
      token: accessToken,        // frontend stores this
      refreshToken               // frontend stores this too
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error!" });
  }
};

// ─── login ────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    }).select("+password");

    if (!user) return res.status(404).json({ message: "user not found!" });

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) return res.status(401).json({ message: "Incorrect Password!" });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await saveRefreshToken(user._id.toString(), refreshToken);

    res.status(200).json({
      message: "login successfully!",
      user,
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};

// ─── refresh ──────────────────────────────────────────────
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body; // sent from frontend

    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token provided" });

    // verify JWT signature + expiry
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: "Refresh token expired, please login again" });
    }

    // check it matches what we stored in Redis
    const storedHash = await redis.get(`refresh:${decoded.id}`);
    if (!storedHash || storedHash !== hashToken(refreshToken)) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    //  rotate — issue brand new pair
    const { accessToken, refreshToken: newRefresh } = generateTokens(decoded.id);
    await saveRefreshToken(decoded.id, newRefresh);

    res.status(200).json({
      token: accessToken,
      refreshToken: newRefresh
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};

// ─── logout ───────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: "No token found" });

    // blacklist current access token (until its 15m TTL expires)
    await redis.set(token, Date.now().toString(), 'EX', 60 * 15);

    // also delete the refresh token so it can't be reused
    await redis.del(`refresh:${req.user.id}`);

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

// ─── getMe ────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "user not found" });
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};