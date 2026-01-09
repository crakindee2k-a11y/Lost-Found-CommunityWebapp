import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';

const LoginForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const { login, error, clearError } = useAuth();

    const handleChange = (e) => {
        if (error) clearError();
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            if (result.success && onSuccess) {
                onSuccess();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button
                type="submit"
                className="submit-btn"
                disabled={loading}
            >
                {loading ? 'Signing In...' : 'Sign In'}
            </button>
        </form>
    );
};

export default LoginForm;