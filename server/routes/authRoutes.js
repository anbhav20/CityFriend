const express =require('express')
const {login, signup, logout, getMe, refresh, oauthLogin} = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/signup',signup);
router.post('/login', login)
router.post('/oauth', oauthLogin)
router.post('/logout', logout)
router.get('/me', authenticate, getMe)
router.post('/refresh', refresh);


module.exports= router
