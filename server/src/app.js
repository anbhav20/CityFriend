const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('../routes/authRoutes');
const UserRoute  = require('../routes/userRoutes');
const postRoute  = require('../routes/postRoutes');

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
];

console.log("✅ Allowed origins:", allowedOrigins); 

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log(" Blocked by CORS:", origin); 
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth',  authRoutes);
app.use('/api',       UserRoute);
app.use('/api/posts', postRoute);

app.get('/', (req, res) => res.send("API is running..."));

module.exports = app;