const express = require('express')
const cors= require('cors')
const authRoutes = require('../routes/authRoutes')
const UserRoute= require('../routes/userRoutes')
const cookieParser = require('cookie-parser')
const postRoute = require('../routes/postRoutes')

const app = express();
app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173"
  })
);
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api', UserRoute)
app.use('/api/posts', postRoute)


module.exports = app;