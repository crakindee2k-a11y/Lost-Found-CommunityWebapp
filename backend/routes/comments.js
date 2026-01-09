const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

// Get comments for a post
router.get('/post/:postId', commentController.getPostComments);

// Create a comment (protected)
router.post('/', auth, commentController.createComment);

// Delete a comment (protected)
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;








