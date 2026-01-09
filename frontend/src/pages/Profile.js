import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, userAPI } from '../services/api';
import { useToast } from '../components/common/ToastContainer';
import PostList from '../components/posts/PostList';
import { SkeletonPost, SkeletonStats } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import UserAvatar from '../components/common/UserAvatar';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    
    const [userPosts, setUserPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [postFilter, setPostFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        username: '',
        email: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                email: user.email || ''
            });
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError('');

            // Use user.id or user._id depending on your auth context
            const userId = user?.id || user?._id;
            
            if (!userId) {
                console.error('No user ID found:', user);
                setError('User ID not found');
                setLoading(false);
                return;
            }
            
            console.log('Fetching data for user:', userId);
            
            const [postsResponse, statsResponse] = await Promise.all([
                postAPI.getUserPosts(userId),
                userAPI.getStats(userId)
            ]);

            if (postsResponse.data.success) {
                setUserPosts(postsResponse.data.posts || []);
            }

            if (statsResponse.data.success && statsResponse.data.stats) {
                setStats(statsResponse.data.stats);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            const errorMessage = error.response?.data?.message || 'Error loading profile data';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await userAPI.updateProfile(profileData);
            showSuccess('Profile updated successfully!');
            setEditMode(false);
        } catch (error) {
            showError('Failed to update profile');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        try {
            await userAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showSuccess('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswordSection(false);
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to change password');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            await postAPI.delete(postId);
            setUserPosts(userPosts.filter(post => post._id !== postId));
            showSuccess('Post deleted successfully');
            fetchUserData(); // Refresh stats
        } catch (error) {
            showError('Error deleting post');
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showError('Image size must be less than 5MB');
            return;
        }

        try {
            setAvatarUploading(true);
            const formData = new FormData();
            formData.append('avatar', file);
            
            const response = await userAPI.uploadAvatar(formData);
            if (response.data.success) {
                showSuccess('Avatar updated successfully!');
                // Force a page reload to update the avatar everywhere
                window.location.reload();
            }
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to upload avatar');
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!window.confirm('Remove your profile photo?')) return;
        
        try {
            setAvatarUploading(true);
            await userAPI.deleteAvatar();
            showSuccess('Avatar removed successfully!');
            window.location.reload();
        } catch (error) {
            showError('Failed to remove avatar');
        } finally {
            setAvatarUploading(false);
        }
    };

    const getFilteredPosts = () => {
        if (postFilter === 'all') return userPosts;
        if (postFilter === 'lost') return userPosts.filter(p => p.type === 'lost');
        if (postFilter === 'found') return userPosts.filter(p => p.type === 'found');
        if (postFilter === 'active') return userPosts.filter(p => p.status === 'active');
        if (postFilter === 'resolved') return userPosts.filter(p => p.status === 'resolved');
        return userPosts;
    };

    const getSuccessRate = () => {
        if (!stats || stats.totalPosts === 0) return 0;
        return Math.round((stats.resolvedPosts / stats.totalPosts) * 100);
    };

    const getAchievements = () => {
        const achievements = [];
        
        if (stats) {
            if (stats.totalPosts >= 1) achievements.push({ icon: '🎯', title: 'First Post', desc: 'Created your first post' });
            if (stats.totalPosts >= 5) achievements.push({ icon: '📝', title: 'Active Member', desc: '5+ posts created' });
            if (stats.totalPosts >= 10) achievements.push({ icon: '⭐', title: 'Super Contributor', desc: '10+ posts created' });
            if (stats.resolvedPosts >= 1) achievements.push({ icon: '✅', title: 'Problem Solver', desc: 'Resolved your first item' });
            if (stats.resolvedPosts >= 5) achievements.push({ icon: '🏆', title: 'Hero', desc: '5+ successful reunions' });
            if (getSuccessRate() >= 50) achievements.push({ icon: '💎', title: 'High Success Rate', desc: '50%+ resolution rate' });
        }
        
        return achievements;
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-header">
                    <SkeletonStats />
                </div>
                <div className="profile-content">
                    <SkeletonPost />
                    <SkeletonPost />
                </div>
            </div>
        );
    }

    const filteredPosts = getFilteredPosts();
    const achievements = getAchievements();

    return (
        <div className="profile-page">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="user-info">
                    <div className="avatar-container">
                        <div className="user-avatar-wrapper">
                            <UserAvatar user={user} size="xlarge" showStatus={true} />
                        </div>
                        <label className="avatar-upload-btn" title="Change photo">
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                onChange={handleAvatarUpload}
                                disabled={avatarUploading}
                                hidden
                            />
                            {avatarUploading ? (
                                <span className="upload-spinner"></span>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                            )}
                        </label>
                        {user?.avatar && (
                            <button 
                                className="avatar-remove-btn" 
                                onClick={handleRemoveAvatar}
                                disabled={avatarUploading}
                                title="Remove photo"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="user-details">
                        {editMode ? (
                            <>
                                <form onSubmit={handleUpdateProfile} className="edit-profile-form">
                                    <input
                                        type="text"
                                        value={profileData.username}
                                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                        placeholder="Username"
                                        className="edit-input"
                                    />
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        placeholder="Email"
                                        className="edit-input"
                                    />
                                    <div className="edit-actions">
                                        <button type="submit" className="save-btn">Save</button>
                                        <button type="button" onClick={() => setEditMode(false)} className="cancel-btn">Cancel</button>
                                    </div>
                                </form>

                                {/* Password Change Section */}
                                <div className="password-change-section">
                                <button 
                                    className="toggle-password-btn" 
                                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    {showPasswordSection ? 'Hide' : 'Change'} Password
                                </button>

                                {showPasswordSection && (
                                    <form onSubmit={handleChangePassword} className="password-form">
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            placeholder="Current Password"
                                            className="edit-input"
                                            required
                                        />
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            placeholder="New Password (min 6 characters)"
                                            className="edit-input"
                                            required
                                            minLength={6}
                                        />
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            placeholder="Confirm New Password"
                                            className="edit-input"
                                            required
                                        />
                                        <div className="edit-actions">
                                            <button type="submit" className="save-btn">Update Password</button>
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setShowPasswordSection(false);
                                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                                }} 
                                                className="cancel-btn"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                            </>
                        ) : (
                            <>
                                <div className="username-header">
                                    <h1>{user?.username}</h1>
                                    <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </button>
                                </div>
                                <p className="user-email">{user?.email}</p>
                                <p className="member-since">
                                    📅 Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {stats && (
                    <div className="user-stats">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.totalPosts}</span>
                                <span className="stat-label">Total Posts</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.activePosts}</span>
                                <span className="stat-label">Active</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.resolvedPosts}</span>
                                <span className="stat-label">Resolved</span>
                            </div>
                        </div>
                        <div className="stat-card success-rate">
                            <div className="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{getSuccessRate()}%</span>
                                <span className="stat-label">Success Rate</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs Navigation */}
            <div className="profile-tabs">
                <button
                    className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    My Posts ({userPosts.length})
                </button>
                <button
                    className={`profile-tab ${activeTab === 'achievements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('achievements')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                        <path d="M4 22h16"></path>
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
                    </svg>
                    Achievements ({achievements.length})
                </button>
                <button
                    className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6m-9-9h6m6 0h6"></path>
                    </svg>
                    Settings
                </button>
            </div>

            {/* Tab Content */}
            <div className="profile-content">
                {activeTab === 'posts' && (
                    <div className="posts-section">
                        {/* Post Filters */}
                        <div className="post-filters">
                            <button 
                                className={`filter-btn ${postFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setPostFilter('all')}
                            >
                                All ({userPosts.length})
                            </button>
                            <button 
                                className={`filter-btn lost ${postFilter === 'lost' ? 'active' : ''}`}
                                onClick={() => setPostFilter('lost')}
                            >
                                Lost ({userPosts.filter(p => p.type === 'lost').length})
                            </button>
                            <button 
                                className={`filter-btn found ${postFilter === 'found' ? 'active' : ''}`}
                                onClick={() => setPostFilter('found')}
                            >
                                Found ({userPosts.filter(p => p.type === 'found').length})
                            </button>
                            <button 
                                className={`filter-btn active-filter ${postFilter === 'active' ? 'active' : ''}`}
                                onClick={() => setPostFilter('active')}
                            >
                                Active ({userPosts.filter(p => p.status === 'active').length})
                            </button>
                            <button 
                                className={`filter-btn resolved ${postFilter === 'resolved' ? 'active' : ''}`}
                                onClick={() => setPostFilter('resolved')}
                            >
                                Resolved ({userPosts.filter(p => p.status === 'resolved').length})
                            </button>
                        </div>

                        {/* Posts List */}
                        {error ? (
                            <EmptyState
                                type="error"
                                title="Error Loading Posts"
                                message={error}
                                actionText="Retry"
                                onAction={fetchUserData}
                            />
                        ) : (
                            <PostList
                                posts={filteredPosts}
                                loading={false}
                                emptyMessage={`No ${postFilter === 'all' ? '' : postFilter} posts found`}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div className="achievements-section">
                        <h2>Your Achievements</h2>
                        <p className="achievements-desc">Earn badges by being active in the community</p>
                        
                        {achievements.length > 0 ? (
                            <div className="achievements-grid">
                                {achievements.map((achievement, index) => (
                                    <div key={index} className="achievement-card">
                                        <div className="achievement-icon">{achievement.icon}</div>
                                        <h3>{achievement.title}</h3>
                                        <p>{achievement.desc}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                type="default"
                                icon={
                                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                        <path d="M4 22h16"></path>
                                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
                                    </svg>
                                }
                                title="No Achievements Yet"
                                message="Start creating posts to earn your first achievement!"
                                actionText="Create Post"
                                actionLink="/create-post"
                            />
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="settings-section">
                        <h2>Account Settings</h2>
                        
                        <div className="settings-card">
                            <h3>Profile Information</h3>
                            <button className="settings-action-btn" onClick={() => setEditMode(true)}>
                                Edit Profile
                            </button>
                        </div>

                        <div className="settings-card">
                            <h3>Notifications</h3>
                            <div className="setting-option">
                                <label>
                                    <input type="checkbox" defaultChecked />
                                    Email notifications for post matches
                                </label>
                            </div>
                            <div className="setting-option">
                                <label>
                                    <input type="checkbox" defaultChecked />
                                    Email notifications for messages
                                </label>
                            </div>
                        </div>

                        <div className="settings-card">
                            <h3>Privacy</h3>
                            <div className="setting-option">
                                <label>
                                    <input type="checkbox" defaultChecked />
                                    Show my posts publicly
                                </label>
                            </div>
                            <div className="setting-option">
                                <label>
                                    <input type="checkbox" />
                                    Hide my email from other users
                                </label>
                            </div>
                        </div>

                        <div className="settings-card danger-zone">
                            <h3>Danger Zone</h3>
                            <button className="danger-btn" onClick={logout}>
                                Log Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
