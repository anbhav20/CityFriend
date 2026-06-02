const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const redis = require("../config/cache");
const admin = require("../config/firebase");

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const ACCESS_COOKIE = { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 };
const REFRESH_COOKIE = { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 };

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_KEY,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );

  return { accessToken, refreshToken };
};

const attachAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("token", accessToken, ACCESS_COOKIE);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE);
};

const clearAuthCookies = (res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
};

const publicUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

const saveRefreshToken = async (userId, refreshToken) => {
  const hash = hashToken(refreshToken);
  await redis.set(`refresh:${userId}`, hash, "EX", REFRESH_TOKEN_TTL_SECONDS);
  await UserModel.findByIdAndUpdate(userId, { refreshToken: hash });
};

const revokeRefreshToken = async (userId) => {
  if (!userId) return;
  await redis.del(`refresh:${userId}`);
  await UserModel.findByIdAndUpdate(userId, { refreshToken: null });
};

const getClientCity = async (req) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim()
    || req.headers["x-real-ip"]
    || req.socket.remoteAddress;

  const isLocalIP = ["::1", "127.0.0.1", "::ffff:127.0.0.1"].includes(ip);
  if (isLocalIP) return "Unknown";

  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city`);
    const geoData = await geoRes.json();
    return geoData.status === "success" && geoData.city ? geoData.city : "Unknown";
  } catch (geoErr) {
    console.warn("GeoIP lookup failed:", geoErr.message);
    return "Unknown";
  }
};

const makeUniqueUsername = async (seed) => {
  const base = (seed || "cityfriend")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20) || "cityfriend";

  let username = base;
  let suffix = 0;

  while (await UserModel.exists({ username })) {
    suffix += 1;
    username = `${base}${suffix}`.slice(0, 28);
  }

  return username;
};

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    const isExist = await UserModel.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (isExist) {
      if (isExist.email === normalizedEmail) {
        return res.status(409).json({ message: "Email already exist!" });
      }
      return res.status(409).json({ message: "Username already exist" });
    }

    const city = await getClientCity(req);
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      username: normalizedUsername,
      email: normalizedEmail,
      city,
      password: hashedPassword,
      authProvider: "local",
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await saveRefreshToken(user._id.toString(), refreshToken);
    attachAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      message: "Account created successfully!",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("[signup]", error);
    return res.status(500).json({ message: "server error!" });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Username/email and password are required." });
    }

    const user = await UserModel.findOne({
      $or: [{ email: identifier.toLowerCase().trim() }, { username: identifier.trim() }],
    }).select("+password");

    if (!user) return res.status(404).json({ message: "user not found!" });
    if (!user.password) {
      return res.status(400).json({ message: "Use Google login for this account." });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) return res.status(401).json({ message: "Incorrect Password!" });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await saveRefreshToken(user._id.toString(), refreshToken);
    attachAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      message: "login successfully!",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("[login]", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.oauthLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Firebase ID token required." });
    }
    if (!admin) {
      return res.status(500).json({ message: "Firebase service account is not configured." });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Google account must include an email." });
    }

    const provider = decoded.firebase?.sign_in_provider || "unknown";
    let user = await UserModel.findOne({ $or: [{ email }, { firebaseUid: decoded.uid }] });

    if (!user) {
      const username = await makeUniqueUsername(decoded.name || email.split("@")[0]);
      user = await UserModel.create({
        username,
        name: decoded.name || "",
        email,
        profilePic: decoded.picture || undefined,
        firebaseUid: decoded.uid,
        authProvider: provider,
        isVerified: true,
      });
    } else {
      let changed = false;

      if (!user.firebaseUid) {
        user.firebaseUid = decoded.uid;
        changed = true;
      }
      if (!user.authProvider || user.authProvider === "local") {
        user.authProvider = provider;
        changed = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        changed = true;
      }
      if (decoded.picture && (!user.profilePic || user.profilePic.includes("defaultPfp"))) {
        user.profilePic = decoded.picture;
        changed = true;
      }
      if (decoded.name && !user.name) {
        user.name = decoded.name;
        changed = true;
      }

      if (changed) await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await saveRefreshToken(user._id.toString(), refreshToken);
    attachAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      message: "Logged in with Google successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("[oauthLogin]", error);
    if (error.code?.startsWith("auth/")) {
      return res.status(401).json({ message: "Invalid or expired Firebase token." });
    }
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Refresh token expired, please login again" });
    }

    const incomingHash = hashToken(refreshToken);
    const [storedHash, user] = await Promise.all([
      redis.get(`refresh:${decoded.id}`),
      UserModel.findById(decoded.id).select("+refreshToken"),
    ]);

    if (!user || !storedHash || storedHash !== incomingHash || user.refreshToken !== incomingHash) {
      await revokeRefreshToken(decoded.id);
      clearAuthCookies(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefresh } = generateTokens(decoded.id);
    await saveRefreshToken(decoded.id, newRefresh);
    attachAuthCookies(res, accessToken, newRefresh);

    return res.status(200).json({ message: "Token refreshed." });
  } catch (error) {
    console.error("[refresh]", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const decodedRefresh = refreshToken ? jwt.decode(refreshToken) : null;
    const userId = req.user?.id || decodedRefresh?.id;

    if (token) {
      await redis.set(token, Date.now().toString(), "EX", 15 * 60);
    }

    await revokeRefreshToken(userId);
    clearAuthCookies(res);

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    clearAuthCookies(res);
    return res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "user not found" });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("[getMe]", error);
    return res.status(500).json({ message: "internal server error" });
  }
};
