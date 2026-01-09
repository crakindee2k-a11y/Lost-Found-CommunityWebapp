import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/ToastContainer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Admin.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [bannedFilter, setBannedFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [actionLoading, setActionLoading] = useState(null);
    const [banModal, setBanModal] = useState(null);
    const [banReason, setBanReason] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllUsers({
                page,
                search,
                verificationStatus: statusFilter,
                isBanned: bannedFilter
            });
            if (response.data.success) {
                setUsers(response.data.users);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            showError('Failed to load users');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter, bannedFilter, showError]);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, [user, navigate, fetchUsers]);

    const handleBan = async () => {
        if (!banModal || !banReason.trim()) {
            showError('Please provide a ban reason');
            return;
        }

        try {
            setActionLoading(banModal);
            const response = await adminAPI.banUser(banModal, banReason);
            if (response.data.success) {
                showSuccess('User has been banned');
                setBanModal(null);
                setBanReason('');
                fetchUsers();
            }
        } catch (err) {
            showError('Failed to ban user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnban = async (userId) => {
        try {
            setActionLoading(userId);
            const response = await adminAPI.unbanUser(userId);
            if (response.data.success) {
                showSuccess('User has been unbanned');
                fetchUsers();
            }
        } catch (err) {
            showError('Failed to unban user');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (user) => {
        if (user.isBanned) {
            return <span className="status-badge banned">Banned</span>;
        }
        return <span className={`status-badge ${user.verificationStatus}`}>{user.verificationStatus}</span>;
    };

    if (loading && users.length === 0) {
        return <LoadingSpinner text="Loading users..." />;
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
                <h1>User Management</h1>
                <p>Manage all registered users</p>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                <select 
                    value={statusFilter} 
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Status</option>
                    <option value="unverified">Unverified</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select 
                    value={bannedFilter} 
                    onChange={(e) => { setBannedFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Users</option>
                    <option value="false">Active</option>
                    <option value="true">Banned</option>
                </select>
            </div>

            {users.length === 0 ? (
                <div className="admin-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <h3>No Users Found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Status</th>
                                    <th>Registered</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td>
                                            <div className="user-card">
                                                <div className="user-avatar">
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="user-info">
                                                    <span className="user-name">{u.username}</span>
                                                    <span className="user-email">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(u)}</td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {u.isBanned ? (
                                                    <button 
                                                        className="action-btn unban"
                                                        onClick={() => handleUnban(u._id)}
                                                        disabled={actionLoading === u._id}
                                                    >
                                                        {actionLoading === u._id ? '...' : 'Unban'}
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="action-btn ban"
                                                        onClick={() => setBanModal(u._id)}
                                                    >
                                                        Ban
                                                    </button>
                                                )}
                                            </div>
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

            {/* Ban Modal */}
            {banModal && (
                <div className="verification-modal" onClick={() => setBanModal(null)}>
                    <div className="verification-modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '500px'}}>
                        <div className="modal-header">
                            <h2>Ban User</h2>
                            <button className="modal-close" onClick={() => setBanModal(null)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{marginBottom: '1rem'}}>Please provide a reason for banning this user:</p>
                            <textarea
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                placeholder="Ban reason..."
                                rows={3}
                                style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)'}}
                            />
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="action-btn"
                                onClick={() => setBanModal(null)}
                                style={{background: 'var(--hover-bg)'}}
                            >
                                Cancel
                            </button>
                            <button 
                                className="action-btn ban"
                                onClick={handleBan}
                                disabled={!banReason.trim() || actionLoading}
                                style={{padding: '0.75rem 2rem'}}
                            >
                                {actionLoading ? 'Banning...' : 'Ban User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
