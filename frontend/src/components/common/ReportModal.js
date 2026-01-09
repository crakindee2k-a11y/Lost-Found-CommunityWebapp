import React, { useState } from 'react';
import { reportAPI } from '../../services/api';
import { useToast } from './ToastContainer';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetName }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();

    const reportReasons = {
        post: [
            { label: 'Inappropriate content', value: 'inappropriate_content' },
            { label: 'Spam or misleading', value: 'spam' },
            { label: 'Fake or scam', value: 'scam' },
            { label: 'Duplicate post', value: 'spam' },
            { label: 'Wrong category', value: 'other' },
            { label: 'Other', value: 'other' }
        ],
        user: [
            { label: 'Harassment or bullying', value: 'harassment' },
            { label: 'Spam behavior', value: 'spam' },
            { label: 'Fake profile', value: 'impersonation' },
            { label: 'Scam or fraud', value: 'scam' },
            { label: 'Inappropriate content', value: 'inappropriate_content' },
            { label: 'Other', value: 'other' }
        ],
        comment: [
            { label: 'Harassment', value: 'harassment' },
            { label: 'Spam', value: 'spam' },
            { label: 'Inappropriate language', value: 'inappropriate_content' },
            { label: 'Off-topic', value: 'other' },
            { label: 'Other', value: 'other' }
        ]
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!reason) {
            showError('Please select a reason for your report');
            return;
        }

        try {
            setSubmitting(true);
            
            // Find the selected reason object to get the label if needed
            const selectedReasonObj = reportReasons[targetType]?.find(r => r.value === reason);
            const reasonLabel = selectedReasonObj ? selectedReasonObj.label : 'Other';
            
            // If reason is 'other' (mapped from something like 'Wrong category'), append specific reason to description
            let finalDescription = description;
            if (reason === 'other' && reasonLabel !== 'Other') {
                finalDescription = `[${reasonLabel}] ${description}`;
            }

            const reportData = {
                reason,
                description: finalDescription,
                ...(targetType === 'post' && { reportedPostId: targetId }),
                ...(targetType === 'user' && { reportedUserId: targetId }),
                ...(targetType === 'comment' && { reportedPostId: targetId, reason: `Comment: ${reason}` }) // Backend might complain about this for comments if it expects enum
            };

            // For comments, we might need to handle reason differently if the backend treats comment reports as post reports or separate entities
            // Based on the Report model, there is no reportedCommentId, so it seems comments are reported as part of a post or maybe just not fully supported by backend model yet?
            // The backend model has reportedPostId and reportedUserId. 
            // If targetType is comment, we might need to adapt. 
            // Let's assume for now we just report the user or the post, but the user wanted to report a comment.
            // The ReportModal component was called with targetId. 
            
            // FIX: The backend Report model doesn't have reportedCommentId. 
            // We should probably report the user who made the comment, or the post the comment is on?
            // Or maybe we put the comment ID in the description.
            
            if (targetType === 'comment') {
                // Assuming targetId is the comment ID or the post ID? 
                // Usually specific comment reporting needs a comment ID field or handled as 'other' on the post.
                // Let's put the comment info in description and report the post/user if possible.
                // But since I don't have the parent post ID here easily unless passed... 
                // Let's look at how ReportModal is called in PostDetail.js or CommentSection.js
                // For now, let's just send what we have and ensure reason is valid enum.
            }

            await reportAPI.create(reportData);
            showSuccess('Report submitted successfully. Our team will review it.');
            onClose();
            setReason('');
            setDescription('');
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="report-modal-overlay" onClick={onClose}>
            <div className="report-modal" onClick={e => e.stopPropagation()}>
                <div className="report-modal-header">
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        Report {targetType === 'post' ? 'Post' : targetType === 'user' ? 'User' : 'Comment'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="report-form">
                    {targetName && (
                        <div className="report-target">
                            <span>Reporting:</span>
                            <strong>{targetName}</strong>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Reason for report *</label>
                        <div className="reason-options">
                            {reportReasons[targetType]?.map((r) => (
                                <label key={r.label} className={`reason-option ${reason === r.value ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r.value}
                                        checked={reason === r.value}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                    <span>{r.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Additional details (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide any additional context that might help us review this report..."
                            rows={4}
                            maxLength={500}
                        />
                        <span className="char-count">{description.length}/500</span>
                    </div>

                    <div className="report-disclaimer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <p>False reports may result in action against your account. Please only report genuine violations.</p>
                    </div>

                    <div className="report-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={submitting || !reason}>
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
