import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, commentAPI } from '../services/api';
import { useToast } from '../components/common/ToastContainer';
import CommentSection from '../components/posts/CommentSection';
import MessageModal from '../components/messages/MessageModal';
import ImageModal from '../components/common/ImageModal';
import ReportModal from '../components/common/ReportModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserAvatar from '../components/common/UserAvatar';
import './PostDetail.css';

const PostDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await postAPI.getById(id);
            
            if (response.data.success) {
                setPost(response.data.post);
            }
        } catch (error) {
            showError('Error loading post');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleContactOwner = () => {
        if (!user) {
            showError('Please login to contact the post owner');
            navigate('/login');
            return;
        }
        setShowMessageModal(true);
    };

    const handleImageClick = (index) => {
        setCurrentImageIndex(index);
        setShowImageModal(true);
    };

    const handleImageNavigate = (direction) => {
        if (direction === 'prev' && currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        } else if (direction === 'next' && currentImageIndex < post.images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const handleEditPost = () => {
        navigate(`/edit-post/${post._id}`, { state: { post } });
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            await postAPI.delete(post._id);
            showSuccess('Post deleted successfully');
            navigate('/dashboard');
        } catch (error) {
            showError('Failed to delete post');
        }
    };

    const handleMarkResolved = async () => {
        try {
            const newStatus = post.status === 'resolved' ? 'active' : 'resolved';
            await postAPI.update(post._id, { status: newStatus });
            showSuccess(newStatus === 'resolved' ? 'Post marked as resolved!' : 'Post marked as active!');
            fetchPost(); // Refresh the post
        } catch (error) {
            showError('Failed to update post status');
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading post..." />;
    }

    if (!post) {
        return (
            <div className="post-detail-page">
                <div className="error-container">
                    <h2>Post not found</h2>
                    <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                </div>
            </div>
        );
    }

    const isOwner = user && (user.id === post.userId?._id || user._id === post.userId?._id);

    return (
        <>
            <div className="post-detail-page">
                <div className="post-detail-container">
                    {/* Main Content - Left Column */}
                    <div className="post-main-content">
                    {/* Post Header */}
                    <div className="post-detail-header">
                    <div className="header-badges">
                        <span className={`post-type-badge ${post.type}`}>
                            {post.type === 'lost' ? 'LOST' : 'FOUND'}
                        </span>
                        <span className="post-category-badge">
                            {post.category}
                        </span>
                        <span className={`status-badge ${post.status}`}>
                            {post.status}
                        </span>
                    </div>
                    
                    <h1 className="post-detail-title">{post.title}</h1>
                    
                    <div className="post-meta-info">
                        <Link 
                        to={`/user/${post.userId?._id || post.userId}`}
                        className="post-author-info"
                    >
                            <div className="author-avatar-wrapper">
                                <UserAvatar 
                                    user={post.userId} 
                                    size="medium" 
                                    showBadge={true}
                                />
                            </div>
                            <div>
                                <p className="author-name">Posted by {post.userId?.username || 'Unknown'}</p>
                                <p className="post-date">
                                    {formatDate(post.createdAt)}
                                </p>
                            </div>
                        </Link>

                        {!isOwner && user && (
                            <div className="non-owner-actions">
                                <button className="contact-btn" onClick={handleContactOwner}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                    Contact Owner
                                </button>
                                <button className="report-btn" onClick={() => setShowReportModal(true)} title="Report this post">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                                        <line x1="4" y1="22" x2="4" y2="15"></line>
                                    </svg>
                                </button>
                            </div>
                        )}
                        
                        {isOwner && (
                            <div className="owner-actions">
                                <button 
                                    className={post.status === 'resolved' ? 'unresolve-btn' : 'resolve-btn'} 
                                    onClick={handleMarkResolved}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    {post.status === 'resolved' ? 'Mark as Active' : 'Mark as Resolved'}
                                </button>
                                <button className="edit-post-btn" onClick={handleEditPost}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    Edit
                                </button>
                                <button className="delete-post-btn" onClick={handleDeletePost}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Post Images - MAIN FOCUS */}
                {post.images && post.images.length > 0 && (
                    <div className="post-images-gallery">
                        <div className={`images-grid ${
                            post.images.length === 1 ? 'single-image' :
                            post.images.length === 2 ? 'two-images' :
                            post.images.length === 3 ? 'three-images' :
                            post.images.length === 4 ? 'four-images' :
                            'five-images'
                        }`}>
                            {post.images.map((img, index) => (
                                <div 
                                    key={index} 
                                    className="gallery-image"
                                    onClick={() => handleImageClick(index)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleImageClick(index);
                                        }
                                    }}
                                >
                                    <img src={img} alt={`${post.title} - ${index + 1}`} />
                                    <div className="gallery-image-overlay">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 3 21 3 21 9"></polyline>
                                            <polyline points="9 21 3 21 3 15"></polyline>
                                            <line x1="21" y1="3" x2="14" y2="10"></line>
                                            <line x1="3" y1="21" x2="10" y2="14"></line>
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Post Content - Compact */}
                <div className="post-detail-content">
                    <div className="detail-section">
                        <h3>Description</h3>
                        <p className="description-text">{post.description}</p>
                    </div>

                    <div className="detail-section">
                        <h3>Details</h3>
                        <div className="details-grid">
                            <div className="detail-item">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <div>
                                    <span className="detail-label">Location</span>
                                    <span className="detail-value">{post.location.address}</span>
                                </div>
                            </div>
                            
                            <div className="detail-item">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <div>
                                    <span className="detail-label">Date {post.type === 'lost' ? 'Lost' : 'Found'}</span>
                                    <span className="detail-value">
                                        {formatDate(post.type === 'lost' ? post.dateLost : post.dateFound)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                        <div className="detail-section">
                            <h3>Tags</h3>
                            <div className="tags-list">
                                {post.tags.map((tag, index) => (
                                    <span key={index} className="tag">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar - Comments */}
            <div className="post-detail-sidebar">
                <CommentSection postId={post._id} />
            </div>
        </div>
        </div>

            {/* Message Modal */}
            {showMessageModal && (
                <MessageModal
                    receiverId={post.userId?._id || post.userId}
                    receiverName={post.userId?.username}
                    postId={post._id}
                    postTitle={post.title}
                    onClose={() => setShowMessageModal(false)}
                />
            )}

            {/* Image Modal */}
            {showImageModal && post.images && (
                <ImageModal
                    image={post.images[currentImageIndex]}
                    images={post.images}
                    currentIndex={currentImageIndex}
                    onClose={() => setShowImageModal(false)}
                    onNavigate={handleImageNavigate}
                />
            )}

            {/* Report Modal */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                targetType="post"
                targetId={post._id}
                targetName={post.title}
            />
        </>
    );
};

export default PostDetail;


