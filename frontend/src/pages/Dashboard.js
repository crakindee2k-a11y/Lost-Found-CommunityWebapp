import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, userAPI } from '../services/api';
import PostList from '../components/posts/PostList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import VerificationBanner from '../components/common/VerificationBanner';
import { CATEGORIES } from '../utils/constants';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [recentPosts, setRecentPosts] = useState([]);
    const [communityStats, setCommunityStats] = useState({ total: 0, lost: 0, found: 0, resolved: 0 });
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all'); // Type filter: 'lost', 'found', 'all'
    const [statusFilter, setStatusFilter] = useState('all'); // Status filter: 'active', 'resolved', 'all'
    const [activeCategory, setActiveCategory] = useState('all'); // Category filter
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            const filters = {};
            
            // Type filter
            if (activeFilter !== 'all') {
                filters.type = activeFilter;
            }

            // Status filter
            if (statusFilter !== 'all') {
                filters.status = statusFilter;
            }

            // Category filter
            if (activeCategory !== 'all') {
                filters.category = activeCategory;
            }

            if (searchQuery) {
                filters.search = searchQuery;
            }
            
            // Get user ID (could be id or _id)
            const userId = user?.id || user?._id;
            
            // Parallel requests: Posts (with filters), User Stats, and global Community Counts
            const [postsResponse, statsResponse, allCount, lostCount, foundCount, resolvedCount] = await Promise.all([
                postAPI.getAll({ ...filters, limit: 10 }),
                userId ? userAPI.getStats(userId) : Promise.resolve({ data: { success: true, stats: null } }),
                postAPI.getAll({ limit: 1 }),
                postAPI.getAll({ type: 'lost', limit: 1 }),
                postAPI.getAll({ type: 'found', limit: 1 }),
                postAPI.getAll({ status: 'resolved', limit: 1 })
            ]);

            if (postsResponse.data.success) {
                setRecentPosts(postsResponse.data.posts);
            }

            // Community Activity card: always show global community stats (not affected by filters)
            setCommunityStats({
                total: allCount.data.pagination?.total || 0,
                lost: lostCount.data.pagination?.total || 0,
                found: foundCount.data.pagination?.total || 0,
                resolved: resolvedCount.data.pagination?.total || 0
            });

            if (statsResponse.data.success && statsResponse.data.stats) {
                setUserStats(statsResponse.data.stats);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Don't break the UI if stats fail
            setUserStats(null);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, [user, activeFilter, statusFilter, activeCategory, searchQuery]);

    // Debounce search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDashboardData();
        }, 500);

        return () => clearTimeout(timer);
    }, [fetchDashboardData]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleStatClick = (type) => {
        if (type === 'resolved') {
            setStatusFilter(prev => prev === 'resolved' ? 'all' : 'resolved');
            // Reset type filter to ensure we see results
            setActiveFilter('all');
        } else if (type === 'active') {
            setStatusFilter(prev => prev === 'active' ? 'all' : 'active');
            setActiveFilter('all');
        } else if (type === 'posts') {
            navigate('/my-posts'); // Assuming this route exists, or we can filter by user
            // For now, let's just filter by user's posts if possible, or keep navigation
            // navigate('/create-post'); // Old behavior
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    if (initialLoading) {
        return <LoadingSpinner text="Loading dashboard..." />;
    }

    return (
        <div className="dashboard-page">
            <VerificationBanner />
            
            <div className="dashboard-header">
                <div className="header-content-row">
                    <div className="welcome-section">
                        <h1>{getGreeting()}{user ? `, ${user.username}` : ''}! 👋</h1>
                        <p>Welcome to your FindX dashboard.</p>
                    </div>

                    <div className="dashboard-search-container">
                        <div className="dashboard-search-form">
                            <div className="search-category-wrapper">
                                <select 
                                    value={activeCategory} 
                                    onChange={(e) => setActiveCategory(e.target.value)}
                                    className="dashboard-category-select"
                                >
                                    <option value="all">All Categories</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="search-divider"></div>
                            <div className="search-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                className="dashboard-search-input" 
                                placeholder="Search items..." 
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Compact Stats Strip */}
                <div className="stats-strip">
                    <div className="stat-card-compact" onClick={() => navigate('/create-post')}>
                        <div className="stat-icon-compact">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                        </div>
                        <div className="stat-info-compact">
                            <span className="stat-value-compact">{userStats?.totalPosts || 0}</span>
                            <span className="stat-label-compact">Total Posts</span>
                        </div>
                        <div className="stat-action-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </div>
                    </div>

                    <div 
                        className={`stat-card-compact ${statusFilter === 'resolved' ? 'active-filter' : ''}`}
                        onClick={() => handleStatClick('resolved')}
                    >
                        <div className="stat-icon-compact resolved">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <div className="stat-info-compact">
                            <span className="stat-value-compact">{userStats?.resolvedPosts || 0}</span>
                            <span className="stat-label-compact">Resolved</span>
                        </div>
                        {userStats?.totalPosts > 0 && (
                            <div className="stat-mini-chart">
                                <div className="mini-progress" style={{ width: `${(userStats.resolvedPosts / userStats.totalPosts) * 100}%` }}></div>
                            </div>
                        )}
                    </div>

                    <div 
                        className={`stat-card-compact ${statusFilter === 'active' ? 'active-filter' : ''}`}
                        onClick={() => handleStatClick('active')}
                    >
                        <div className="stat-icon-compact active">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div className="stat-info-compact">
                            <span className="stat-value-compact">{userStats?.activePosts || 0}</span>
                            <span className="stat-label-compact">Active</span>
                        </div>
                        {userStats?.activePosts > 0 && <div className="status-dot"></div>}
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="recent-posts-section">
                    <div className="section-header">
                        <div className="header-title-group">
                            <h2>{statusFilter === 'resolved' ? 'Resolved Posts' : statusFilter === 'active' ? 'Active Posts' : 'Recent Community Posts'}</h2>
                            {statusFilter !== 'all' && (
                                <button className="clear-filter-btn" onClick={() => setStatusFilter('all')}>
                                    Clear Filter ✕
                                </button>
                            )}
                        </div>
                        <div className="filter-tabs">
                            <button
                                className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('all')}
                            >
                                All Posts
                            </button>
                            <button
                                className={`filter-tab ${activeFilter === 'lost' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('lost')}
                            >
                                Lost Items
                            </button>
                            <button
                                className={`filter-tab ${activeFilter === 'found' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('found')}
                            >
                                Found Items
                            </button>
                        </div>
                    </div>

                    <PostList
                        posts={recentPosts}
                        loading={loading}
                        emptyMessage="No posts found. Be the first to create a post!"
                    />
                </div>

                <div className="dashboard-sidebar">
                    <div className="sidebar-card quick-actions-card">
                        <h3>⚡ Quick Actions</h3>
                        <div className="action-buttons-row">
                            <button
                                className="action-btn-compact btn-lost"
                                onClick={() => navigate('/create-post', { state: { type: 'lost' } })}
                            >
                                <div className="btn-icon-wrapper-compact">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                </div>
                                <span>Lost Item</span>
                            </button>
                            <button
                                className="action-btn-compact btn-found"
                                onClick={() => navigate('/create-post', { state: { type: 'found' } })}
                            >
                                <div className="btn-icon-wrapper-compact">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                </div>
                                <span>Found Item</span>
                            </button>
                        </div>
                    </div>

                    <div className="sidebar-card community-card-compact">
                        <div className="comm-stat-header">
                            <h3>Community Activity</h3>
                            <span className="comm-total-badge">{communityStats.total} Posts</span>
                        </div>
                        
                        <div className="comm-stats-bars">
                            <div className="comm-stat-row-bar">
                                <div className="comm-bar-label">
                                    <span className="dot lost"></span> Lost
                                </div>
                                <div className="comm-bar-track">
                                    <div className="comm-bar-fill lost" style={{ width: `${(communityStats.lost / (communityStats.total || 1)) * 100}%` }}></div>
                                </div>
                                <span className="comm-bar-value">{communityStats.lost}</span>
                            </div>

                            <div className="comm-stat-row-bar">
                                <div className="comm-bar-label">
                                    <span className="dot found"></span> Found
                                </div>
                                <div className="comm-bar-track">
                                    <div className="comm-bar-fill found" style={{ width: `${(communityStats.found / (communityStats.total || 1)) * 100}%` }}></div>
                                </div>
                                <span className="comm-bar-value">{communityStats.found}</span>
                            </div>

                            <div className="comm-stat-row-bar">
                                <div className="comm-bar-label">
                                    <span className="dot resolved"></span> Resolved
                                </div>
                                <div className="comm-bar-track">
                                    <div className="comm-bar-fill resolved" style={{ width: `${(communityStats.resolved / (communityStats.total || 1)) * 100}%` }}></div>
                                </div>
                                <span className="comm-bar-value">{communityStats.resolved}</span>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-card tips-card">
                        <h3>💡 Pro Tips</h3>
                        <div className="tips-container">
                            <div className="tip-item">
                                <div className="tip-icon">📸</div>
                                <p>Upload <strong>clear photos</strong> to increase visibility by 3x</p>
                            </div>
                            <div className="tip-item">
                                <div className="tip-icon">📍</div>
                                <p>Pinpoint the <strong>exact location</strong> on the map</p>
                            </div>
                            <div className="tip-item">
                                <div className="tip-icon">🔔</div>
                                <p>Update status once <strong>resolved</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;