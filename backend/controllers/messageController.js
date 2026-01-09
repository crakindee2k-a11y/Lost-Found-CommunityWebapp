const Message = require('../models/Message');
const User = require('../models/User');

// Get conversations for a user
exports.getConversations = async (req, res) => {
    try {
        const userId = req.userId;

        // Get unique conversation partners
        const messages = await Message.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        })
        .populate('senderId', 'username email')
        .populate('receiverId', 'username email')
        .populate('postId', 'title type')
        .sort({ createdAt: -1 })
        .lean();

        // Group by conversation partner
        const conversationsMap = new Map();
        
        messages.forEach(msg => {
            const partnerId = msg.senderId._id.toString() === userId 
                ? msg.receiverId._id.toString() 
                : msg.senderId._id.toString();
            
            if (!conversationsMap.has(partnerId)) {
                conversationsMap.set(partnerId, {
                    partner: msg.senderId._id.toString() === userId ? msg.receiverId : msg.senderId,
                    lastMessage: msg,
                    unreadCount: 0
                });
            }
            
            // Count unread messages
            if (msg.receiverId._id.toString() === userId && !msg.isRead) {
                conversationsMap.get(partnerId).unreadCount++;
            }
        });

        const conversations = Array.from(conversationsMap.values());

        res.json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversations'
        });
    }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
    try {
        const { userId: otherUserId } = req.params;
        const currentUserId = req.userId;

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: currentUserId }
            ]
        })
        .populate('senderId', 'username email')
        .populate('receiverId', 'username email')
        .populate('postId', 'title type')
        .sort({ createdAt: 1 })
        .lean();

        // Mark messages as read
        await Message.updateMany(
            { senderId: otherUserId, receiverId: currentUserId, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content, postId } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Receiver ID and message content are required'
            });
        }

        // Prevent sending message to self
        if (receiverId === req.userId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot send message to yourself'
            });
        }

        // Verify receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found'
            });
        }

        const message = new Message({
            senderId: req.userId,
            receiverId,
            content,
            postId: postId || null
        });

        await message.save();
        await message.populate('senderId', 'username email');
        await message.populate('receiverId', 'username email');
        
        if (postId) {
            await message.populate('postId', 'title type');
        }

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map(e => e.message).join(', ')
            });
        }

        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only sender can delete
        if (message.senderId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this message'
            });
        }

        await message.deleteOne();

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting message'
        });
    }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiverId: req.userId,
            isRead: false
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unread count'
        });
    }
};
