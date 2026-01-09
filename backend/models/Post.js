const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    type: {
        type: String,
        required: [true, 'Post type is required'],
        enum: {
            values: ['lost', 'found'],
            message: 'Type must be either "lost" or "found"'
        }
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['electronics', 'documents', 'jewelry', 'clothing', 'pets', 'bags', 'keys', 'other'],
            message: 'Please select a valid category'
        }
    },
    dateLost: {
        type: Date,
        required: function () { return this.type === 'lost'; }
    },
    dateFound: {
        type: Date,
        required: function () { return this.type === 'found'; }
    },
    location: {
        address: {
            type: String,
            required: [true, 'Location address is required'],
            trim: true
        },
        coordinates: {
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 }
        }
    },
    images: [{
        type: String,
        default: []
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'expired'],
        default: 'active'
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Index for better search performance
postSchema.index({ title: 'text', description: 'text', tags: 'text' });
postSchema.index({ type: 1, category: 1, status: 1 });
postSchema.index({ userId: 1 });
postSchema.index({ createdAt: -1 });

// Virtual for formatted dates
postSchema.virtual('formattedDate').get(function () {
    return this.type === 'lost' ? this.dateLost : this.dateFound;
});

module.exports = mongoose.model('Post', postSchema);