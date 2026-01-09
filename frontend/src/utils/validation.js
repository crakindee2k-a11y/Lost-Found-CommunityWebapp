// Validation utility functions for form inputs

export const validators = {
    required: (value) => {
        return value && value.trim() ? '' : 'This field is required';
    },

    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Please enter a valid email address';
    },

    minLength: (min) => (value) => {
        return value && value.length >= min ? '' : `Must be at least ${min} characters`;
    },

    maxLength: (max) => (value) => {
        return value && value.length <= max ? '' : `Must be no more than ${max} characters`;
    },

    password: (value) => {
        if (!value || value.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!/[A-Z]/.test(value)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(value)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(value)) {
            return 'Password must contain at least one number';
        }
        return '';
    },

    username: (value) => {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        return usernameRegex.test(value) 
            ? '' 
            : 'Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores';
    },

    phone: (value) => {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(value) && value.length >= 10 
            ? '' 
            : 'Please enter a valid phone number';
    },

    url: (value) => {
        try {
            new URL(value);
            return '';
        } catch {
            return 'Please enter a valid URL';
        }
    },

    number: (value) => {
        return !isNaN(value) && value !== '' ? '' : 'Must be a valid number';
    },

    positiveNumber: (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0 ? '' : 'Must be a positive number';
    },

    date: (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) ? '' : 'Please enter a valid date';
    },

    pastDate: (value) => {
        const date = new Date(value);
        const now = new Date();
        return date < now ? '' : 'Date must be in the past';
    },

    futureDate: (value) => {
        const date = new Date(value);
        const now = new Date();
        return date > now ? '' : 'Date must be in the future';
    }
};

// Combine multiple validators
export const combineValidators = (...validators) => {
    return (value) => {
        for (const validator of validators) {
            const error = validator(value);
            if (error) return error;
        }
        return '';
    };
};

// Common validation presets
export const validationPresets = {
    email: combineValidators(validators.required, validators.email),
    password: combineValidators(validators.required, validators.password),
    username: combineValidators(validators.required, validators.username),
    phone: combineValidators(validators.required, validators.phone),
    url: combineValidators(validators.required, validators.url),
    requiredText: validators.required,
    requiredNumber: combineValidators(validators.required, validators.number),
};


