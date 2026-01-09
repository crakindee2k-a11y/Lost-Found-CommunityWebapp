const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// Helper to check verification status
const checkVerification = async (userId) => {
    const user = await User.findById(userId).select('verificationStatus');
    if (!user || user.verificationStatus !== 'verified') {
        const messages = {
            'rejected': 'Your verification was rejected. Please resubmit your documents.',
            'pending': 'Your verification is pending. Please wait for approval.',
            'unverified': 'You need to be a verified user to do this. Please submit your verification documents.'
        };
        return {
            allowed: false,
            message: messages[user?.verificationStatus] || messages.unverified
        };
    }
    return { allowed: true };
};

// Get comments for a post
exports.getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        
        // Fetch all comments for this post in a single query (avoiding N+1)
        const allComments = await Comment.find({ postId })
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .lean();

        // Separate parent comments and replies
        const parentComments = [];
        const repliesMap = new Map();

        allComments.forEach(comment => {
            if (comment.parentCommentId === null) {
                parentComments.push({ ...comment, replies: [] });
            } else {
                const parentId = comment.parentCommentId.toString();
                if (!repliesMap.has(parentId)) {
                    repliesMap.set(parentId, []);
                }
                repliesMap.get(parentId).push(comment);
            }
        });

        // Attach replies to their parent comments
        parentComments.forEach(comment => {
            const replies = repliesMap.get(comment._id.toString()) || [];
            // Sort replies by createdAt ascending
            comment.replies = replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });

        res.json({
            success: true,
            comments: parentComments
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comments'
        });
    }
};

// Create a comment
exports.createComment = async (req, res) => {
    try {
        // Check if user is verified
        const verification = await checkVerification(req.userId);
        if (!verification.allowed) {
            return res.status(403).json({
                success: false,
                message: verification.message,
                requiresVerification: true
            });
        }

        const { postId, content, parentCommentId } = req.body;

        const comment = new Comment({
            postId,
            userId: req.userId,
            content,
            parentCommentId: parentCommentId || null
        });

        await comment.save();
        await comment.populate('userId', 'username email');

        // Create notification for post owner or parent comment owner
        try {
            const post = await Post.findById(postId).populate('userId', 'username');
            
            if (parentCommentId) {
                // This is a reply - notify the parent comment owner
                const parentComment = await Comment.findById(parentCommentId);
                if (parentComment && parentComment.userId.toString() !== req.userId) {
                    await createNotification({
                        userId: parentComment.userId,
                        type: 'reply',
                        title: 'New Reply',
                        message: `${comment.userId.username} replied to your comment`,
                        fromUserId: req.userId,
                        postId: postId,
                        commentId: comment._id,
                        link: `/post/${postId}`
                    });
                }
            } else if (post && post.userId._id.toString() !== req.userId) {
                // This is a new comment - notify the post owner
                await createNotification({
                    userId: post.userId._id,
                    type: 'comment',
                    title: 'New Comment',
                    message: `${comment.userId.username} commented on your post "${post.title}"`,
                    fromUserId: req.userId,
                    postId: postId,
                    commentId: comment._id,
                    link: `/post/${postId}`
                });
            }
        } catch (notifError) {
            console.error('Error creating notification:', notifError);
            // Don't fail the comment creation if notification fails
        }

        res.status(201).json({
            success: true,
            message: 'Comment posted successfully',
            comment
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map(e => e.message).join(', ')
            });
        }

        console.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating comment'
        });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user owns the comment
        if (comment.userId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        // Delete comment and its replies
        await Comment.deleteMany({ 
            $or: [
                { _id: comment._id },
                { parentCommentId: comment._id }
            ]
        });

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment'
        });
    }
};
