const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get user notifications
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all as read
router.put('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
