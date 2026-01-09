const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

// Public routes
router.get('/:id', userController.getUserProfile);
router.get('/:userId/stats', userController.getUserStats);

// Protected routes
router.put('/profile', auth, userController.updateProfile);
router.put('/change-password', auth, userController.changePassword);

// Avatar routes
router.post('/avatar', auth, uploadAvatar, userController.uploadAvatar);
router.delete('/avatar', auth, userController.deleteAvatar);

// Verification routes
router.get('/verification/status', auth, userController.getVerificationStatus);
router.post('/verification/submit', auth, userController.submitVerification);

module.exports = router;