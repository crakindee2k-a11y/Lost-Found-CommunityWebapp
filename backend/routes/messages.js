const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// All message routes require authentication
router.use(auth);

// Get all conversations
router.get('/conversations', messageController.getConversations);

// Get messages with a specific user
router.get('/user/:userId', messageController.getMessages);

// Send a message
router.post('/', messageController.sendMessage);

// Delete a message
router.delete('/:id', messageController.deleteMessage);

// Get unread message count
router.get('/unread/count', messageController.getUnreadCount);

module.exports = router;




