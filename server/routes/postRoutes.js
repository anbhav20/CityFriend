const multer = require('multer');
const express = require('express');
const {authenticate} = require('../middlewares/authMiddleware');
const { uploadImage, getAllPosts, getUsersAllpost } = require('../controllers/postController');
const upload = multer({storage: multer.memoryStorage()})

    const postRoute = express.Router();

    postRoute.post('/upload', upload.single('image'), authenticate , uploadImage)
    postRoute.get('/feed', authenticate, getAllPosts)
    postRoute.get('/', authenticate, getUsersAllpost)

    module.exports = postRoute;