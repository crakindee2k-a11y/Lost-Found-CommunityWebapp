const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user profile'
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        // Remove password from update data
        const { password, ...updateData } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
};

// Change user password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Get user with password field
        const user = await User.findById(req.userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password using model method
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Set new password (pre-save hook will hash it)
        user.password = newPassword;

        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error changing password'
        });
    }
};

// Get user stats (posts count, etc.)
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId;

        const [activePosts, resolvedPosts, totalPosts] = await Promise.all([
            Post.countDocuments({ userId, status: 'active' }),
            Post.countDocuments({ userId, status: 'resolved' }),
            Post.countDocuments({ userId })
        ]);

        res.json({
            success: true,
            stats: {
                activePosts,
                resolvedPosts,
                totalPosts
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user stats'
        });
    }
};

// Submit verification documents
exports.submitVerification = async (req, res) => {
    try {
        const { nidFrontImage, nidBackImage, selfieImage } = req.body;

        // Validate all documents are provided
        if (!nidFrontImage || !nidBackImage || !selfieImage) {
            return res.status(400).json({
                success: false,
                message: 'All verification documents are required (NID front, NID back, and selfie)'
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already verified
        if (user.verificationStatus === 'verified') {
            return res.status(400).json({
                success: false,
                message: 'Your account is already verified'
            });
        }

        // Check if already pending
        if (user.verificationStatus === 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Your verification is already pending review'
            });
        }

        // Update user with verification documents
        user.nidFrontImage = nidFrontImage;
        user.nidBackImage = nidBackImage;
        user.selfieImage = selfieImage;
        user.verificationStatus = 'pending';
        user.rejectionReason = ''; // Clear any previous rejection reason

        await user.save();

        res.json({
            success: true,
            message: 'Verification documents submitted successfully. Your account is pending review.',
            verificationStatus: user.verificationStatus
        });
    } catch (error) {
        console.error('Error submitting verification:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting verification documents'
        });
    }
};

// Get verification status
exports.getVerificationStatus = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('verificationStatus rejectionReason verifiedAt');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            verificationStatus: user.verificationStatus,
            rejectionReason: user.rejectionReason,
            verifiedAt: user.verifiedAt
        });
    } catch (error) {
        console.error('Error fetching verification status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching verification status'
        });
    }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            // Delete uploaded file if user not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete old avatar if exists
        if (user.avatar) {
            const oldAvatarPath = path.join(__dirname, '..', user.avatar.replace(/^\//, ''));
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Set new avatar URL
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        user.avatar = avatarUrl;
        await user.save();

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            avatar: avatarUrl
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error uploading avatar'
        });
    }
};

// Delete avatar
exports.deleteAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete avatar file if exists
        if (user.avatar) {
            const avatarPath = path.join(__dirname, '..', user.avatar.replace(/^\//, ''));
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }
        }

        user.avatar = '';
        await user.save();

        res.json({
            success: true,
            message: 'Avatar removed successfully'
        });
    } catch (error) {
        console.error('Error deleting avatar:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing avatar'
        });
    }
};