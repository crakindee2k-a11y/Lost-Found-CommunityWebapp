// Utility functions
const validateEmail = (email) => {
    const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

const validatePhone = (phone) => {
    const re = /^\+?[\d\s-()]{10,}$/;
    return re.test(phone);
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

module.exports = {
    validateEmail,
    validatePhone,
    sanitizeInput,
    formatDate
};