const express = require('express');
//const authMiddleware = require('../middlewares/authMiddleware');
const { allusers, getUserProfile, getUsersByCity, followUser, unfollowUser, getFollowers, getFollowings } = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');

const UserRoute = express.Router();

UserRoute.get('/users', authenticate, allusers )
UserRoute.get('/:username', authenticate, getUserProfile)
UserRoute.get('/users/city', authenticate, getUsersByCity)
UserRoute.post('/:id/follow', authenticate, followUser)
UserRoute.delete('/:id/unfollow', authenticate, unfollowUser)
UserRoute.get('/:id/followers', authenticate, getFollowers);
UserRoute.get('/:id/followings', authenticate, getFollowings);

module.exports = UserRoute