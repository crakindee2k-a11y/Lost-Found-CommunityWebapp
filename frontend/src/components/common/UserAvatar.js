import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './UserAvatar.css';

const UserAvatar = ({ user, size = 'medium', showStatus = false, className = '' }) => {
    const [imageError, setImageError] = useState(false);

    // Reset error state when user changes
    useEffect(() => {
        setImageError(false);
    }, [user?.avatar]);

    const getInitials = (username) => {
        return username ? username.charAt(0).toUpperCase() : 'U';
    };

    const getAvatarUrl = (url) => {
        if (!url) return null;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.replace('/api', '');
        
        if (url.startsWith('http')) return url;
        return `${baseUrl}${url}`;
    };

    const avatarUrl = getAvatarUrl(user?.avatar);

    return (
        <div className={`user-avatar-component ${size} ${className}`}>
            {avatarUrl && !imageError ? (
                <img 
                    src={avatarUrl} 
                    alt={user?.username || 'User'} 
                    className="avatar-img"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="avatar-initials">
                    {getInitials(user?.username)}
                </div>
            )}
            
            {showStatus && user?.verificationStatus === 'verified' && (
                <span className="avatar-verified-badge" title="Verified User">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01" fill="none" stroke="white" strokeWidth="3"></polyline>
                    </svg>
                </span>
            )}
        </div>
    );
};

export default UserAvatar;
