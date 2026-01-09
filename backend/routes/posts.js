const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');

// Public routes (with optional auth for censoring logic)
router.get('/', optionalAuth, postController.getAllPosts);
router.get('/:id', optionalAuth, postController.getPostById);
router.get('/user/:userId', optionalAuth, postController.getUserPosts);

// Protected routes (require auth)
router.post('/', auth, postController.createPost);
router.put('/:id', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);

module.exports = router;