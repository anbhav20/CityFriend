const express = require('express')
const cors= require('cors')
const authRoutes = require('../routes/authRoutes')
const UserRoute= require('../routes/userRoutes')
const cookieParser = require('cookie-parser')
const postRoute = require('../routes/postRoutes')
const path= require('path')

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")))

app.use(
  cors({
    credentials: true,
    origin: true //"http://localhost:5173"
  })
);
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api', UserRoute)
app.use('/api/posts', postRoute)

app.get('/:path(*)', (req, res)=>{
  res.sendFile(path.join(__dirname, "../public/index.html"))
})


module.exports = app;