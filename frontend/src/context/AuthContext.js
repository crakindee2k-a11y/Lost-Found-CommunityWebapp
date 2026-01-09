import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Check if user is logged in on app start
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.getMe();
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            localStorage.removeItem('token');
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError('');
            const response = await authAPI.login(email, password);

            if (response.data.success) {
                const { token, user: userData } = response.data;
                localStorage.setItem('token', token);
                setUser(userData);
                return { success: true, user: userData };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            setError(message);
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            setError('');
            const response = await authAPI.register(userData);

            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message || 'Account created successfully. Please log in.'
                };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            setError(message);
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setError('');
    };

    const clearError = () => setError('');

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};