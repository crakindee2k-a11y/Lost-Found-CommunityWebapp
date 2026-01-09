import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { commentAPI } from '../../services/api';
import { useToast } from '../common/ToastContainer';
import UserAvatar from '../common/UserAvatar';
import './CommentSection.css';

const CommentSection = ({ postId }) => {
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await commentAPI.getPostComments(postId);
            
            if (response.data.success) {
                setComments(response.data.comments || []);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        
        if (!user) {
            showError('Please login to comment');
            return;
        }

        if (!newComment.trim()) return;

        try {
            const response = await commentAPI.create({
                postId,
                content: newComment,
                parentCommentId: null
            });

            if (response.data.success) {
                setComments([response.data.comment, ...comments]);
                setNewComment('');
                showSuccess('Comment posted!');
            }
        } catch (error) {
            showError('Error posting comment');
        }
    };

    const handleSubmitReply = async (parentCommentId) => {
        if (!user) {
            showError('Please login to reply');
            return;
        }

        if (!replyContent.trim()) return;

        try {
            const response = await commentAPI.create({
                postId,
                content: replyContent,
                parentCommentId
            });

            if (response.data.success) {
                // Update the parent comment with the new reply
                setComments(comments.map(comment => {
                    if (comment._id === parentCommentId) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), response.data.comment]
                        };
                    }
                    return comment;
                }));
                setReplyContent('');
                setReplyingTo(null);
                showSuccess('Reply posted!');
            }
        } catch (error) {
            showError('Error posting reply');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            await commentAPI.delete(commentId);
            setComments(comments.filter(c => c._id !== commentId));
            showSuccess('Comment deleted');
        } catch (error) {
            showError('Error deleting comment');
        }
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="comment-section">
            <h3 className="comment-section-title">
                Comments ({comments.length})
            </h3>

            {/* Comment Input */}
            {user ? (
                <form className="comment-form" onSubmit={handleSubmitComment}>
                    <div className="comment-avatar-wrapper">
                        <UserAvatar user={user} size="medium" />
                    </div>
                    <div className="comment-input-wrapper">
                        <textarea
                            className="comment-input"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts or information..."
                            rows="3"
                            maxLength="500"
                        />
                        <div className="comment-actions">
                            <span className="char-count">{newComment.length}/500</span>
                            <button 
                                type="submit" 
                                className="post-comment-btn"
                                disabled={!newComment.trim()}
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="login-prompt">
                    <p>Please login to leave a comment</p>
                </div>
            )}

            {/* Comments List */}
            <div className="comments-list">
                {loading ? (
                    <div className="loading-comments">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="no-comments">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="comment-item">
                            <div className="comment-avatar-wrapper">
                                <UserAvatar user={comment.userId} size="medium" showStatus={true} />
                            </div>
                            <div className="comment-content">
                                <div className="comment-header">
                                    <Link 
                                        to={`/user/${comment.userId?._id}`}
                                        className="comment-author clickable-username"
                                    >
                                        {comment.userId?.username || 'Unknown'}
                                    </Link>
                                    <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="comment-text">{comment.content}</p>
                                <div className="comment-footer">
                                    <button 
                                        className="reply-btn"
                                        onClick={() => setReplyingTo(comment._id)}
                                    >
                                        Reply
                                    </button>
                                    {user && (user.id === comment.userId?._id || user._id === comment.userId?._id) && (
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteComment(comment._id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>

                                {/* Reply Form */}
                                {replyingTo === comment._id && (
                                    <div className="reply-form">
                                        <textarea
                                            className="reply-input"
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Write your reply..."
                                            rows="3"
                                            maxLength="500"
                                            autoFocus
                                        />
                                        <div className="reply-actions">
                                            <button 
                                                onClick={() => {
                                                    setReplyingTo(null);
                                                    setReplyContent('');
                                                }}
                                                className="cancel-reply-btn"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={() => handleSubmitReply(comment._id)}
                                                className="submit-reply-btn"
                                                disabled={!replyContent.trim()}
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="replies-list">
                                        {comment.replies.map((reply) => (
                                            <div key={reply._id} className="reply-item">
                                                <div className="comment-avatar-wrapper">
                                                    <UserAvatar user={reply.userId} size="small" showStatus={true} />
                                                </div>
                                                <div className="reply-content">
                                                    <div className="comment-header">
                                                        <Link 
                                                            to={`/user/${reply.userId?._id}`}
                                                            className="comment-author clickable-username"
                                                        >
                                                            {reply.userId?.username || 'Unknown'}
                                                        </Link>
                                                        <span className="comment-time">{formatTimeAgo(reply.createdAt)}</span>
                                                    </div>
                                                    <p className="comment-text">{reply.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;


