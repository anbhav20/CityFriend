const express =require('express')
const {login, signup, logout, getMe, refresh} = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/signup',signup);
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authenticate, getMe)
router.post('/auth/refresh', refresh);


module.exports= router