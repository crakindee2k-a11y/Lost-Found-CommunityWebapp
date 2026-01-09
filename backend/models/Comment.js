const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'Post ID is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    }
}, {
    timestamps: true
});

// Index for performance
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentCommentId: 1 }); // For efficient reply lookups

module.exports = mongoose.model('Comment', commentSchema);




