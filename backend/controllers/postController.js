const Post = require('../models/Post');
const User = require('../models/User');

// Helper function to extract general location from address
const getGeneralLocation = (address) => {
    if (!address) return 'Location hidden';
    
    // Split by comma and trim
    const parts = address.split(',').map(p => p.trim()).filter(p => p.length > 0);
    
    if (parts.length >= 2) {
        // Return first 2 parts (e.g., "Sylhet, Shajalal Road...")
        return parts.slice(0, 2).join(', ') + '...';
    } else if (parts.length === 1) {
        // If single part, try to split by spaces
        const words = parts[0].split(' ').filter(w => w.length > 0);
        if (words.length >= 3) {
            // Show first 2-3 words
            return words.slice(0, 3).join(' ') + '...';
        }
        // Short address, show as is
        return parts[0];
    }
    return 'Location hidden';
};

// Helper function to censor sensitive data for unverified users
const censorPostData = (post, isVerified) => {
    if (isVerified) {
        return post; // Return full data for verified users
    }

    // Convert to plain object if it's a Mongoose document
    const postObj = post.toObject ? post.toObject() : { ...post };

    // Censor location - show general area only
    if (postObj.location && postObj.location.address) {
        postObj.location.fullAddress = postObj.location.address; // Keep for reference
        postObj.location.address = getGeneralLocation(postObj.location.address);
        // Remove exact coordinates
        postObj.location.coordinates = null;
    }

    // Censor ONLY contact info in description (phone/email), NOT the whole text
    if (postObj.description) {
        // Censor phone numbers (various formats)
        postObj.description = postObj.description.replace(
            /(\+?\d{1,4}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{2,5}[-.\s]?\d{2,9}/g,
            '[Contact Hidden]'
        );
        // Censor email addresses
        postObj.description = postObj.description.replace(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            '[Email Hidden]'
        );
    }

    // Censor user contact info
    if (postObj.userId && typeof postObj.userId === 'object') {
        if (postObj.userId.email) {
            postObj.userId.email = '[Verify to see email]';
        }
        if (postObj.userId.phone) {
            postObj.userId.phone = '[Verify to see phone]';
        }
    }

    // Mark as censored for frontend to show verification prompt
    postObj.isCensored = true;

    return postObj;
};

// Helper to check if user is verified
const checkUserVerification = async (userId) => {
    if (!userId) return false;
    const user = await User.findById(userId).select('verificationStatus');
    return user && user.verificationStatus === 'verified';
};

// Get all posts with filtering and pagination
exports.getAllPosts = async (req, res) => {
    try {
        const {
            type,
            category,
            search,
            page = 1,
            limit = 10,
            userId,
            status
        } = req.query;

        let filter = {};

        // Build filter object
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (userId) filter.userId = userId;
        if (status) filter.status = status;

        // Text search
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const posts = await Post.find(filter)
            .populate('userId', 'username email avatar phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Post.countDocuments(filter);

        // Check if requesting user is verified
        const isVerified = await checkUserVerification(req.userId);

        // Censor posts for unverified users
        const processedPosts = posts.map(post => censorPostData(post, isVerified));

        res.json({
            success: true,
            posts: processedPosts,
            pagination: {
                current: pageNum,
                pages: Math.ceil(total / limitNum),
                total
            },
            isVerifiedUser: isVerified
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching posts'
        });
    }
};

// Get single post
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('userId', 'username email avatar phone');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if requesting user is verified
        const isVerified = await checkUserVerification(req.userId);

        // Censor post data for unverified users
        const processedPost = censorPostData(post, isVerified);

        res.json({
            success: true,
            post: processedPost,
            isVerifiedUser: isVerified
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        console.error('Error fetching post:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching post'
        });
    }
};

// Create new post
exports.createPost = async (req, res) => {
    try {
        // Check if user is verified - only verified users can create posts
        const user = await User.findById(req.userId).select('verificationStatus');
        if (!user || user.verificationStatus !== 'verified') {
            const messages = {
                'rejected': 'Your verification was rejected. Please resubmit your documents to create posts.',
                'pending': 'Your verification is pending. Please wait for approval to create posts.',
                'unverified': 'You need to be a verified user to create posts. Please submit your verification documents.'
            };
            return res.status(403).json({
                success: false,
                message: messages[user?.verificationStatus] || messages.unverified,
                requiresVerification: true
            });
        }

        const postData = {
            ...req.body,
            userId: req.userId
        };

        // Validate date fields based on post type
        if (postData.type === 'lost' && !postData.dateLost) {
            return res.status(400).json({
                success: false,
                message: 'Date lost is required for lost items'
            });
        }

        if (postData.type === 'found' && !postData.dateFound) {
            return res.status(400).json({
                success: false,
                message: 'Date found is required for found items'
            });
        }

        const post = new Post(postData);
        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('userId', 'username email avatar');

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post: populatedPost
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating post'
        });
    }
};

// Update post
exports.updatePost = async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user owns the post
        if (post.userId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this post'
            });
        }

        post = await Post.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate('userId', 'username email avatar');

        res.json({
            success: true,
            message: 'Post updated successfully',
            post
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        console.error('Error updating post:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating post'
        });
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user owns the post
        if (post.userId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post'
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting post'
        });
    }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId })
            .populate('userId', 'username email avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            posts
        });
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user posts'
        });
    }
};