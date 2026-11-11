const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const UserModel = require("../models/user.model");
const RefreshSession = require("../models/Refreshsession.model");
const redis = require("../config/cache"); // only used for best-effort access-token blacklist now
const admin = require("../config/firebase");

// ── Config ──────────────────────────────────────────────────────────────
const ACCESS_SECRET = process.env.JWT_SECRET_KEY;
// accepts both names so a naming mismatch between code and Render env can't break login
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET_KEY;
if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("Missing JWT secrets: set JWT_SECRET_KEY and JWT_REFRESH_SECRET");
}

const ACCESS_TTL = "15m";
const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL = "30d";
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ROTATION_GRACE_MS = 30 * 1000; // second tab / retried request using the just-rotated token
const MAX_SESSIONS_PER_USER = 10;

const isProd = process.env.NODE_ENV === "production";

// Cross-site (Vercel -> Render) needs SameSite=None. If you move to a shared parent domain
// (app.yourdomain.com + api.yourdomain.com) set COOKIE_SAMESITE=lax and COOKIE_DOMAIN=.yourdomain.com
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: process.env.COOKIE_SAMESITE || (isProd ? "none" : "lax"),
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
};
const ACCESS_COOKIE = { ...COOKIE_OPTIONS, maxAge: ACCESS_TTL_MS };
const REFRESH_COOKIE = { ...COOKIE_OPTIONS, maxAge: REFRESH_TTL_MS };

const RESERVED_USERNAMES = new Set([
  "home", "search", "explore", "notifications", "chats", "settings", "edit-profile",
  "login", "signup", "about", "privacy-policy", "terms", "api", "admin", "me",
]);
const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;
const isStr = (v) => typeof v === "string";

// ── Token helpers ───────────────────────────────────────────────────────
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const signAccess = (userId) =>
  jwt.sign({ id: String(userId) }, ACCESS_SECRET, { expiresIn: ACCESS_TTL, algorithm: "HS256" });

// jti makes every refresh token unique, even if two are signed in the same second
const signRefresh = (userId, sid) =>
  jwt.sign(
    { id: String(userId), sid: String(sid), jti: crypto.randomUUID() },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TTL, algorithm: "HS256" }
  );

const setAccessCookie = (res, token) => res.cookie("token", token, ACCESS_COOKIE);
const setRefreshCookie = (res, token) => res.cookie("refreshToken", token, REFRESH_COOKIE);
const clearAuthCookies = (res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
};

// Creates a per-device session and sets both cookies
const startSession = async (req, res, userId) => {
  const sid = new mongoose.Types.ObjectId();
  const refreshToken = signRefresh(userId, sid);

  await RefreshSession.create({
    _id: sid,
    user: userId,
    tokenHash: hashToken(refreshToken),
    userAgent: (req.headers["user-agent"] || "").slice(0, 200),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  // keep the table from growing forever: drop the oldest sessions beyond the cap
  const stale = await RefreshSession.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(MAX_SESSIONS_PER_USER)
    .select("_id");
  if (stale.length) await RefreshSession.deleteMany({ _id: { $in: stale.map((s) => s._id) } });

  setAccessCookie(res, signAccess(userId));
  setRefreshCookie(res, refreshToken);
};

const publicUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.firebaseUid;
  return userObject;
};

// ── Geo-IP (never block signup on it) ───────────────────────────────────
// Needs app.set("trust proxy", 1) so req.ip is the real client, not a spoofable header
const getClientCity = async (req) => {
  const ip = req.ip;
  const isLocalIP = !ip || ["::1", "127.0.0.1", "::ffff:127.0.0.1"].includes(ip);
  if (isLocalIP) return "Unknown";

  try {
    const geoRes = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city`, {
      signal: AbortSignal.timeout(2000),
    });
    const geoData = await geoRes.json();
    return geoData.status === "success" && geoData.city ? geoData.city : "Unknown";
  } catch (geoErr) {
    console.warn("GeoIP lookup failed:", geoErr.message);
    return "Unknown";
  }
};

const makeUniqueUsername = async (seed) => {
  const base =
    (seed || "cityfriend").toString().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) || "cityfriend";

  let username = base;
  let suffix = 0;
  while (RESERVED_USERNAMES.has(username) || (await UserModel.exists({ username }))) {
    suffix += 1;
    username = `${base}${suffix}`.slice(0, 28);
  }
  return username;
};

// ── Controllers ─────────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (![username, email, password].every(isStr) || !username.trim() || !email.trim() || !password) {
      return res.status(400).json({ message: "Username, email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    if (!USERNAME_RE.test(normalizedUsername) || RESERVED_USERNAMES.has(normalizedUsername)) {
      return res.status(400).json({ message: "Username must be 3-20 characters: letters, numbers, _ or ." });
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email." });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: "Password must be 8-72 characters." });
    }

    // case-insensitive so "Abhishek" and "abhishek" can't both exist
    const isExist = await UserModel.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    }).collation({ locale: "en", strength: 2 });

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

    await startSession(req, res, user._id);

    return res.status(201).json({ message: "Account created successfully!", user: publicUser(user) });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Email or username already exists." }); // concurrent signup race
    }
    console.error("[signup]", error);
    return res.status(500).json({ message: "server error!" });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body || {};

    if (!isStr(identifier) || !isStr(password) || !identifier.trim() || !password) {
      return res.status(400).json({ message: "Username/email and password are required." });
    }

    const id = identifier.trim();
    const user = await UserModel.findOne({
      $or: [{ email: id.toLowerCase() }, { username: id }, { username: id.toLowerCase() }],
    }).select("+password");

    // same message for "no such user" and "wrong password" -> no account enumeration
    const invalid = () => res.status(401).json({ message: "Incorrect username/email or password." });

    if (!user) return invalid();
    if (!user.password) {
      return res.status(400).json({ message: "Use Google login for this account." });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) return invalid();

    await startSession(req, res, user._id);

    return res.status(200).json({ message: "login successfully!", user: publicUser(user) });
  } catch (error) {
    console.error("[login]", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.oauthLogin = async (req, res) => {
  try {
    const { idToken } = req.body || {};

    if (!isStr(idToken) || !idToken) {
      return res.status(400).json({ message: "Firebase ID token required." });
    }
    if (!admin) {
      return res.status(500).json({ message: "Firebase service account is not configured." });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase();

    if (!email || decoded.email_verified !== true) {
      return res.status(400).json({ message: "Google account must have a verified email." });
    }

    const provider = decoded.firebase?.sign_in_provider || "unknown";
    let user = await UserModel.findOne({ $or: [{ email }, { firebaseUid: decoded.uid }] });

    if (!user) {
      const city = await getClientCity(req); // only needed for brand-new users
      const username = await makeUniqueUsername(decoded.name || email.split("@")[0]);
      user = await UserModel.create({
        username,
        name: decoded.name || "",
        email,
        city,
        profilePic: decoded.picture || undefined,
        firebaseUid: decoded.uid,
        authProvider: provider,
        isVerified: true,
      });
    } else {
      // Pre-hijack protection: someone could have registered a LOCAL account with this
      // email (never verified) before the real owner used Google. Linking would hand the
      // owner's account to that person's password, so drop the password and old sessions.
      if (user.authProvider === "local" && !user.isVerified) {
        await UserModel.updateOne({ _id: user._id }, { $unset: { password: 1 } });
        await RefreshSession.deleteMany({ user: user._id });
      }

      let changed = false;
      if (!user.firebaseUid) { user.firebaseUid = decoded.uid; changed = true; }
      if (!user.authProvider || user.authProvider === "local") { user.authProvider = provider; changed = true; }
      if (!user.isVerified) { user.isVerified = true; changed = true; }
      if (decoded.picture && (!user.profilePic || user.profilePic.includes("defaultPfp"))) {
        user.profilePic = decoded.picture; changed = true;
      }
      if (decoded.name && !user.name) { user.name = decoded.name; changed = true; }
      if (changed) await user.save();
    }

    await startSession(req, res, user._id);

    return res.status(200).json({ message: "Logged in with Google successfully.", user: publicUser(user) });
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
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_SECRET, { algorithms: ["HS256"] });
    } catch {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Refresh token expired, please login again" });
    }

    // tokens issued before this change have no session id -> one-time re-login
    if (!decoded.sid || !mongoose.isValidObjectId(decoded.sid)) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Please login again" });
    }

    const incomingHash = hashToken(token);
    const now = Date.now();

    // 1) Normal rotation. Atomic: if two requests arrive together, only one matches tokenHash.
    const newRefresh = signRefresh(decoded.id, decoded.sid);
    const rotated = await RefreshSession.findOneAndUpdate(
      { _id: decoded.sid, user: decoded.id, tokenHash: incomingHash },
      {
        tokenHash: hashToken(newRefresh),
        prevTokenHash: incomingHash,
        rotatedAt: new Date(now),
        expiresAt: new Date(now + REFRESH_TTL_MS),
      }
    );
    if (rotated) {
      setAccessCookie(res, signAccess(decoded.id));
      setRefreshCookie(res, newRefresh);
      return res.status(200).json({ message: "Token refreshed." });
    }

    // 2) Another tab / retried request rotated a moment ago. The browser's cookie jar already
    //    holds the newer refresh token, so only hand out a new access token. No logout.
    const justRotated = await RefreshSession.exists({
      _id: decoded.sid,
      user: decoded.id,
      prevTokenHash: incomingHash,
      rotatedAt: { $gte: new Date(now - ROTATION_GRACE_MS) },
    });
    if (justRotated) {
      setAccessCookie(res, signAccess(decoded.id));
      return res.status(200).json({ message: "Token refreshed." });
    }

    // 3) Unknown or stale token (session revoked, or an old token replayed): kill THIS session only
    await RefreshSession.deleteOne({ _id: decoded.sid, user: decoded.id });
    clearAuthCookies(res);
    return res.status(401).json({ message: "Invalid refresh token" });
  } catch (error) {
    console.error("[refresh]", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const accessToken = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      try {
        // VERIFY the signature (the old code used jwt.decode, so anyone could forge
        // a cookie with a victim's user id and log them out). Expired tokens are fine here.
        const d = jwt.verify(refreshToken, REFRESH_SECRET, { algorithms: ["HS256"], ignoreExpiration: true });
        if (d.sid) await RefreshSession.deleteOne({ _id: d.sid, user: d.id });
      } catch {
        /* bad signature -> ignore, still clear cookies */
      }
    }

    // best effort only; never let Redis slow down or break logout
    if (accessToken) redis.set(accessToken, Date.now().toString(), "EX", 15 * 60).catch(() => {});

    clearAuthCookies(res);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("[logout]", error);
    clearAuthCookies(res);
    return res.status(500).json({ message: "Logout failed" });
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

// Short-lived token for the Socket.IO handshake. Works even when the browser won't send
// cookies to the socket host. Signed with a DIFFERENT secret so it can't be used as an API access token.
exports.socketToken = (req, res) => {
  const token = jwt.sign({ id: String(req.user.id) }, `${ACCESS_SECRET}:socket`, {
    expiresIn: "60s",
    algorithm: "HS256",
  });
  return res.status(200).json({ token });
};