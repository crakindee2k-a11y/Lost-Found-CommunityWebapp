import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserAvatar from '../common/UserAvatar';
import { CATEGORIES } from '../../utils/constants';
import './PostItem.css';

const PostItem = React.memo(({ post }) => {
    const navigate = useNavigate();
    const getCategoryLabel = (categoryValue) => {
        const category = CATEGORIES.find(cat => cat.value === categoryValue);
        return category ? category.label : categoryValue;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return formatDate(dateString);
    };

    const handlePostClick = () => {
        navigate(`/post/${post._id}`);
    };

    return (
        <div 
            className={`post-item ${post.type} ${post.status === 'resolved' ? 'resolved-post' : ''}`}
            onClick={handlePostClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handlePostClick();
                }
            }}
        >
            {/* Category badge positioned at top right */}
            <span className="post-category-corner">
                {getCategoryLabel(post.category)}
            </span>
            
            <div className="post-header">
                <div className="post-badges-row">
                    <span className={`post-type-badge ${post.type}`}>
                        {post.type === 'lost' ? 'LOST' : 'FOUND'}
                    </span>
                    {post.status === 'resolved' && (
                        <span className="post-status-badge resolved">
                            ✓ RESOLVED
                        </span>
                    )}
                    <span className={`post-time-ago ${post.type}`}>
                        • {getTimeAgo(post.createdAt)}
                    </span>
                </div>
            </div>

            <h3 className="post-title">
                {post.title}
            </h3>

            <p className="post-description">
                {post.description.length > 150
                    ? `${post.description.substring(0, 150)}...`
                    : post.description
                }
            </p>

            {post.images && post.images.length > 0 && (
                <div className={`post-images count-${Math.min(post.images.length, 4)}`}>
                    {post.images.slice(0, 4).map((img, index) => (
                        <div 
                            key={index} 
                            className="post-image-thumb"
                            style={{ backgroundImage: `url(${img})` }}
                        >
                            <img 
                                src={img} 
                                alt={`${post.title} - ${index + 1}`} 
                                loading="lazy"
                            />
                            {index === 3 && post.images.length > 4 && (
                                <div className="more-images-overlay">
                                    +{post.images.length - 4}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="post-footer">
                <div className="post-location">
                    📍 {post.location.address}
                </div>

                <div className="post-meta">
                    <Link 
                        to={`/user/${post.userId?._id || post.userId}`} 
                        className="post-author clickable-username"
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <UserAvatar 
                            user={post.userId} 
                            size="small" 
                            showStatus={true}
                        />
                        <span>By {post.userId?.username || 'Unknown'}</span>
                    </Link>
                    <span className="post-created">
                        {formatDate(post.createdAt)}
                    </span>
                </div>
            </div>

            {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                    {post.tags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                    ))}
                </div>
            )}
        </div>
    );
});

export default PostItem;