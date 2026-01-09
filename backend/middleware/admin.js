const User = require('../models/User');

/**
 * Admin middleware - checks if user is authenticated and has admin role
 * Must be used AFTER the auth middleware
 */
const admin = async (req, res, next) => {
    try {
        // Check if user exists (should be set by auth middleware)
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user and check role
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended'
            });
        }

        // Attach admin user to request
        req.admin = user;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authorization'
        });
    }
};

/**
 * Check if user is verified
 * For routes that require verified users only
 */
const verified = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended'
            });
        }

        if (user.verificationStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: 'Account verification required to access this feature',
                verificationStatus: user.verificationStatus
            });
        }

        next();
    } catch (error) {
        console.error('Verification middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during verification check'
        });
    }
};

module.exports = { admin, verified };
