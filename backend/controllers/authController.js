const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('❌ JWT_SECRET is not set! Using insecure fallback for development only.');
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET must be set in production');
        }
    }
    const expiresIn = process.env.JWT_EXPIRE || '7d';

    return jwt.sign({ userId }, secret || 'dev-secret-key-CHANGE-IN-PRODUCTION', {
        expiresIn
    });
};

// Register User
exports.register = async (req, res) => {
    try {
        const { 
            username, 
            email, 
            password,
            phone,
            nidFrontImage,
            nidBackImage,
            selfieImage
        } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Determine verification status based on provided documents
        let verificationStatus = 'unverified';
        if (nidFrontImage && nidBackImage && selfieImage) {
            verificationStatus = 'pending';
        }

        // Create new user with verification documents
        const user = new User({ 
            username, 
            email, 
            password,
            phone: phone || '',
            nidFrontImage: nidFrontImage || '',
            nidBackImage: nidBackImage || '',
            selfieImage: selfieImage || '',
            verificationStatus
        });
        await user.save();

        const message = verificationStatus === 'pending' 
            ? 'Account created successfully. Your verification is pending review.'
            : 'Account created successfully. Please submit verification documents to access full features.';

        res.status(201).json({
            success: true,
            message,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verificationStatus: user.verificationStatus
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended',
                banReason: user.banReason
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                verificationStatus: user.verificationStatus
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Get Current User
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if banned
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended',
                banReason: user.banReason
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                _id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                verificationStatus: user.verificationStatus,
                rejectionReason: user.rejectionReason,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user data'
        });
    }
};