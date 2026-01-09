import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, userAPI } from '../services/api';
import { useToast } from '../components/common/ToastContainer';
import PostList from '../components/posts/PostList';
import MessageModal from '../components/messages/MessageModal';
import ReportModal from '../components/common/ReportModal';
import { SkeletonPost, SkeletonStats } from '../components/common/SkeletonLoader';
import UserAvatar from '../components/common/UserAvatar';
import './PublicProfile.css';

const PublicProfile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { showError } = useToast();
    
    const [user, setUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            
            const [userResponse, postsResponse, statsResponse] = await Promise.all([
                userAPI.getProfile(userId),
                postAPI.getUserPosts(userId),
                userAPI.getStats(userId)
            ]);

            if (userResponse.data.success) {
                setUser(userResponse.data.user);
            }

            if (postsResponse.data.success) {
                setUserPosts(postsResponse.data.posts || []);
            }

            if (statsResponse.data.success) {
                setStats(statsResponse.data.stats);
            }
        } catch (error) {
            showError('Error loading user profile');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const isOwnProfile = currentUser && (currentUser.id === userId || currentUser._id === userId);

    if (loading) {
        return (
            <div className="public-profile-page">
                <div className="profile-header">
                    <SkeletonStats />
                </div>
                <div className="profile-posts">
                    <SkeletonPost />
                    <SkeletonPost />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="public-profile-page">
                <div className="error-container">
                    <h2>User not found</h2>
                    <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                </div>
            </div>
        );
    }

    const getSuccessRate = () => {
        if (!stats || stats.totalPosts === 0) return 0;
        return Math.round((stats.resolvedPosts / stats.totalPosts) * 100);
    };

    return (
        <div className="public-profile-page">
            {/* Profile Header */}
            <div className="public-profile-header">
                <div className="user-info-section">
                    <div className="user-avatar-large-wrapper">
                        <UserAvatar user={user} size="xlarge" showStatus={true} />
                    </div>
                    <div className="user-details">
                        <h1 className="username-with-badge">
                            {user.username}
                            {user.verificationStatus === 'verified' && (
                                <span className="verified-badge-large" title="Verified User">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#06b6d4" stroke="#06b6d4" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01" fill="none" stroke="white" strokeWidth="2.5"></polyline>
                                    </svg>
                                </span>
                            )}
                        </h1>
                        <p className="member-since">
                            Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                        
                        {!isOwnProfile && currentUser && (
                            <div className="profile-action-buttons">
                                <button 
                                    className="message-user-btn"
                                    onClick={() => setShowMessageModal(true)}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                    Send Message
                                </button>
                                <button 
                                    className="report-user-btn"
                                    onClick={() => setShowReportModal(true)}
                                    title="Report User"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                                        <line x1="4" y1="22" x2="4" y2="15"></line>
                                    </svg>
                                </button>
                            </div>
                        )}
                        
                        {isOwnProfile && (
                            <button 
                                className="edit-profile-link"
                                onClick={() => navigate('/profile')}
                            >
                                Edit Profile →
                            </button>
                        )}
                    </div>
                </div>

                {stats && (
                    <div className="public-stats">
                        <div className="pub-stat-card">
                            <span className="pub-stat-value">{stats.totalPosts}</span>
                            <span className="pub-stat-label">Posts</span>
                        </div>
                        <div className="pub-stat-card">
                            <span className="pub-stat-value">{stats.resolvedPosts}</span>
                            <span className="pub-stat-label">Resolved</span>
                        </div>
                        <div className="pub-stat-card">
                            <span className="pub-stat-value">{getSuccessRate()}%</span>
                            <span className="pub-stat-label">Success</span>
                        </div>
                    </div>
                )}
            </div>

            {/* User Posts */}
            <div className="public-profile-posts">
                <h2>{isOwnProfile ? 'Your Posts' : `${user.username}'s Posts`}</h2>
                <PostList
                    posts={userPosts}
                    loading={false}
                    emptyMessage={`${isOwnProfile ? 'You haven\'t' : 'This user hasn\'t'} created any posts yet`}
                />
            </div>

            {/* Message Modal */}
            {showMessageModal && (
                <MessageModal
                    receiverId={user._id}
                    receiverName={user.username}
                    onClose={() => setShowMessageModal(false)}
                />
            )}

            {/* Report Modal */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                targetType="user"
                targetId={user._id}
                targetName={user.username}
            />
        </div>
    );
};

export default PublicProfile;







