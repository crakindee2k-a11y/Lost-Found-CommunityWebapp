const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Optional auth middleware - attaches user info if token present, but doesn't fail if not
 * Use for public routes where we want to know if user is logged in
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            const secret = process.env.JWT_SECRET || (
                process.env.NODE_ENV === 'production' ? '' : 'dev-secret-key-CHANGE-IN-PRODUCTION'
            );
            if (!secret) return next();
            const decoded = jwt.verify(token, secret);
            const user = await User.findById(decoded.userId).select('-password');

            if (user && !user.isBanned) {
                req.user = user;
                req.userId = decoded.userId;
            }
        }
        next();
    } catch (error) {
        // Token invalid or expired - just continue without user info
        next();
    }
};

/**
 * Required auth middleware - fails if no valid token
 */
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const secret = process.env.JWT_SECRET || (
            process.env.NODE_ENV === 'production' ? '' : 'dev-secret-key-CHANGE-IN-PRODUCTION'
        );
        if (!secret) {
            return res.status(500).json({
                success: false,
                message: 'Server misconfiguration: JWT_SECRET is not set.'
            });
        }
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        req.user = user;
        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
};

module.exports = auth;
module.exports.optionalAuth = optionalAuth;