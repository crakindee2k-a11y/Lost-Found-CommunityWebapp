import React, { useState } from 'react';
import { messageAPI } from '../../services/api';
import { useToast } from '../common/ToastContainer';
import './MessageModal.css';

const MessageModal = ({ receiverId, receiverName, postId, postTitle, onClose }) => {
    const { showSuccess, showError } = useToast();
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        
        if (!message.trim()) {
            showError('Please enter a message');
            return;
        }

        try {
            setSending(true);
            const response = await messageAPI.send({
                receiverId,
                content: message,
                postId
            });

            if (response.data.success) {
                showSuccess('Message sent successfully!');
                onClose();
            }
        } catch (error) {
            showError('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="message-modal-backdrop" onClick={handleBackdropClick}>
            <div className="message-modal">
                <div className="modal-header">
                    <h2>Send Message</h2>
                    <button className="close-modal-btn" onClick={onClose} aria-label="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="modal-info">
                    <div className="recipient-info">
                        <div className="recipient-avatar">
                            {receiverName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="recipient-name">To: {receiverName}</p>
                            {postTitle && (
                                <p className="regarding-post">Regarding: {postTitle}</p>
                            )}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSend} className="message-form">
                    <label htmlFor="message-input">Your Message</label>
                    <textarea
                        id="message-input"
                        className="message-input"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Hi! I have information about your post..."
                        rows="6"
                        maxLength="1000"
                        disabled={sending}
                    />
                    <div className="message-meta">
                        <span className="char-count">{message.length}/1000</span>
                    </div>

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="cancel-modal-btn" 
                            onClick={onClose}
                            disabled={sending}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="send-message-btn"
                            disabled={!message.trim() || sending}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MessageModal;








