const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const path         = require('path');

const authRoutes = require('../routes/authRoutes');
const UserRoute  = require('../routes/userRoutes');
const postRoute  = require('../routes/postRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ handles form-encoded bodies
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL || "http://localhost:5173", // ✅ origin:true is too permissive for production
}));

app.use(express.static(path.join(__dirname, "../public")));

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api',      UserRoute);
app.use('/api/posts', postRoute);

// ✅ SPA fallback — only for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: "API route not found." });
  }
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;