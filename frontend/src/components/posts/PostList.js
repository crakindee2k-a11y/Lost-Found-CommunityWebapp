import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PostItem from './PostItem';
import EmptyState from '../common/EmptyState';
import { SkeletonPost } from '../common/SkeletonLoader';
import './PostList.css';

const PostList = ({ posts, loading, error, emptyMessage = "No posts found" }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="post-list">
                <SkeletonPost />
                <SkeletonPost />
                <SkeletonPost />
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState
                type="error"
                title="Oops! Something went wrong"
                message={error || "We couldn't load the posts. Please try again later."}
                actionText="Reload Page"
                onAction={() => window.location.reload()}
            />
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <EmptyState
                type={emptyMessage.includes('match') ? 'no-results' : 'no-posts'}
                title={emptyMessage.includes('match') ? 'No posts match your search' : 'No posts available yet'}
                message={emptyMessage.includes('match') 
                    ? 'Try adjusting your filters or be the first to post in this category!' 
                    : 'Be the first to help the community by posting a lost or found item!'}
                actionText={isAuthenticated ? 'Create Post' : 'Get Started'}
                actionLink={isAuthenticated ? '/create-post' : '/register'}
            />
        );
    }

    return (
        <div className="post-list">
            {posts.map((post) => (
                <PostItem key={post._id} post={post} />
            ))}
        </div>
    );
};

export default PostList;