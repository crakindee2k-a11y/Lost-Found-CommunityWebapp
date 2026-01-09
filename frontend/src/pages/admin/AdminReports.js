import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/ToastContainer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Admin.css';

const REPORT_REASONS = {
    fake_post: 'Fake Post',
    scam: 'Scam',
    inappropriate_content: 'Inappropriate Content',
    harassment: 'Harassment',
    spam: 'Spam',
    stolen_item: 'Stolen Item',
    false_claim: 'False Claim',
    impersonation: 'Impersonation',
    other: 'Other'
};

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [selectedReport, setSelectedReport] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [actionTaken, setActionTaken] = useState('none');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllReports({
                page,
                status: statusFilter
            });
            if (response.data.success) {
                setReports(response.data.reports);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            showError('Failed to load reports');
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, showError]);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchReports();
    }, [user, navigate, fetchReports]);

    const handleViewDetails = async (reportId) => {
        try {
            const response = await adminAPI.getReportDetails(reportId);
            if (response.data.success) {
                setSelectedReport(response.data.report);
                setAdminNote(response.data.report.adminNote || '');
                setActionTaken(response.data.report.actionTaken || 'none');
            }
        } catch (err) {
            showError('Failed to load report details');
        }
    };

    const handleUpdateReport = async (status) => {
        if (!selectedReport) return;

        try {
            setActionLoading(true);
            const response = await adminAPI.updateReport(selectedReport._id, {
                status,
                adminNote,
                actionTaken
            });
            if (response.data.success) {
                showSuccess(`Report marked as ${status}`);
                setSelectedReport(null);
                fetchReports();
            }
        } catch (err) {
            showError('Failed to update report');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'pending',
            reviewing: 'pending',
            resolved: 'verified',
            dismissed: 'unverified'
        };
        return <span className={`status-badge ${badges[status] || 'pending'}`}>{status}</span>;
    };

    if (loading && reports.length === 0) {
        return <LoadingSpinner text="Loading reports..." />;
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
                <h1>Reports Management</h1>
                <p>Review and handle user reports</p>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <select 
                    value={statusFilter} 
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Reports</option>
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                </select>
            </div>

            {reports.length === 0 ? (
                <div className="admin-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <h3>No Reports Found</h3>
                    <p>{statusFilter ? `No ${statusFilter} reports.` : 'No reports to review.'}</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Reporter</th>
                                    <th>Reason</th>
                                    <th>Target</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(report => (
                                    <tr key={report._id}>
                                        <td>
                                            <div className="user-card">
                                                <div className="user-avatar" style={{width: '32px', height: '32px', fontSize: '0.875rem'}}>
                                                    {report.reporterId?.username?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div className="user-info">
                                                    <span className="user-name">{report.reporterId?.username || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{REPORT_REASONS[report.reason] || report.reason}</td>
                                        <td>
                                            {report.reportedPostId && (
                                                <span style={{color: 'var(--primary)'}}>
                                                    Post: {report.reportedPostId.title?.substring(0, 20)}...
                                                </span>
                                            )}
                                            {report.reportedUserId && (
                                                <span style={{color: 'var(--warning)'}}>
                                                    User: {report.reportedUserId.username}
                                                </span>
                                            )}
                                        </td>
                                        <td>{getStatusBadge(report.status)}</td>
                                        <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                className="action-btn view"
                                                onClick={() => handleViewDetails(report._id)}
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="admin-pagination">
                            <button 
                                className="pagination-btn"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Previous
                            </button>
                            <span>Page {page} of {pagination.pages}</span>
                            <button 
                                className="pagination-btn"
                                disabled={page === pagination.pages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Report Details Modal */}
            {selectedReport && (
                <div className="verification-modal" onClick={() => setSelectedReport(null)}>
                    <div className="verification-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Report Details</h2>
                            <button className="modal-close" onClick={() => setSelectedReport(null)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div style={{marginBottom: '1.5rem'}}>
                                <p><strong>Reporter:</strong> {selectedReport.reporterId?.username} ({selectedReport.reporterId?.email})</p>
                                <p><strong>Reason:</strong> {REPORT_REASONS[selectedReport.reason]}</p>
                                <p><strong>Date:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                                <p><strong>Status:</strong> {getStatusBadge(selectedReport.status)}</p>
                            </div>

                            <div style={{marginBottom: '1.5rem'}}>
                                <h4 style={{marginBottom: '0.5rem'}}>Description</h4>
                                <p style={{background: 'var(--hover-bg)', padding: '1rem', borderRadius: '8px'}}>
                                    {selectedReport.description}
                                </p>
                            </div>

                            {selectedReport.reportedUserId && (
                                <div style={{marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px'}}>
                                    <h4 style={{marginBottom: '0.5rem'}}>Reported User</h4>
                                    <p><strong>Username:</strong> {selectedReport.reportedUserId.username}</p>
                                    <p><strong>Email:</strong> {selectedReport.reportedUserId.email}</p>
                                    <p><strong>Status:</strong> {selectedReport.reportedUserId.isBanned ? 'Banned' : selectedReport.reportedUserId.verificationStatus}</p>
                                </div>
                            )}

                            {selectedReport.reportedPostId && (
                                <div style={{marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px'}}>
                                    <h4 style={{marginBottom: '0.5rem'}}>Reported Post</h4>
                                    <p><strong>Title:</strong> {selectedReport.reportedPostId.title}</p>
                                    <p><strong>Type:</strong> {selectedReport.reportedPostId.type}</p>
                                </div>
                            )}

                            <div style={{marginBottom: '1rem'}}>
                                <h4 style={{marginBottom: '0.5rem'}}>Admin Note</h4>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Add your notes here..."
                                    rows={3}
                                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)'}}
                                />
                            </div>

                            <div>
                                <h4 style={{marginBottom: '0.5rem'}}>Action Taken</h4>
                                <select
                                    value={actionTaken}
                                    onChange={(e) => setActionTaken(e.target.value)}
                                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)'}}
                                >
                                    <option value="none">No action</option>
                                    <option value="warning">Warning issued</option>
                                    <option value="post_removed">Post removed</option>
                                    <option value="user_banned">User banned</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button 
                                className="action-btn"
                                onClick={() => handleUpdateReport('dismissed')}
                                disabled={actionLoading}
                                style={{background: 'var(--hover-bg)', flex: 1}}
                            >
                                Dismiss
                            </button>
                            <button 
                                className="action-btn approve"
                                onClick={() => handleUpdateReport('resolved')}
                                disabled={actionLoading}
                                style={{flex: 1}}
                            >
                                {actionLoading ? 'Saving...' : 'Mark Resolved'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReports;
