const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// All admin routes require authentication + admin role
router.use(auth);
router.use(admin);

// Dashboard
router.get('/stats', adminController.getDashboardStats);

// Verification Management
router.get('/verifications/pending', adminController.getPendingVerifications);
router.get('/verifications/:userId', adminController.getVerificationDetails);
router.put('/verifications/:userId/approve', adminController.approveVerification);
router.put('/verifications/:userId/reject', adminController.rejectVerification);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId/ban', adminController.banUser);
router.put('/users/:userId/unban', adminController.unbanUser);

// Reports Management
router.get('/reports', adminController.getAllReports);
router.get('/reports/:reportId', adminController.getReportDetails);
router.put('/reports/:reportId', adminController.updateReportStatus);

// Post Management
router.get('/posts', adminController.getAllPostsAdmin);
router.delete('/posts/:postId', adminController.deletePostAdmin);

module.exports = router;
