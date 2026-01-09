import React, { useState } from 'react';
import './FormInput.css';

const FormInput = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    required = false,
    disabled = false,
    helperText,
    icon,
    validate,
    ...props
}) => {
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleBlur = (e) => {
        setTouched(true);
        
        if (validate && value) {
            const validationError = validate(value);
            setLocalError(validationError || '');
        }
        
        if (onBlur) {
            onBlur(e);
        }
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        
        if (touched && validate) {
            const validationError = validate(newValue);
            setLocalError(validationError || '');
        }
        
        onChange(e);
    };

    const showError = touched && (error || localError);

    return (
        <div className={`form-input-wrapper ${showError ? 'has-error' : ''} ${disabled ? 'disabled' : ''}`}>
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="required-indicator" aria-label="required">*</span>}
                </label>
            )}
            
            <div className="input-container">
                {icon && <div className="input-icon">{icon}</div>}
                
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`form-input ${icon ? 'has-icon' : ''}`}
                    aria-invalid={showError ? 'true' : 'false'}
                    aria-describedby={showError ? `${name}-error` : helperText ? `${name}-helper` : undefined}
                    {...props}
                />
                
                {showError && (
                    <div className="input-error-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </div>
                )}
                
                {!showError && value && (
                    <div className="input-success-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                )}
            </div>
            
            {showError && (
                <p id={`${name}-error`} className="input-error" role="alert">
                    {error || localError}
                </p>
            )}
            
            {!showError && helperText && (
                <p id={`${name}-helper`} className="input-helper">
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default FormInput;


