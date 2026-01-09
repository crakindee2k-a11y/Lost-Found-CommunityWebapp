import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import NotificationBell from './NotificationBell';
import UserAvatar from './UserAvatar';
import './Header.css';

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const isActiveLink = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    // Fetch unread message count
    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            // Poll every 30 seconds for new messages
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchUnreadCount = async () => {
        try {
            const response = await messageAPI.getUnreadCount();
            if (response.data.success) {
                setUnreadCount(response.data.count || 0);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to={isAuthenticated ? '/dashboard' : '/home'} className="logo" onClick={closeMobileMenu}>
                    <h1>Find<span className="logo-x">X</span></h1>
                    <span>Lost & Found</span>
                </Link>

                <button 
                    className="mobile-menu-toggle" 
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <span className={mobileMenuOpen ? 'active' : ''}></span>
                    <span className={mobileMenuOpen ? 'active' : ''}></span>
                    <span className={mobileMenuOpen ? 'active' : ''}></span>
                </button>

                <nav className={`nav ${mobileMenuOpen ? 'active' : ''}`}>
                    {isAuthenticated ? (
                        <Link to="/dashboard" className={`nav-link ${isActiveLink('/dashboard')}`} onClick={closeMobileMenu}>
                            Dashboard
                        </Link>
                    ) : (
                    <Link to="/home" className={`nav-link ${isActiveLink('/home')}`} onClick={closeMobileMenu}>
                            Explore
                    </Link>
                    )}

                    {isAuthenticated ? (
                        <>
                            <Link to="/create-post" className={`nav-link ${isActiveLink('/create-post')}`} onClick={closeMobileMenu}>
                                Create Post
                            </Link>
                            <Link to="/messages" className={`nav-link inbox-link ${isActiveLink('/messages')}`} onClick={closeMobileMenu}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                Inbox
                                {unreadCount > 0 && (
                                    <span className="unread-dot" title={`${unreadCount} unread messages`}></span>
                                )}
                            </Link>
                            <NotificationBell />
                            <div className="user-menu">
                                <Link to="/profile" className="user-profile-btn">
                                    <UserAvatar user={user} size="small" />
                                    <span className="user-name-text">
                                        Hello, {user?.username}
                                    </span>
                                    {user?.verificationStatus === 'verified' && (
                                        <svg className="verified-badge" width="14" height="14" viewBox="0 0 24 24" fill="#06b6d4" stroke="#06b6d4" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01" fill="none" stroke="white"></polyline>
                                        </svg>
                                    )}
                                </Link>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className={`nav-link ${isActiveLink('/login')}`} onClick={closeMobileMenu}>
                                Login
                            </Link>
                            <Link to="/register" className="register-btn" onClick={closeMobileMenu}>
                                Sign Up
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;