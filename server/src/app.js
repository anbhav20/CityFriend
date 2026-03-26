const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes          = require('../routes/authRoutes');
const UserRoute           = require('../routes/userRoutes');
const postRoute           = require('../routes/postRoutes');
const sendMessageRoute    = require('../routes/messageRoute');
const notificationRoutes  = require('../routes/notificationRoutes'); // ← fixed: was "./routes/..."
const likeRoutes          = require('../routes/likeRoutes');
const commentRoutes       = require('../routes/commentRoutes');

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

console.log("✅ Allowed origins:", allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    console.log("🚫 Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth',          authRoutes);
app.use('/api',               UserRoute);
app.use('/api/posts',         postRoute);
app.use('/api/message',       sendMessageRoute);
app.use('/api/notifications', notificationRoutes);
app.use('/api/likes',         likeRoutes);
app.use('/api/comments',      commentRoutes);

app.get('/', (req, res) => res.send("API is running..."));

module.exports = app;