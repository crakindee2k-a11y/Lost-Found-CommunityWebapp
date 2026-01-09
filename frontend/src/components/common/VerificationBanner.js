import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './VerificationBanner.css';

const VerificationBanner = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) return null;

    const { verificationStatus, rejectionReason } = user;

    // Don't show for verified users
    if (verificationStatus === 'verified') return null;

    const getStatusContent = () => {
        switch (verificationStatus) {
            case 'pending':
                return {
                    type: 'pending',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    ),
                    title: 'Verification Pending',
                    message: 'Your verification documents are being reviewed. This usually takes 1-2 business days.',
                    action: null
                };
            case 'rejected':
                return {
                    type: 'rejected',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    ),
                    title: 'Verification Rejected',
                    message: rejectionReason || 'Your verification was rejected. Please resubmit with valid documents.',
                    action: <Link to="/verify" className="banner-action">Resubmit Documents</Link>
                };
            case 'unverified':
            default:
                return {
                    type: 'unverified',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    ),
                    title: 'Verify Your Account',
                    message: 'Get full access to locations and contact details by verifying your identity.',
                    action: <Link to="/verify" className="banner-action">Get Verified</Link>
                };
        }
    };

    const content = getStatusContent();

    return (
        <div className={`verification-banner ${content.type}`}>
            <div className="banner-icon">
                {content.icon}
            </div>
            <div className="banner-content">
                <h4>{content.title}</h4>
                <p>{content.message}</p>
            </div>
            {content.action && (
                <div className="banner-action-wrapper">
                    {content.action}
                </div>
            )}
        </div>
    );
};

export default VerificationBanner;
