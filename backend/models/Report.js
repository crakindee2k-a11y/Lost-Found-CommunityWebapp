const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    // Reporter info
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Reporter ID is required']
    },
    // What's being reported (either a user or a post)
    reportedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reportedPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: null
    },
    // Report details
    reason: {
        type: String,
        required: [true, 'Report reason is required'],
        enum: [
            'fake_post',
            'scam',
            'inappropriate_content',
            'harassment',
            'spam',
            'stolen_item',
            'false_claim',
            'impersonation',
            'other'
        ]
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    // Evidence (optional screenshots/images)
    evidence: [{
        type: String
    }],
    // Report status
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
        default: 'pending'
    },
    // Admin handling
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    adminNote: {
        type: String,
        default: ''
    },
    actionTaken: {
        type: String,
        enum: ['none', 'warning', 'post_removed', 'user_banned', 'other'],
        default: 'none'
    }
}, {
    timestamps: true
});

// Indexes
reportSchema.index({ status: 1 });
reportSchema.index({ reporterId: 1 });
reportSchema.index({ reportedUserId: 1 });
reportSchema.index({ reportedPostId: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
