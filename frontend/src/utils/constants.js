export const CATEGORIES = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'documents', label: 'Documents' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'pets', label: 'Pets' },
    { value: 'bags', label: 'Bags' },
    { value: 'keys', label: 'Keys' },
    { value: 'other', label: 'Other' }
];

export const POST_TYPES = [
    { value: 'lost', label: 'Lost Item' },
    { value: 'found', label: 'Found Item' }
];

export const API_URL = process.env.REACT_APP_API_URL || (
    process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'
);
export const APP_NAME = process.env.REACT_APP_APP_NAME || 'FindX';