import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { useToast } from '../components/common/ToastContainer';
import './VerifyPage.css';

const VerifyPage = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    
    const [nidFront, setNidFront] = useState(null);
    const [nidBack, setNidBack] = useState(null);
    const [selfie, setSelfie] = useState(null);
    const [previews, setPreviews] = useState({ nidFront: null, nidBack: null, selfie: null });
    const [loading, setLoading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // If already verified, redirect to dashboard
        if (user?.verificationStatus === 'verified') {
            navigate('/dashboard');
            return;
        }

        // If pending, show pending status
        if (user?.verificationStatus === 'pending') {
            setVerificationStatus('pending');
        } else {
            setVerificationStatus(user?.verificationStatus || 'unverified');
        }
    }, [user, isAuthenticated, navigate]);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showError('File size must be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviews(prev => ({ ...prev, [type]: reader.result }));
            if (type === 'nidFront') setNidFront(reader.result);
            else if (type === 'nidBack') setNidBack(reader.result);
            else if (type === 'selfie') setSelfie(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nidFront || !nidBack || !selfie) {
            showError('Please upload all required documents');
            return;
        }

        setLoading(true);

        try {
            const response = await userAPI.submitVerification({
                nidFrontImage: nidFront,
                nidBackImage: nidBack,
                selfieImage: selfie
            });

            if (response.data.success) {
                showSuccess('Verification documents submitted! We will review them shortly.');
                setVerificationStatus('pending');
            } else {
                showError(response.data.message || 'Failed to submit documents');
            }
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to submit verification documents');
        } finally {
            setLoading(false);
        }
    };

    if (verificationStatus === 'pending') {
        return (
            <div className="verify-page">
                <div className="verify-container">
                    <div className="verify-pending">
                        <div className="pending-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <h2>Verification In Progress</h2>
                        <p>Your documents are being reviewed. This usually takes 1-2 business days.</p>
                        <p className="pending-note">You'll receive a notification once your verification is complete.</p>
                        <button onClick={() => navigate('/dashboard')} className="back-btn">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="verify-page">
            <div className="verify-container">
                <div className="verify-header">
                    <div className="verify-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <h1>Verify Your Identity</h1>
                    <p>Get full access to exact locations and contact details by verifying your identity.</p>
                    
                    {user?.verificationStatus === 'rejected' && user?.rejectionReason && (
                        <div className="rejection-notice">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <div>
                                <strong>Previous Rejection Reason:</strong>
                                <p>{user.rejectionReason}</p>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="verify-form">
                    <div className="documents-grid">
                        <div className="document-upload">
                            <label>
                                <span className="label-text">NID Card (Front)</span>
                                <div className={`upload-area ${previews.nidFront ? 'has-preview' : ''}`}>
                                    {previews.nidFront ? (
                                        <img src={previews.nidFront} alt="NID Front" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                            <span>Click to upload</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'nidFront')}
                                    />
                                </div>
                            </label>
                        </div>

                        <div className="document-upload">
                            <label>
                                <span className="label-text">NID Card (Back)</span>
                                <div className={`upload-area ${previews.nidBack ? 'has-preview' : ''}`}>
                                    {previews.nidBack ? (
                                        <img src={previews.nidBack} alt="NID Back" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                            <span>Click to upload</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'nidBack')}
                                    />
                                </div>
                            </label>
                        </div>

                        <div className="document-upload selfie">
                            <label>
                                <span className="label-text">Selfie with NID</span>
                                <div className={`upload-area ${previews.selfie ? 'has-preview' : ''}`}>
                                    {previews.selfie ? (
                                        <img src={previews.selfie} alt="Selfie" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                            <span>Click to upload</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'selfie')}
                                    />
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="verify-info">
                        <h3>Why do we need this?</h3>
                        <ul>
                            <li>Protect the community from scammers</li>
                            <li>Ensure genuine lost & found reports</li>
                            <li>Build trust between users</li>
                        </ul>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => navigate('/dashboard')}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading || !nidFront || !nidBack || !selfie}
                        >
                            {loading ? 'Submitting...' : 'Submit for Verification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyPage;
