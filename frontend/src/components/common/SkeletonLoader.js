import React from 'react';
import './SkeletonLoader.css';

export const SkeletonPost = () => {
    return (
        <div className="skeleton-post">
            <div className="skeleton-header">
                <div className="skeleton-badge"></div>
                <div className="skeleton-category"></div>
                <div className="skeleton-time"></div>
            </div>
            <div className="skeleton-title"></div>
            <div className="skeleton-description">
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
            </div>
            <div className="skeleton-footer">
                <div className="skeleton-location"></div>
                <div className="skeleton-meta"></div>
            </div>
        </div>
    );
};

export const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-card-header"></div>
            <div className="skeleton-card-body">
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
            </div>
        </div>
    );
};

export const SkeletonStats = () => {
    return (
        <div className="skeleton-stats">
            <div className="skeleton-stat">
                <div className="skeleton-stat-value"></div>
                <div className="skeleton-stat-label"></div>
            </div>
            <div className="skeleton-stat">
                <div className="skeleton-stat-value"></div>
                <div className="skeleton-stat-label"></div>
            </div>
            <div className="skeleton-stat">
                <div className="skeleton-stat-value"></div>
                <div className="skeleton-stat-label"></div>
            </div>
        </div>
    );
};

const SkeletonLoader = () => {
    return <SkeletonPost />;
};

export default SkeletonLoader;


