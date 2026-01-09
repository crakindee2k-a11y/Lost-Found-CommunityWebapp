import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EmptyState.css';

const EmptyState = ({ 
    icon, 
    title, 
    message, 
    actionText, 
    actionLink, 
    onAction,
    type = 'default' 
}) => {
    const navigate = useNavigate();

    const handleAction = () => {
        if (onAction) {
            onAction();
        } else if (actionLink) {
            navigate(actionLink);
        }
    };

    const getDefaultIcon = () => {
        switch (type) {
            case 'no-posts':
                return (
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                );
            case 'no-results':
                return (
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                );
            case 'error':
                return (
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                );
            default:
                return (
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                );
        }
    };

    return (
        <div className={`empty-state empty-state-${type}`}>
            <div className="empty-state-icon">
                {icon || getDefaultIcon()}
            </div>
            <h3 className="empty-state-title">{title}</h3>
            {message && <p className="empty-state-message">{message}</p>}
            {actionText && (
                <button className="empty-state-action" onClick={handleAction}>
                    {actionText}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </button>
            )}
        </div>
    );
};

export default EmptyState;


