import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/ToastContainer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './Admin.css';

const AdminPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [deleteModal, setDeleteModal] = useState(null);
    const [deleteReason, setDeleteReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllPosts({
                page,
                search,
                type: typeFilter,
                status: statusFilter
            });
            if (response.data.success) {
                setPosts(response.data.posts);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            showError('Failed to load posts');
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    }, [page, search, typeFilter, statusFilter, showError]);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchPosts();
    }, [user, navigate, fetchPosts]);

    const handleDelete = async () => {
        if (!deleteModal) return;

        try {
            setActionLoading(true);
            const response = await adminAPI.deletePost(deleteModal, deleteReason);
            if (response.data.success) {
                showSuccess('Post deleted successfully');
                setDeleteModal(null);
                setDeleteReason('');
                fetchPosts();
            }
        } catch (err) {
            showError('Failed to delete post');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && posts.length === 0) {
        return <LoadingSpinner text="Loading posts..." />;
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
                <h1>Post Management</h1>
                <p>Manage all posts on the platform</p>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                <select 
                    value={typeFilter} 
                    onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Types</option>
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                </select>
                <select 
                    value={statusFilter} 
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            {posts.length === 0 ? (
                <div className="admin-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <h3>No Posts Found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Author</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map(post => (
                                    <tr key={post._id}>
                                        <td>
                                            <Link 
                                                to={`/post/${post._id}`} 
                                                style={{color: 'var(--primary)', textDecoration: 'none'}}
                                            >
                                                {post.title.substring(0, 40)}{post.title.length > 40 ? '...' : ''}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${post.type === 'lost' ? 'rejected' : 'verified'}`}>
                                                {post.type}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="user-card">
                                                <div className="user-avatar" style={{width: '32px', height: '32px', fontSize: '0.875rem'}}>
                                                    {post.userId?.username?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div className="user-info">
                                                    <span className="user-name">{post.userId?.username || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${post.status === 'active' ? 'pending' : 'verified'}`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link to={`/post/${post._id}`} className="action-btn view">
                                                    View
                                                </Link>
                                                <button 
                                                    className="action-btn reject"
                                                    onClick={() => setDeleteModal(post._id)}
                                                >
                                                    Delete
                                                </button>
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

            {/* Delete Modal */}
            {deleteModal && (
                <div className="verification-modal" onClick={() => setDeleteModal(null)}>
                    <div className="verification-modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '500px'}}>
                        <div className="modal-header">
                            <h2>Delete Post</h2>
                            <button className="modal-close" onClick={() => setDeleteModal(null)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{marginBottom: '1rem', color: 'var(--error)'}}>
                                <strong>Warning:</strong> This action cannot be undone.
                            </p>
                            <p style={{marginBottom: '1rem'}}>Please provide a reason for deletion (optional):</p>
                            <textarea
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder="Reason for deletion..."
                                rows={3}
                                style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)'}}
                            />
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="action-btn"
                                onClick={() => setDeleteModal(null)}
                                style={{background: 'var(--hover-bg)'}}
                            >
                                Cancel
                            </button>
                            <button 
                                className="action-btn reject"
                                onClick={handleDelete}
                                disabled={actionLoading}
                                style={{padding: '0.75rem 2rem'}}
                            >
                                {actionLoading ? 'Deleting...' : 'Delete Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPosts;
