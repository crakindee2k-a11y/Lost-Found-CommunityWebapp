import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../../services/api';
import { useToast } from '../common/ToastContainer';
import { CATEGORIES, POST_TYPES } from '../../utils/constants';
import MapPicker from './MapPicker';
import './PostForm.css';

const PostForm = ({ editData = null }) => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);

    const [formData, setFormData] = useState({
        title: editData?.title || '',
        description: editData?.description || '',
        type: editData?.type || 'lost',
        category: editData?.category || 'other',
        dateLost: editData?.dateLost ? new Date(editData.dateLost).toISOString().split('T')[0] : '',
        dateFound: editData?.dateFound ? new Date(editData.dateFound).toISOString().split('T')[0] : '',
        location: {
            address: editData?.location?.address || '',
            coordinates: editData?.location?.coordinates || null
        },
        tags: editData?.tags?.join(', ') || ''
    });

    // Load existing images if editing
    useEffect(() => {
        if (editData?.images && editData.images.length > 0) {
            setImagePreview(editData.images);
        }
    }, [editData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'address') {
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, address: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length + imagePreview.length > 5) {
            showError('Maximum 5 images allowed');
            return;
        }

        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                showError('Only image files are allowed');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                showError('Image size must be less than 5MB');
                return false;
            }
            return true;
        });

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(prev => [...prev, reader.result]);
                setUploadedImages(prev => [...prev, file]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImagePreview(prev => prev.filter((_, i) => i !== index));
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleLocationSelect = (locationData) => {
        setFormData(prev => ({
            ...prev,
            location: {
                address: locationData.address,
                coordinates: locationData.coordinates
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const submitData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                images: imagePreview // Store base64 images (for now - can upgrade to cloud storage later)
            };

            // Add appropriate date field based on type
            if (formData.type === 'lost') {
                submitData.dateLost = formData.dateLost;
                delete submitData.dateFound;
            } else {
                submitData.dateFound = formData.dateFound;
                delete submitData.dateLost;
            }

            let result;
            if (editData) {
                result = await postAPI.update(editData._id, submitData);
            } else {
                result = await postAPI.create(submitData);
            }

            if (result.data.success) {
                showSuccess(editData ? 'Post updated successfully!' : 'Post created successfully!');
                setTimeout(() => navigate('/dashboard'), 500);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Error saving post';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-form-container">
            <h2>{editData ? 'Edit Post' : 'Create New Post'}</h2>

            <form className="post-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="type">Post Type *</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            {POST_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        maxLength="100"
                        disabled={loading}
                        placeholder="Brief description of the item"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        maxLength="1000"
                        rows="4"
                        disabled={loading}
                        placeholder="Detailed description of the item, including any identifying features..."
                    />
                    <small>{formData.description.length}/1000 characters</small>
                </div>

                {/* Photo Upload Section */}
                <div className="form-group">
                    <label>Photos (Optional)</label>
                    <div className="photo-upload-section">
                        <label htmlFor="photo-upload" className="photo-upload-label">
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                disabled={loading || imagePreview.length >= 5}
                                className="photo-upload-input"
                            />
                            <div className="upload-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                            </div>
                            <span className="upload-text">Click to upload photos</span>
                            <span className="upload-hint">PNG, JPG up to 5MB • Max 5 photos</span>
                        </label>
                        
                        {imagePreview.length > 0 && (
                            <div className="image-preview-grid">
                                {imagePreview.map((img, index) => (
                                    <div key={index} className="image-preview-item">
                                        <img src={img} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={() => removeImage(index)}
                                            aria-label="Remove image"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor={formData.type === 'lost' ? 'dateLost' : 'dateFound'}>
                            {formData.type === 'lost' ? 'Date Lost *' : 'Date Found *'}
                        </label>
                        <input
                            type="date"
                            id={formData.type === 'lost' ? 'dateLost' : 'dateFound'}
                            name={formData.type === 'lost' ? 'dateLost' : 'dateFound'}
                            value={formData.type === 'lost' ? formData.dateLost : formData.dateFound}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Location Address *</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.location.address}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Where was it lost/found?"
                        />
                    </div>
                </div>

                {/* Map Picker */}
                <MapPicker 
                    onLocationSelect={handleLocationSelect}
                    initialAddress={formData.location.address}
                />

                <div className="form-group">
                    <label htmlFor="tags">Tags (comma separated)</label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="phone, wallet, keys, etc."
                    />
                    <small>Add relevant keywords to help people find your post</small>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate('/')}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (editData ? 'Update Post' : 'Create Post')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostForm;