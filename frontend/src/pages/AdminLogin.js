import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/ToastContainer';
import './AdminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, logout, user, isAuthenticated } = useAuth();
    const { showError, showSuccess } = useToast();

    useEffect(() => {
        // If already logged in as admin, redirect to admin dashboard
        if (isAuthenticated && user?.role === 'admin') {
            navigate('/admin', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            showError('Please enter email and password');
            return;
        }

        setLoading(true);

        try {
            const result = await login(email, password);
            
            if (result.success) {
                // Check if user is admin
                if (result.user?.role === 'admin') {
                    showSuccess('Welcome, Admin!');
                    // Use replace to prevent back button issues
                    setTimeout(() => {
                        navigate('/admin', { replace: true });
                    }, 100);
                } else {
                    showError('Access denied. Admin privileges required.');
                    // Logout the non-admin user
                    logout();
                }
            } else {
                showError(result.message || 'Invalid credentials');
            }
        } catch (err) {
            showError('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-header">
                    <div className="admin-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <h1>Admin Portal</h1>
                    <p>Sign in to access the admin dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@findx.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="admin-login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In as Admin'}
                    </button>
                </form>

                <div className="admin-login-footer">
                    <p>
                        Not an admin? <Link to="/login">User Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
