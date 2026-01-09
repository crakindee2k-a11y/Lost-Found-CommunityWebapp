const User = require('../models/User');
const Post = require('../models/Post');
const Report = require('../models/Report');
const { createNotification } = require('./notificationController');

// ============================================
// DASHBOARD STATS
// ============================================

exports.getDashboardStats = async (req, res) => {
    try {
        // Get date ranges for analytics
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            pendingVerifications,
            verifiedUsers,
            rejectedUsers,
            unverifiedUsers,
            bannedUsers,
            totalPosts,
            activePosts,
            resolvedPosts,
            lostPosts,
            foundPosts,
            pendingReports,
            totalReports,
            resolvedReports,
            newUsersToday,
            newUsersWeek,
            newPostsToday,
            newPostsWeek,
            recentUsers,
            recentPosts
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ verificationStatus: 'pending' }),
            User.countDocuments({ verificationStatus: 'verified' }),
            User.countDocuments({ verificationStatus: 'rejected' }),
            User.countDocuments({ verificationStatus: 'unverified' }),
            User.countDocuments({ isBanned: true }),
            Post.countDocuments(),
            Post.countDocuments({ status: 'active' }),
            Post.countDocuments({ status: 'resolved' }),
            Post.countDocuments({ type: 'lost' }),
            Post.countDocuments({ type: 'found' }),
            Report.countDocuments({ status: 'pending' }),
            Report.countDocuments(),
            Report.countDocuments({ status: 'resolved' }),
            User.countDocuments({ createdAt: { $gte: todayStart } }),
            User.countDocuments({ createdAt: { $gte: weekAgo } }),
            Post.countDocuments({ createdAt: { $gte: todayStart } }),
            Post.countDocuments({ createdAt: { $gte: weekAgo } }),
            User.find({ role: 'user' }).select('username email verificationStatus createdAt').sort({ createdAt: -1 }).limit(5),
            Post.find().select('title type status createdAt').populate('userId', 'username').sort({ createdAt: -1 }).limit(5)
        ]);

        res.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    pendingVerification: pendingVerifications,
                    verified: verifiedUsers,
                    rejected: rejectedUsers,
                    unverified: unverifiedUsers,
                    banned: bannedUsers,
                    newToday: newUsersToday,
                    newThisWeek: newUsersWeek
                },
                posts: {
                    total: totalPosts,
                    active: activePosts,
                    resolved: resolvedPosts,
                    lost: lostPosts,
                    found: foundPosts,
                    newToday: newPostsToday,
                    newThisWeek: newPostsWeek
                },
                reports: {
                    pending: pendingReports,
                    total: totalReports,
                    resolved: resolvedReports
                },
                recent: {
                    users: recentUsers,
                    posts: recentPosts
                }
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
};

// ============================================
// USER VERIFICATION
// ============================================

exports.getPendingVerifications = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const users = await User.find({ verificationStatus: 'pending' })
            .select('-password')
            .sort({ createdAt: 1 }) // Oldest first
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments({ verificationStatus: 'pending' });

        res.json({
            success: true,
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching pending verifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending verifications'
        });
    }
};

exports.getVerificationDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password');

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
        console.error('Error fetching verification details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching verification details'
        });
    }
};

exports.approveVerification = async (req, res) => {
    try {
        const { userId } = req.params;
        const { note } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.verificationStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'User is not pending verification'
            });
        }

        user.verificationStatus = 'verified';
        user.verifiedAt = new Date();
        user.verifiedBy = req.userId;
        user.verificationNote = note || '';
        user.rejectionReason = '';

        await user.save();

        // Send notification to user
        await createNotification({
            userId: user._id,
            type: 'verification_approved',
            title: 'Verification Approved!',
            message: note 
                ? `Your account has been verified. Note: ${note}` 
                : 'Congratulations! Your account has been verified. You now have full access to all features.',
            link: '/dashboard'
        });

        res.json({
            success: true,
            message: 'User verification approved',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verificationStatus: user.verificationStatus
            }
        });
    } catch (error) {
        console.error('Error approving verification:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving verification'
        });
    }
};

exports.rejectVerification = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.verificationStatus = 'rejected';
        user.rejectionReason = reason;
        user.verifiedBy = req.userId;

        await user.save();

        // Send notification to user
        await createNotification({
            userId: user._id,
            type: 'verification_rejected',
            title: 'Verification Rejected',
            message: `Your verification request was rejected. Reason: ${reason}. Please resubmit with valid documents.`,
            link: '/profile'
        });

        res.json({
            success: true,
            message: 'User verification rejected',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verificationStatus: user.verificationStatus
            }
        });
    } catch (error) {
        console.error('Error rejecting verification:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting verification'
        });
    }
};

// ============================================
// USER MANAGEMENT
// ============================================

exports.getAllUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search, 
            verificationStatus, 
            isBanned,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { role: 'user' };

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (verificationStatus) {
            query.verificationStatus = verificationStatus;
        }

        if (isBanned !== undefined) {
            query.isBanned = isBanned === 'true';
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const users = await User.find(query)
            .select('-password -nidFrontImage -nidBackImage -selfieImage')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password')
            .populate('verifiedBy', 'username')
            .populate('bannedBy', 'username');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's post count
        const postCount = await Post.countDocuments({ userId: user._id });

        // Get reports against this user
        const reportsAgainst = await Report.countDocuments({ reportedUserId: user._id });

        res.json({
            success: true,
            user,
            stats: {
                posts: postCount,
                reportsAgainst
            }
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user details'
        });
    }
};

exports.banUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Ban reason is required'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot ban an admin user'
            });
        }

        user.isBanned = true;
        user.banReason = reason;
        user.bannedAt = new Date();
        user.bannedBy = req.userId;

        await user.save();

        res.json({
            success: true,
            message: 'User has been banned',
            user: {
                id: user._id,
                username: user.username,
                isBanned: user.isBanned
            }
        });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({
            success: false,
            message: 'Error banning user'
        });
    }
};

exports.unbanUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isBanned = false;
        user.banReason = '';
        user.bannedAt = null;
        user.bannedBy = null;

        await user.save();

        res.json({
            success: true,
            message: 'User has been unbanned',
            user: {
                id: user._id,
                username: user.username,
                isBanned: user.isBanned
            }
        });
    } catch (error) {
        console.error('Error unbanning user:', error);
        res.status(500).json({
            success: false,
            message: 'Error unbanning user'
        });
    }
};

// ============================================
// REPORTS MANAGEMENT
// ============================================

exports.getAllReports = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status,
            reason,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        if (reason) {
            query.reason = reason;
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const reports = await Report.find(query)
            .populate('reporterId', 'username email')
            .populate('reportedUserId', 'username email')
            .populate('reportedPostId', 'title type')
            .populate('reviewedBy', 'username')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Report.countDocuments(query);

        res.json({
            success: true,
            reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reports'
        });
    }
};

exports.getReportDetails = async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId)
            .populate('reporterId', 'username email')
            .populate('reportedUserId', 'username email verificationStatus isBanned')
            .populate('reportedPostId', 'title type description location images')
            .populate('reviewedBy', 'username');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error('Error fetching report details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching report details'
        });
    }
};

exports.updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, adminNote, actionTaken } = req.body;

        const report = await Report.findById(reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        report.status = status || report.status;
        report.adminNote = adminNote || report.adminNote;
        report.actionTaken = actionTaken || report.actionTaken;
        report.reviewedBy = req.userId;
        report.reviewedAt = new Date();

        await report.save();

        res.json({
            success: true,
            message: 'Report updated successfully',
            report
        });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating report'
        });
    }
};

// ============================================
// POST MANAGEMENT
// ============================================

exports.getAllPostsAdmin = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search,
            type,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (type) {
            query.type = type;
        }

        if (status) {
            query.status = status;
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const posts = await Post.find(query)
            .populate('userId', 'username email verificationStatus')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Post.countDocuments(query);

        res.json({
            success: true,
            posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching posts'
        });
    }
};

exports.deletePostAdmin = async (req, res) => {
    try {
        const { postId } = req.params;
        const { reason } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        await Post.findByIdAndDelete(postId);

        // Log the deletion (you could create an audit log model for this)
        console.log(`Admin ${req.userId} deleted post ${postId}. Reason: ${reason || 'Not specified'}`);

        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting post'
        });
    }
};
