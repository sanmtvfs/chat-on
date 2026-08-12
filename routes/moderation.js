const express = require('express');
const router = express.Router();
const ModerationController = require('../controllers/ModerationController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { validateReport } = require('../middleware/validation');

// Protected routes - All users can report
router.post('/report/message', auth, validateReport, ModerationController.reportMessage);
router.post('/report/user', auth, validateReport, ModerationController.reportUser);

// Admin only routes
router.get('/reports', auth, adminAuth, ModerationController.getReports);
router.put('/reports/:reportId', auth, adminAuth, ModerationController.reviewReport);
router.post('/warn/:userId', auth, adminAuth, ModerationController.warnUser);
router.post('/ban/:userId', auth, adminAuth, ModerationController.banUser);
router.post('/unban/:userId', auth, adminAuth, ModerationController.unbanUser);

module.exports = router;
