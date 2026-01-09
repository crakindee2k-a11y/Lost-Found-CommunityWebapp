import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, userAPI } from '../services/api';
import { useToast } from '../components/common/ToastContainer';
import PostList from '../components/posts/PostList';
import MessageModal from '../components/messages/MessageModal';
import { SkeletonPost, SkeletonStats } from '../components/common/SkeletonLoader';
import './UserProfile.css';

const UserProfile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { showError } = useToast();
    
    const [profileUser, setProfileUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMessageModal, setShowMessageModal] = useState(false);

    // If viewing own profile, redirect to /profile
    useEffect(() => {
        if (currentUser && (currentUser.id === userId || currentUser._id === userId)) {
            navigate('/profile');
        }
    }, [currentUser, userId, navigate]);

    useEffect(() => {
        fetchUserProfile();
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);

            const [userResponse, postsResponse, statsResponse] = await Promise.all([
                userAPI.getProfile(userId),
                postAPI.getUserPosts(userId),
                userAPI.getStats(userId)
            ]);

            if (userResponse.data.success) {
                setProfileUser(userResponse.data.user);
            }

            if (postsResponse.data.success) {
                setUserPosts(postsResponse.data.posts || []);
            }

            if (statsResponse.data.success) {
                setStats(statsResponse.data.stats);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            showError('Error loading user profile');
        } finally {
            setLoading(false);
        }
    };

    const getSuccessRate = () => {
        if (!stats || stats.totalPosts === 0) return 0;
        return Math.round((stats.resolvedPosts / stats.totalPosts) * 100);
    };

    if (loading) {
        return (
            <div className="user-profile-page">
                <div className="profile-header">
                    <SkeletonStats />
                </div>
                <SkeletonPost />
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="user-profile-page">
                <div className="error-container">
                    <h2>User not found</h2>
                    <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-profile-page">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="user-info-section">
                    <div className="user-avatar-large">
                        {profileUser.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                        <h1>{profileUser.username}</h1>
                        <p className="member-since">
                            📅 Member since {new Date(profileUser.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                        
                        {currentUser && (
                            <button 
                                className="message-user-btn"
                                onClick={() => setShowMessageModal(true)}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                Send Message
                            </button>
                        )}
                    </div>
                </div>

                {stats && (
                    <div className="user-stats-public">
                        <div className="stat-card-public">
                            <div className="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.totalPosts}</span>
                                <span className="stat-label">Posts</span>
                            </div>
                        </div>
                        <div className="stat-card-public">
                            <div className="stat-icon resolved">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.resolvedPosts}</span>
                                <span className="stat-label">Resolved</span>
                            </div>
                        </div>
                        <div className="stat-card-public success">
                            <div className="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{getSuccessRate()}%</span>
                                <span className="stat-label">Success</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* User's Posts */}
            <div className="user-posts-section">
                <h2>{profileUser.username}'s Posts</h2>
                <PostList
                    posts={userPosts}
                    loading={false}
                    emptyMessage={`${profileUser.username} hasn't created any posts yet`}
                />
            </div>

            {/* Message Modal */}
            {showMessageModal && (
                <MessageModal
                    receiverId={profileUser._id}
                    receiverName={profileUser.username}
                    onClose={() => setShowMessageModal(false)}
                />
            )}
        </div>
    );
};

export default UserProfile;

