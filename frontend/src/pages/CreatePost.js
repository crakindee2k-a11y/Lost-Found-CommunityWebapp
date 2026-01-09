import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import PostForm from '../components/posts/PostForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './CreatePost.css';

const CreatePost = () => {
    const { isAuthenticated, loading, user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [editPost, setEditPost] = useState(null);
    const [fetchingPost, setFetchingPost] = useState(false);
    
    const isEditMode = !!id;
    const isVerified = user?.verificationStatus === 'verified';

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    useEffect(() => {
        if (isEditMode && id) {
            fetchPostForEdit();
        } else if (location.state?.post) {
            setEditPost(location.state.post);
        }
    }, [id, isEditMode]);

    const fetchPostForEdit = async () => {
        try {
            setFetchingPost(true);
            const response = await postAPI.getById(id);
            
            if (response.data.success) {
                setEditPost(response.data.post);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
            navigate('/dashboard');
        } finally {
            setFetchingPost(false);
        }
    };

    if (loading || fetchingPost) {
        return <LoadingSpinner text={fetchingPost ? "Loading post..." : "Checking authentication..."} />;
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    // Block unverified users
    if (!isVerified && !isEditMode) {
        const statusMessages = {
            pending: {
                title: 'Verification Pending',
                message: 'Your verification is being reviewed. Please wait for approval before creating posts.',
                icon: '⏳'
            },
            rejected: {
                title: 'Verification Rejected',
                message: 'Your verification was rejected. Please resubmit your documents to create posts.',
                icon: '❌'
            },
            unverified: {
                title: 'Verification Required',
                message: 'You need to be a verified user to create posts. Please submit your verification documents.',
                icon: '🔒'
            }
        };
        const status = statusMessages[user?.verificationStatus] || statusMessages.unverified;

        return (
            <div className="create-post-page">
                <div className="verification-required-block">
                    <div className="verification-icon">{status.icon}</div>
                    <h2>{status.title}</h2>
                    <p>{status.message}</p>
                    <div className="verification-actions">
                        {user?.verificationStatus !== 'pending' && (
                            <Link to="/verify" className="btn btn-primary">
                                Submit Verification
                            </Link>
                        )}
                        <Link to="/dashboard" className="btn btn-secondary">
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="create-post-page">
            <div className="page-header">
                <h1>{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>
                <p>{isEditMode ? 'Update your post details' : 'Help reunite people with their lost items by creating a post'}</p>
            </div>
            <PostForm editData={editPost} />
        </div>
    );
};

export default CreatePost;