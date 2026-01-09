import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';
import './AuthPages.css';

const Register = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleRegisterSuccess = (result) => {
        navigate('/login', {
            replace: true,
            state: {
                message: result?.message || 'Account created successfully. Please sign in.'
            }
        });
    };

    return (
        <div className="auth-page">
            <div className="auth-container has-verification">
                <div className="auth-header">
                    <h1>Join FindX</h1>
                    <p>Create your account to start helping others</p>
                </div>

                <RegisterForm onSuccess={handleRegisterSuccess} />

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;