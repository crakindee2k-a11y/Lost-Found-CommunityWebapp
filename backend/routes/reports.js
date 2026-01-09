const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const auth = require('../middleware/auth');

// All report routes require authentication
router.use(auth);

// Create a new report
router.post('/', async (req, res) => {
    try {
        const { reportedUserId, reportedPostId, reason, description, evidence } = req.body;

        // Validate that at least one target is specified
        if (!reportedUserId && !reportedPostId) {
            return res.status(400).json({
                success: false,
                message: 'Must specify either a user or post to report'
            });
        }

        const report = new Report({
            reporterId: req.userId,
            reportedUserId: reportedUserId || null,
            reportedPostId: reportedPostId || null,
            reason,
            description,
            evidence: evidence || []
        });

        await report.save();

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully. Our team will review it shortly.',
            report: {
                id: report._id,
                status: report.status
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map(e => e.message).join(', ')
            });
        }

        console.error('Error creating report:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting report'
        });
    }
});

// Get user's own reports
router.get('/my', async (req, res) => {
    try {
        const reports = await Report.find({ reporterId: req.userId })
            .populate('reportedUserId', 'username')
            .populate('reportedPostId', 'title')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            reports
        });
    } catch (error) {
        console.error('Error fetching user reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your reports'
        });
    }
});

module.exports = router;
