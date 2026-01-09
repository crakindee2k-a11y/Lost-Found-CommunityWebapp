import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostList from '../components/posts/PostList';
import { CATEGORIES } from '../utils/constants';
import { formatTimeAgo } from '../utils/dateUtils';
import './Home.css';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({});
    const [stats, setStats] = useState({ total: 0, lost: 0, found: 0, resolved: 0 });
    const [quickSearch, setQuickSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const storiesScrollRef = useRef(null);
    const postsColumnRef = useRef(null);

    // Define callbacks first (before useEffects that use them)
    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await postAPI.getAll({ ...filters, limit: 12 });

            if (response.data.success) {
                setPosts(response.data.posts);
            } else {
                setError(response.data.message || 'Failed to load posts');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading posts');
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchStats = useCallback(async () => {
        try {
            const [allPosts, lostPosts, foundPosts, resolvedPosts] = await Promise.all([
                postAPI.getAll({ limit: 1 }),
                postAPI.getAll({ type: 'lost', limit: 1 }),
                postAPI.getAll({ type: 'found', limit: 1 }),
                postAPI.getAll({ status: 'resolved', limit: 1 })
            ]);

            setStats({
                total: allPosts.data.pagination?.total || 0,
                lost: lostPosts.data.pagination?.total || 0,
                found: foundPosts.data.pagination?.total || 0,
                resolved: resolvedPosts.data.pagination?.total || 0
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        fetchPosts();
        fetchStats();
    }, [fetchPosts, fetchStats]);

    // Refresh stats every 30 seconds to keep them current
    useEffect(() => {
        const statsInterval = setInterval(fetchStats, 30000);
        return () => clearInterval(statsInterval);
    }, [fetchStats]);

    // Center carousel on initial load and Fish-eye lens effect on scroll
    useEffect(() => {
        const scrollContainer = storiesScrollRef.current;
        if (!scrollContainer) return;

        // Center the 3rd card on initial load with a small delay to ensure DOM is ready
        const centerCarousel = () => {
            const cards = scrollContainer.querySelectorAll('.story-card-slim');
            if (cards.length >= 3) {
                const thirdCard = cards[2]; // 3rd card (index 2)
                const containerWidth = scrollContainer.offsetWidth;
                const cardWidth = thirdCard.offsetWidth;
                const cardOffsetLeft = thirdCard.offsetLeft;
                
                // Calculate scroll position to center the 3rd card
                const scrollPosition = cardOffsetLeft - (containerWidth / 2) + (cardWidth / 2);
                scrollContainer.scrollLeft = Math.max(0, scrollPosition);
            }
        };

        // Try immediately and after delays
        setTimeout(centerCarousel, 50);
        setTimeout(centerCarousel, 200);
        setTimeout(centerCarousel, 500);

        const applyFishEyeEffect = () => {
            const cards = scrollContainer.querySelectorAll('.story-card-slim');
            const containerRect = scrollContainer.getBoundingClientRect();
            const containerCenter = containerRect.left + containerRect.width / 2;

            cards.forEach((card, index) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distanceFromCenter = Math.abs(containerCenter - cardCenter);
                
                // Intense fish-eye: bigger range (0.65 to 1.15)
                const maxDistance = 350;
                const minScale = 0.65;
                const maxScale = 1.15;
                
                let scale = maxScale - (distanceFromCenter / maxDistance) * (maxScale - minScale);
                scale = Math.max(minScale, Math.min(maxScale, scale));
                
                // Opacity follows scale
                const opacity = 0.4 + (scale - minScale) / (maxScale - minScale) * 0.6;
                
                // Z-index: center card on top
                const zIndex = Math.round(100 - distanceFromCenter);
                
                card.style.transform = `scale(${scale})`;
                card.style.opacity = opacity;
                card.style.zIndex = zIndex;
            });
        };

        scrollContainer.addEventListener('scroll', applyFishEyeEffect);
        applyFishEyeEffect(); // Initial call

        return () => scrollContainer.removeEventListener('scroll', applyFishEyeEffect);
    }, []);

    // Mouse wheel and drag-to-scroll functionality
    useEffect(() => {
        const scrollContainer = storiesScrollRef.current;
        if (!scrollContainer) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        // Mouse wheel horizontal scrolling
        const handleWheel = (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                scrollContainer.scrollLeft += e.deltaY;
            }
        };

        // Drag to scroll
        const handleMouseDown = (e) => {
            isDown = true;
            scrollContainer.classList.add('active');
            startX = e.pageX - scrollContainer.offsetLeft;
            scrollLeft = scrollContainer.scrollLeft;
        };

        const handleMouseLeave = () => {
            isDown = false;
            scrollContainer.classList.remove('active');
        };

        const handleMouseUp = () => {
            isDown = false;
            scrollContainer.classList.remove('active');
        };

        const handleMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - scrollContainer.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            scrollContainer.scrollLeft = scrollLeft - walk;
        };

        scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
        scrollContainer.addEventListener('mousedown', handleMouseDown);
        scrollContainer.addEventListener('mouseleave', handleMouseLeave);
        scrollContainer.addEventListener('mouseup', handleMouseUp);
        scrollContainer.addEventListener('mousemove', handleMouseMove);

        return () => {
            scrollContainer.removeEventListener('wheel', handleWheel);
            scrollContainer.removeEventListener('mousedown', handleMouseDown);
            scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
            scrollContainer.removeEventListener('mouseup', handleMouseUp);
            scrollContainer.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Sync dropdown with filters state
    useEffect(() => {
        if (filters.category) {
            setSelectedCategory(filters.category);
        } else {
            setSelectedCategory('all');
        }
    }, [filters.category]);

    const handleCategoryClick = (category) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            if (newFilters.category === category) {
                // Clicking the same category again clears it (back to All)
                delete newFilters.category;
            } else {
                newFilters.category = category;
            }
            return newFilters;
        });
    };

    const scrollToPostsSection = useCallback(() => {
        postsColumnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const handleQuickSearch = (e) => {
        e.preventDefault();
        setFilters(prev => {
            const newFilters = { ...prev };
            
            if (quickSearch.trim()) {
                newFilters.search = quickSearch;
            } else {
                delete newFilters.search;
            }
            
            if (selectedCategory !== 'all') {
                newFilters.category = selectedCategory;
            } else {
                delete newFilters.category;
            }
            
            return newFilters;
        });
        scrollToPostsSection();
    };

    const getCategoryIcon = (category) => {
        const icons = {
            electronics: '📱',
            documents: '📄',
            jewelry: '💍',
            clothing: '👔',
            pets: '🐾',
            bags: '🎒',
            keys: '🔑',
            other: '📦'
        };
        return icons[category] || '📦';
    };

    return (
        <div className="home-page">
            

            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content-centered">
                    <h1>Lost <span className="highlight-word">Something</span>? We'll Help You <span className="highlight-word">Find It</span></h1>
                    <p>Join our community making a difference</p>
                    
                    {/* Quick Search Bar */}
                    <form className="quick-search-form" onSubmit={handleQuickSearch}>
                        <div className="search-category-wrapper">
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="home-category-select"
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
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search items, location, or description..."
                            value={quickSearch}
                            onChange={(e) => setQuickSearch(e.target.value)}
                            className="quick-search-input"
                        />
                        <button type="submit" className="quick-search-btn">
                            Search
                        </button>
                    </form>
                    
                    <div className="hero-actions">
                        {isAuthenticated ? (
                            <button onClick={() => navigate('/create-post')} className="btn-primary">
                                <span>Report Item</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        ) : (
                            <button onClick={() => navigate('/register')} className="btn-primary">
                                <span>Get Started</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </button>
                        )}
                        <button 
                            onClick={scrollToPostsSection} 
                            className="btn-secondary"
                        >
                            Browse Posts
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Bar - Full Width Elegant Layout */}
            <div className="stats-bar-section">
                <div className="stats-bar-container">
                    {/* Activity Indicator */}
                    {posts.length > 0 && (
                        <div className="activity-indicator-inline">
                            <div className="activity-pulse"></div>
                            <span>{posts.length} active {posts.length === 1 ? 'post' : 'posts'}</span>
                        </div>
                    )}
                    
                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-item">
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Posts</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item stat-lost">
                            <div className="stat-value">{stats.lost}</div>
                            <div className="stat-label">Lost Items</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item stat-found">
                            <div className="stat-value">{stats.found}</div>
                            <div className="stat-label">Found Items</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item stat-reunited">
                            <div className="stat-value">{stats.resolved}</div>
                            <div className="stat-label">Reunited</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Badges Row */}
            <div className="trust-badges-section">
                <div className="trust-badges-container">
                    <div className="trust-badge">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        <span>Secure Platform</span>
                    </div>
                    <div className="trust-badge">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Verified Community</span>
                    </div>
                    <div className="trust-badge">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>{stats.resolved}+ Reunited</span>
                    </div>
                    <div className="trust-badge">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>24/7 Active</span>
                    </div>
                </div>
            </div>

            {/* Success Stories Carousel - Focus Center */}
            <div className="success-stories-carousel">
                <div className="carousel-header">
                    <span className="stories-label">Success Stories · {stats.resolved}+ reunited</span>
                </div>
                <div className="stories-scroll-container">
                    <div className="stories-scroll" ref={storiesScrollRef}>
                        <div className="story-card-slim">
                            <span className="story-emoji">💍</span>
                            <div className="story-content-slim">
                                <strong>Emily R.</strong> found her engagement ring at Central Park within 6 hours!
                                <div className="story-meta">📍 NYC • 2 days ago</div>
                            </div>
                        </div>
                        <div className="story-card-slim">
                            <span className="story-emoji">🐕</span>
                            <div className="story-content-slim">
                                <strong>Mike J.</strong> reunited with Max the Golden Retriever. "Community rocks!"
                                <div className="story-meta">📍 Austin, TX • 1 week ago</div>
                            </div>
                        </div>
                        <div className="story-card-slim">
                            <span className="story-emoji">📱</span>
                            <div className="story-content-slim">
                                <strong>Sarah M.</strong> got her iPhone 14 back with all photos intact.
                                <div className="story-meta">📍 Boston, MA • 3 days ago</div>
                            </div>
                        </div>
                        <div className="story-card-slim">
                            <span className="story-emoji">💼</span>
                            <div className="story-content-slim">
                                <strong>James K.</strong> recovered his briefcase with passport & documents.
                                <div className="story-meta">📍 Chicago, IL • 5 hours ago</div>
                            </div>
                        </div>
                        <div className="story-card-slim">
                            <span className="story-emoji">🔑</span>
                            <div className="story-content-slim">
                                <strong>Emma L.</strong> found her car keys at the library reception.
                                <div className="story-meta">📍 Seattle, WA • Yesterday</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Feed */}
            {posts.length > 0 && (
                <div className="recent-activity-section">
                    <div className="recent-activity-header">
                        <h3>🔥 Recent Activity</h3>
                        <span className="activity-count">Live updates</span>
                    </div>
                    <div className="activity-feed">
                        {posts.slice(0, 3).map((post, index) => (
                            <div key={post._id} className="activity-item" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className={`activity-dot ${post.type}`}></div>
                                <div className="activity-content">
                                    <strong>{post.type === 'lost' ? 'Lost' : 'Found'}</strong>: {post.title}
                                </div>
                                <div className="activity-time">{formatTimeAgo(post.createdAt)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* How FindX Works - Prominent section when few/no posts */}
            {stats.total < 5 && (
                <div className="how-it-works-section">
                    <div className="how-works-content">
                        <div className="how-works-header">
                            <h2>How FindX Works</h2>
                            <p>Simple, fast, and effective - reunite with your lost items in 4 easy steps</p>
                        </div>
                        
                        <div className="steps-grid">
                            <div className="step-card">
                                <div className="step-icon-wrapper">
                                    <div className="step-number">1</div>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 20h9"></path>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                    </svg>
                                </div>
                                <h3>Post Item Details</h3>
                                <p>Describe what you lost or found with photos and location</p>
                            </div>

                            <div className="step-card">
                                <div className="step-icon-wrapper">
                                    <div className="step-number">2</div>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                </div>
                                <h3>Browse & Match</h3>
                                <p>Search through community posts to find potential matches</p>
                            </div>

                            <div className="step-card">
                                <div className="step-icon-wrapper">
                                    <div className="step-number">3</div>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                </div>
                                <h3>Connect Safely</h3>
                                <p>Reach out to potential matches through our secure platform</p>
                            </div>

                            <div className="step-card">
                                <div className="step-icon-wrapper">
                                    <div className="step-number">4</div>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </div>
                                <h3>Reunite!</h3>
                                <p>Get back what you lost and make someone's day</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Compact Filter Bar with Inline Categories */}
            <div className="filter-categories-bar">
                <div className="quick-filters">
                    <button 
                        className={`filter-chip ${!filters.type ? 'active' : ''}`}
                        onClick={() => setFilters(prev => {
                            const newFilters = { ...prev };
                            delete newFilters.type;
                            return newFilters;
                        })}
                    >
                        All
                    </button>
                    <button 
                        className={`filter-chip lost ${filters.type === 'lost' ? 'active' : ''}`}
                        onClick={() => setFilters(prev => {
                            const newFilters = { ...prev };
                            if (newFilters.type === 'lost') {
                                delete newFilters.type;
                            } else {
                                newFilters.type = 'lost';
                            }
                            return newFilters;
                        })}
                    >
                        Lost
                    </button>
                    <button 
                        className={`filter-chip found ${filters.type === 'found' ? 'active' : ''}`}
                        onClick={() => setFilters(prev => {
                            const newFilters = { ...prev };
                            if (newFilters.type === 'found') {
                                delete newFilters.type;
                            } else {
                                newFilters.type = 'found';
                            }
                            return newFilters;
                        })}
                    >
                        Found
                    </button>
                </div>
                
                <div className="category-chips">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.value}
                            className={`category-chip ${filters.category === category.value ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category.value)}
                        >
                            {getCategoryIcon(category.value)} {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content: Posts + Sidebar */}
            <div className="main-content-grid">
                {/* Posts Column */}
                <div className="posts-column" ref={postsColumnRef}>
                    <PostList
                        posts={posts}
                        loading={loading}
                        error={error}
                        emptyMessage="No posts match your search criteria"
                    />
                </div>

                {/* Sidebar: Action-Focused Cards */}
                <div className="sidebar-column">
                    {/* Primary CTA Card */}
                    <div className="sidebar-card cta-card">
                        <h3>Lost Something?</h3>
                        <p>Post it now and let our community help you find it</p>
                        {isAuthenticated ? (
                            <button onClick={() => navigate('/create-post')} className="btn-primary">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>Create Post</span>
                            </button>
                        ) : (
                            <button onClick={() => navigate('/register')} className="btn-primary">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <line x1="19" y1="8" x2="19" y2="14"></line>
                                    <line x1="22" y1="11" x2="16" y2="11"></line>
                                </svg>
                                <span>Join Now</span>
                            </button>
                        )}
                    </div>

                    {/* Community Impact Card */}
                    <div className="sidebar-card stats-card">
                        <h3>Community Impact</h3>
                        <div className="impact-stats">
                            <div className="impact-stat">
                                <div className="impact-number">{stats.total}</div>
                                <div className="impact-label">Total Posts</div>
                            </div>
                            <div className="impact-stat">
                                <div className="impact-number">{stats.resolved}</div>
                                <div className="impact-label">Items Reunited</div>
                            </div>
                        </div>
                        <div className="impact-message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>Join our growing community</span>
                        </div>
                    </div>

                    {/* Why Join Card */}
                    <div className="sidebar-card why-join-card">
                        <h3>Why Join FindX?</h3>
                        <div className="benefits-list">
                            <div className="benefit-item">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M12 6v6l4 2"></path>
                                </svg>
                                <div>
                                    <strong>Fast Results</strong>
                                    <p>Most items are matched within 48 hours</p>
                                </div>
                            </div>
                            <div className="benefit-item">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <div>
                                    <strong>Active Community</strong>
                                    <p>Thousands of helpful people looking out</p>
                                </div>
                            </div>
                            <div className="benefit-item">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                                <div>
                                    <strong>100% Free</strong>
                                    <p>No hidden fees, no subscriptions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;