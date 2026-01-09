import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';

const RegisterForm = ({ onSuccess }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        nidFrontImage: '',
        nidBackImage: '',
        selfieImage: ''
    });
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [skipVerification, setSkipVerification] = useState(false);
    const { register, error, clearError } = useAuth();
    
    const nidFrontRef = useRef(null);
    const nidBackRef = useRef(null);
    const selfieRef = useRef(null);

    const handleChange = (e) => {
        if (error || formError || successMessage) {
            clearError();
            setFormError('');
            setSuccessMessage('');
        }
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageUpload = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setFormError('Image size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                [field]: reader.result
            }));
        };
        reader.readAsDataURL(file);
    };

    const validateStep1 = () => {
        if (formData.password !== formData.confirmPassword) {
            setFormError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setFormError('Password must be at least 6 characters long');
            return false;
        }
        if (formData.username.length < 3) {
            setFormError('Username must be at least 3 characters long');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!skipVerification) {
            if (!formData.nidFrontImage || !formData.nidBackImage || !formData.selfieImage) {
                setFormError('Please upload all verification documents or skip this step');
                return false;
            }
        }
        return true;
    };

    const handleNextStep = () => {
        setFormError('');
        if (step === 1 && validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step === 1) {
            handleNextStep();
            return;
        }

        if (!validateStep2()) return;

        setLoading(true);

        try {
            const registrationData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            };

            // Only include verification docs if not skipped
            if (!skipVerification && formData.nidFrontImage) {
                registrationData.nidFrontImage = formData.nidFrontImage;
                registrationData.nidBackImage = formData.nidBackImage;
                registrationData.selfieImage = formData.selfieImage;
            }

            const result = await register(registrationData);

            if (result.success) {
                setSuccessMessage(result.message || 'Account created successfully.');
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    phone: '',
                    nidFrontImage: '',
                    nidBackImage: '',
                    selfieImage: ''
                });

                if (onSuccess) {
                    onSuccess(result);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            {/* Step Indicator */}
            <div className="step-indicator">
                <div className={`step ${step >= 1 ? 'active' : ''}`}>
                    <span className="step-number">1</span>
                    <span className="step-label">Account</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${step >= 2 ? 'active' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-label">Verify</span>
                </div>
            </div>

            {step === 1 && (
                <>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            minLength="3"
                            disabled={loading}
                        />
                    </div>

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
                        <label htmlFor="phone">Phone Number (Optional)</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="+880 1XXX-XXXXXX"
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
                            minLength="6"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <div className="verification-info">
                        <h3>Identity Verification</h3>
                        <p>To access full features and help keep our community safe, please upload your verification documents.</p>
                    </div>

                    <div className="document-upload-grid">
                        <div className="document-upload">
                            <label>NID Card (Front)</label>
                            <div 
                                className={`upload-area ${formData.nidFrontImage ? 'has-image' : ''}`}
                                onClick={() => !skipVerification && nidFrontRef.current?.click()}
                            >
                                {formData.nidFrontImage ? (
                                    <img src={formData.nidFrontImage} alt="NID Front" />
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
                            </div>
                            <input
                                type="file"
                                ref={nidFrontRef}
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'nidFrontImage')}
                                style={{ display: 'none' }}
                                disabled={skipVerification}
                            />
                        </div>

                        <div className="document-upload">
                            <label>NID Card (Back)</label>
                            <div 
                                className={`upload-area ${formData.nidBackImage ? 'has-image' : ''}`}
                                onClick={() => !skipVerification && nidBackRef.current?.click()}
                            >
                                {formData.nidBackImage ? (
                                    <img src={formData.nidBackImage} alt="NID Back" />
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
                            </div>
                            <input
                                type="file"
                                ref={nidBackRef}
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'nidBackImage')}
                                style={{ display: 'none' }}
                                disabled={skipVerification}
                            />
                        </div>

                        <div className="document-upload">
                            <label>Your Selfie</label>
                            <div 
                                className={`upload-area ${formData.selfieImage ? 'has-image' : ''}`}
                                onClick={() => !skipVerification && selfieRef.current?.click()}
                            >
                                {formData.selfieImage ? (
                                    <img src={formData.selfieImage} alt="Selfie" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        <span>Click to upload</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={selfieRef}
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'selfieImage')}
                                style={{ display: 'none' }}
                                disabled={skipVerification}
                            />
                        </div>
                    </div>

                    <div className="skip-verification">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={skipVerification}
                                onChange={(e) => setSkipVerification(e.target.checked)}
                            />
                            <span>Skip verification for now (limited access)</span>
                        </label>
                    </div>
                </>
            )}

            {(error || formError) && (
                <p className="error-text">{error || formError}</p>
            )}

            {successMessage && !error && !formError && (
                <p className="success-text">{successMessage}</p>
            )}

            <div className="form-buttons">
                {step === 2 && (
                    <button
                        type="button"
                        className="back-btn"
                        onClick={() => setStep(1)}
                        disabled={loading}
                    >
                        Back
                    </button>
                )}
                <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : step === 1 ? 'Next' : 'Create Account'}
                </button>
            </div>
        </form>
    );
};

export default RegisterForm;