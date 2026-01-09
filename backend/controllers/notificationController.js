const Notification = require('../models/Notification');

// Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const skip = (page - 1) * limit;

        const filter = { userId: req.user._id };
        if (unreadOnly === 'true') {
            filter.read = false;
        }

        const notifications = await Notification.find(filter)
            .populate('fromUserId', 'username')
            .populate('postId', 'title type')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({ 
            userId: req.user._id, 
            read: false 
        });

        res.json({
            success: true,
            notifications,
            unreadCount,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user._id,
            read: false
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count'
        });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { read: true }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all as read'
        });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification'
        });
    }
};

// Helper function to create notifications (used by other controllers)
exports.createNotification = async ({
    userId,
    type,
    title,
    message,
    fromUserId = null,
    postId = null,
    commentId = null,
    link = null
}) => {
    try {
        // Don't notify yourself
        if (fromUserId && userId.toString() === fromUserId.toString()) {
            return null;
        }

        const notification = new Notification({
            userId,
            type,
            title,
            message,
            fromUserId,
            postId,
            commentId,
            link
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};
