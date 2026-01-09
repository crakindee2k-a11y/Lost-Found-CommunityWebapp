import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import './AuthPages.css';

const Login = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [infoMessage, setInfoMessage] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (location.state?.message) {
            setInfoMessage(location.state.message);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleLoginSuccess = () => {
        navigate('/dashboard', { replace: true });
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your FindX account</p>
                </div>

                {infoMessage && (
                    <p className="success-text" style={{ marginTop: '-0.5rem' }}>
                        {infoMessage}
                    </p>
                )}

                <LoginForm onSuccess={handleLoginSuccess} />

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;