const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, disconnectDB } = require('./config/database');

// Connect to database
connectDB().catch((error) => {
    console.error('❌ Failed to initialize database connection:', error.message);
    process.exit(1);
});

const app = express();

// Security & Optimization Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "https://nominatim.openstreetmap.org"],
            imgSrc: ["'self'", "data:", "https://*.tile.openstreetmap.org", "https://cdnjs.cloudflare.com", "https://*.openstreetmap.org"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: null
        }
    }
}));
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    skip: (req) => req.path === '/api/health' // Skip rate limiting for health checks
});
app.use('/api', limiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (avatars, uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'FindX API is running!',
        timestamp: new Date().toISOString()
    });
});

if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '..', 'frontend', 'build');
    app.use(express.static(clientBuildPath));

    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        return res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}

// 404 handler
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.errors
        });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    // Don't leak stack traces in production
    const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message || 'Internal server error';

    res.status(error.status || 500).json({
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down server...');
    await disconnectDB();
    process.exit(0);
});