import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/ToastContainer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Admin.css';

// Document Image component with error handling
const DocumentImage = ({ src, alt, title }) => {
    const [hasError, setHasError] = useState(false);
    const [loading, setLoading] = useState(true);

    if (!src) {
        return (
            <div className="document-item">
                <h4>{title}</h4>
                <div className="document-placeholder">
                    <span>Not provided</span>
                </div>
            </div>
        );
    }

    return (
        <div className="document-item">
            <h4>{title}</h4>
            {hasError ? (
                <div className="document-placeholder error">
                    <span>Failed to load</span>
                    <a href={src} target="_blank" rel="noopener noreferrer" className="view-link">
                        View Original
                    </a>
                </div>
            ) : (
                <>
                    {loading && <div className="document-placeholder loading">Loading...</div>}
                    <img 
                        src={src} 
                        alt={alt} 
                        className="document-image"
                        style={{ display: loading ? 'none' : 'block' }}
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setHasError(true);
                            setLoading(false);
                        }}
                        onClick={() => window.open(src, '_blank')}
                    />
                </>
            )}
        </div>
    );
};

const AdminVerifications = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalNote, setApprovalNote] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();

    const fetchVerifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getPendingVerifications();
            if (response.data.success) {
                setVerifications(response.data.users);
            }
        } catch (err) {
            showError('Failed to load verifications');
            console.error('Error fetching verifications:', err);
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchVerifications();
    }, [user, navigate, fetchVerifications]);

    const handleViewDetails = async (userId) => {
        try {
            const response = await adminAPI.getVerificationDetails(userId);
            if (response.data.success) {
                setSelectedUser(response.data.user);
            }
        } catch (err) {
            showError('Failed to load user details');
        }
    };

    const handleApprove = async () => {
        if (!selectedUser) return;
        
        try {
            setActionLoading(true);
            const response = await adminAPI.approveVerification(selectedUser._id, approvalNote);
            if (response.data.success) {
                showSuccess('User verification approved');
                setSelectedUser(null);
                setApprovalNote('');
                fetchVerifications();
            }
        } catch (err) {
            showError('Failed to approve verification');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedUser || !rejectionReason.trim()) {
            showError('Please provide a rejection reason');
            return;
        }
        
        try {
            setActionLoading(true);
            const response = await adminAPI.rejectVerification(selectedUser._id, rejectionReason);
            if (response.data.success) {
                showSuccess('User verification rejected');
                setSelectedUser(null);
                setRejectionReason('');
                fetchVerifications();
            }
        } catch (err) {
            showError('Failed to reject verification');
        } finally {
            setActionLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedUser(null);
        setRejectionReason('');
        setApprovalNote('');
    };

    if (loading) {
        return <LoadingSpinner text="Loading verifications..." />;
    }

    return (
        <div className="admin-page">
            <Link to="/admin" className="back-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Dashboard
            </Link>

            <div className="admin-header">
                <h1>Pending Verifications</h1>
                <p>{verifications.length} user(s) waiting for verification</p>
            </div>

            {verifications.length === 0 ? (
                <div className="admin-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <h3>No Pending Verifications</h3>
                    <p>All verification requests have been processed.</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Registered</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {verifications.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-card">
                                            <div className="user-avatar">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-info">
                                                <span className="user-name">{user.username}</span>
                                                <span className="user-email">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className="status-badge pending">Pending</span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="action-btn view"
                                                onClick={() => handleViewDetails(user._id)}
                                            >
                                                Review
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Verification Modal */}
            {selectedUser && (
                <div className="verification-modal" onClick={closeModal}>
                    <div className="verification-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Review Verification - {selectedUser.username}</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="user-details">
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Phone:</strong> {selectedUser.phone || 'Not provided'}</p>
                                <p><strong>Registered:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                            </div>

                            <h3 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>Verification Documents</h3>
                            <div className="document-grid">
                                <DocumentImage 
                                    src={selectedUser.nidFrontImage} 
                                    alt="NID Front" 
                                    title="NID Front"
                                />
                                <DocumentImage 
                                    src={selectedUser.nidBackImage} 
                                    alt="NID Back" 
                                    title="NID Back"
                                />
                                <DocumentImage 
                                    src={selectedUser.selfieImage} 
                                    alt="Selfie" 
                                    title="Selfie"
                                />
                            </div>
                        </div>

                        <div className="modal-actions" style={{flexDirection: 'column', gap: '1rem'}}>
                            <div style={{display: 'flex', gap: '1rem', width: '100%'}}>
                                <input
                                    type="text"
                                    placeholder="Approval note (optional)"
                                    value={approvalNote}
                                    onChange={(e) => setApprovalNote(e.target.value)}
                                />
                                <button 
                                    className="action-btn approve"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    style={{padding: '0.75rem 2rem'}}
                                >
                                    {actionLoading ? 'Processing...' : 'Approve'}
                                </button>
                            </div>
                            <div style={{display: 'flex', gap: '1rem', width: '100%'}}>
                                <input
                                    type="text"
                                    placeholder="Rejection reason (required)"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                                <button 
                                    className="action-btn reject"
                                    onClick={handleReject}
                                    disabled={actionLoading || !rejectionReason.trim()}
                                    style={{padding: '0.75rem 2rem'}}
                                >
                                    {actionLoading ? 'Processing...' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerifications;
