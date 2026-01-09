const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            'comment',           // Someone commented on your post
            'reply',             // Someone replied to your comment
            'verification_approved',
            'verification_rejected',
            'post_resolved',     // Your post was marked as resolved
            'system'             // System notifications
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    // Related entities
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    // Status
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    // Link to navigate to when clicked
    link: {
        type: String
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Auto-delete old notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
