import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Admin.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchStats();
    }, [user, navigate]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getStats();
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (err) {
            setError('Failed to load dashboard stats');
            console.error('Error fetching admin stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getVerificationBadge = (status) => {
        const badges = {
            verified: { class: 'verified', label: 'Verified' },
            pending: { class: 'pending', label: 'Pending' },
            rejected: { class: 'rejected', label: 'Rejected' },
            unverified: { class: 'unverified', label: 'Unverified' }
        };
        return badges[status] || badges.unverified;
    };

    if (loading) {
        return <LoadingSpinner text="Loading admin dashboard..." />;
    }

    if (error) {
        return (
            <div className="admin-page">
                <div className="admin-error">{error}</div>
            </div>
        );
    }

    const successRate = stats?.posts?.total > 0 
        ? Math.round((stats.posts.resolved / stats.posts.total) * 100) 
        : 0;

    return (
        <div className="admin-page">
            {/* Compact Header */}
            <div className="admin-header-compact">
                <div className="admin-title-row">
                    <h1>Admin Dashboard</h1>
                    <div className="header-mini-stats">
                        <span className="mini-pill">
                            <strong>{stats?.users?.newToday || 0}</strong> new users today
                        </span>
                        <span className="mini-pill">
                            <strong>{stats?.posts?.newToday || 0}</strong> new posts today
                        </span>
                    </div>
                </div>
            </div>

            {/* HERO: Quick Actions - Main Functional Area */}
            <div className="quick-actions-hero">
                <div className="hero-action-card" onClick={() => navigate('/admin/verifications')}>
                    <div className="hero-action-icon verify">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <div className="hero-action-content">
                        <h3>Review Verifications</h3>
                        <p>Approve or reject user verification requests</p>
                    </div>
                    {stats?.users?.pendingVerification > 0 && (
                        <span className="hero-badge pulse">{stats.users.pendingVerification}</span>
                    )}
                    <svg className="hero-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>

                <div className="hero-action-card" onClick={() => navigate('/admin/reports')}>
                    <div className="hero-action-icon report">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <div className="hero-action-content">
                        <h3>Handle Reports</h3>
                        <p>Review and resolve user reports</p>
                    </div>
                    {stats?.reports?.pending > 0 && (
                        <span className="hero-badge danger pulse">{stats.reports.pending}</span>
                    )}
                    <svg className="hero-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>

                <div className="hero-action-card" onClick={() => navigate('/admin/users')}>
                    <div className="hero-action-icon users">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <div className="hero-action-content">
                        <h3>Manage Users</h3>
                        <p>View, edit, or ban platform users</p>
                    </div>
                    <svg className="hero-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>

                <div className="hero-action-card" onClick={() => navigate('/admin/posts')}>
                    <div className="hero-action-icon posts">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                    </div>
                    <div className="hero-action-content">
                        <h3>Manage Posts</h3>
                        <p>Moderate lost & found posts</p>
                    </div>
                    <svg className="hero-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            </div>

            {/* Stats & Activity Grid */}
            <div className="admin-secondary-grid">
                {/* Left: Compact Stats Overview */}
                <div className="stats-overview">
                    <div className="stats-section">
                        <div className="section-header">
                            <h4>Users Overview</h4>
                            <span className="section-total">{stats?.users?.total || 0} total</span>
                        </div>
                        <div className="compact-stats-row">
                            <div 
                                className="compact-stat verified interactive" 
                                onClick={() => navigate('/admin/users', { state: { filter: 'verified' } })}
                            >
                                <span className="compact-value">{stats?.users?.verified || 0}</span>
                                <span className="compact-label">Verified</span>
                            </div>
                            <div 
                                className="compact-stat pending interactive"
                                onClick={() => navigate('/admin/users', { state: { filter: 'pending' } })}
                            >
                                <span className="compact-value">{stats?.users?.pendingVerification || 0}</span>
                                <span className="compact-label">Pending</span>
                            </div>
                            <div 
                                className="compact-stat rejected interactive"
                                onClick={() => navigate('/admin/users', { state: { filter: 'rejected' } })}
                            >
                                <span className="compact-value">{stats?.users?.rejected || 0}</span>
                                <span className="compact-label">Rejected</span>
                            </div>
                            <div 
                                className="compact-stat unverified interactive"
                                onClick={() => navigate('/admin/users', { state: { filter: 'unverified' } })}
                            >
                                <span className="compact-value">{stats?.users?.unverified || 0}</span>
                                <span className="compact-label">Unverified</span>
                            </div>
                            <div 
                                className="compact-stat banned interactive"
                                onClick={() => navigate('/admin/users', { state: { filter: 'banned' } })}
                            >
                                <span className="compact-value">{stats?.users?.banned || 0}</span>
                                <span className="compact-label">Banned</span>
                            </div>
                        </div>
                    </div>

                    <div className="stats-section">
                        <div className="section-header">
                            <h4>Posts Overview</h4>
                            <span className="section-total">{stats?.posts?.total || 0} total</span>
                        </div>
                        <div className="post-bars-compact">
                            <div className="post-bar-item">
                                <div className="bar-header">
                                    <span className="bar-label lost">Lost</span>
                                    <span className="bar-count">{stats?.posts?.lost || 0}</span>
                                </div>
                                <div className="bar-track-sm">
                                    <div 
                                        className="bar-fill lost" 
                                        style={{ width: `${stats?.posts?.total ? (stats.posts.lost / stats.posts.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="post-bar-item">
                                <div className="bar-header">
                                    <span className="bar-label found">Found</span>
                                    <span className="bar-count">{stats?.posts?.found || 0}</span>
                                </div>
                                <div className="bar-track-sm">
                                    <div 
                                        className="bar-fill found" 
                                        style={{ width: `${stats?.posts?.total ? (stats.posts.found / stats.posts.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="post-bar-item">
                                <div className="bar-header">
                                    <span className="bar-label resolved">Resolved</span>
                                    <span className="bar-count">{stats?.posts?.resolved || 0}</span>
                                </div>
                                <div className="bar-track-sm">
                                    <div 
                                        className="bar-fill resolved" 
                                        style={{ width: `${stats?.posts?.total ? (stats.posts.resolved / stats.posts.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="success-rate-bar">
                            <span className="rate-label">Success Rate</span>
                            <div className="rate-visual">
                                <div className="rate-fill" style={{ width: `${successRate}%` }}></div>
                            </div>
                            <span className="rate-value">{successRate}%</span>
                        </div>
                    </div>
                </div>

                {/* Right: Recent Activity */}
                <div className="activity-section">
                    <div className="section-header">
                        <h4>Recent Activity</h4>
                    </div>
                    <div className="activity-feed">
                        {stats?.recent?.users?.map((u, i) => (
                            <div key={`user-${i}`} className="activity-item">
                                <div className="activity-avatar user">
                                    {u.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="activity-details">
                                    <span className="activity-primary">{u.username}</span>
                                    <span className="activity-secondary">New user registered</span>
                                </div>
                                <span className={`activity-tag ${getVerificationBadge(u.verificationStatus).class}`}>
                                    {getVerificationBadge(u.verificationStatus).label}
                                </span>
                            </div>
                        ))}
                        {stats?.recent?.posts?.map((p, i) => (
                            <div key={`post-${i}`} className="activity-item">
                                <div className={`activity-avatar post ${p.type}`}>
                                    {p.type === 'lost' ? 'L' : 'F'}
                                </div>
                                <div className="activity-details">
                                    <span className="activity-primary">{p.title?.substring(0, 28)}{p.title?.length > 28 ? '...' : ''}</span>
                                    <span className="activity-secondary">by {p.userId?.username || 'Unknown'}</span>
                                </div>
                                <span className={`activity-tag ${p.type}`}>
                                    {p.type === 'lost' ? 'Lost' : 'Found'}
                                </span>
                            </div>
                        ))}
                        {(!stats?.recent?.users?.length && !stats?.recent?.posts?.length) && (
                            <div className="no-activity">No recent activity</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
