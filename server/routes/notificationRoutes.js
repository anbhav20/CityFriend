const express = require("express");
const router  = express.Router();
const {authenticate} = require("../middlewares/authMiddleware"); // your existing auth middleware
const {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
  deleteNotification,
  clearAll,
  subscribePush,
  unsubscribePush,
} = require("../controllers/notificationController");

router.use(authenticate); 

router.get(   "/",                 getNotifications);
router.get(   "/count",            getUnreadCount);
router.patch( "/read-all",         markAllRead);
router.patch( "/:id/read",         markOneRead);
router.delete("/:id",              deleteNotification);
router.delete("/",                 clearAll);
router.post(  "/subscribe",        subscribePush);
router.delete("/subscribe",        unsubscribePush);

module.exports = router;