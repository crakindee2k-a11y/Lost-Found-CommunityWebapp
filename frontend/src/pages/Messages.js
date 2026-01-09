import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../services/api';
import { useToast } from '../components/common/ToastContainer';
import EmptyState from '../components/common/EmptyState';
import './Messages.css';

const Messages = () => {
    const { user } = useAuth();
    const { showError } = useToast();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.partner._id);
        }
    }, [selectedConversation]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await messageAPI.getConversations();
            
            if (response.data.success) {
                setConversations(response.data.conversations || []);
            }
        } catch (error) {
            showError('Error loading conversations');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const response = await messageAPI.getMessages(userId);
            
            if (response.data.success) {
                setMessages(response.data.messages || []);
            }
        } catch (error) {
            showError('Error loading messages');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            setSending(true);
            const response = await messageAPI.send({
                receiverId: selectedConversation.partner._id,
                content: newMessage,
                postId: selectedConversation.lastMessage.postId?._id
            });

            if (response.data.success) {
                setMessages([...messages, response.data.data]);
                setNewMessage('');
            }
        } catch (error) {
            showError('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="messages-page">
                <div className="loading-messages">Loading messages...</div>
            </div>
        );
    }

    return (
        <div className="messages-page">
            <div className="messages-container">
                {/* Conversations List */}
                <div className="conversations-sidebar">
                    <h2 className="sidebar-title">Messages</h2>
                    
                    {conversations.length === 0 ? (
                        <div className="no-conversations">
                            <p>No messages yet</p>
                            <small>Contact post owners to start a conversation</small>
                        </div>
                    ) : (
                        <div className="conversations-list">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.partner._id}
                                    className={`conversation-item ${selectedConversation?.partner._id === conv.partner._id ? 'active' : ''}`}
                                    onClick={() => setSelectedConversation(conv)}
                                >
                                    <div className="conv-avatar">
                                        {conv.partner.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="conv-info">
                                        <div className="conv-header">
                                            <span className="conv-name">{conv.partner.username}</span>
                                            {conv.unreadCount > 0 && (
                                                <span className="unread-badge">{conv.unreadCount}</span>
                                            )}
                                        </div>
                                        <p className="conv-preview">
                                            {conv.lastMessage.content.substring(0, 50)}...
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Messages Thread */}
                <div className="messages-thread">
                    {selectedConversation ? (
                        <>
                            <div className="thread-header">
                                <div className="thread-user-info">
                                    <div className="thread-avatar">
                                        {selectedConversation.partner.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3>{selectedConversation.partner.username}</h3>
                                        {selectedConversation.lastMessage.postId && (
                                            <p className="thread-post-title">
                                                Re: {selectedConversation.lastMessage.postId.title}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="messages-list">
                                {messages.map((msg) => {
                                    const isSent = msg.senderId._id === user.id || msg.senderId._id === user._id;
                                    return (
                                        <div key={msg._id} className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                                            <p className="message-content">{msg.content}</p>
                                            <span className="message-time">{formatTime(msg.createdAt)}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <form className="message-input-form" onSubmit={handleSendMessage}>
                                <textarea
                                    className="message-textarea"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    rows="2"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    className="send-btn"
                                    disabled={!newMessage.trim() || sending}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="no-conversation-selected">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <h3>Select a conversation</h3>
                            <p>Choose a conversation from the left to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;








