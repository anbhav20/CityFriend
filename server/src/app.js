const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('../routes/authRoutes');
const UserRoute  = require('../routes/userRoutes');
const postRoute  = require('../routes/postRoutes');

const app = express();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Allowed origins (multiple support)
const allowedOrigins = [
  "http://localhost:5173", // local dev
  process.env.CLIENT_URL   // production frontend (Vercel)
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api',      UserRoute);
app.use('/api/posts', postRoute);

// ✅ Health check route (important for Render)
app.get('/', (req, res) => {
  res.send("API is running...");
});

// ❌ REMOVED:
// express.static
// SPA fallback
// (frontend ab Vercel pe serve hoga)

module.exports = app;