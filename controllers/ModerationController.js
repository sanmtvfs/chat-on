const ModerationService = require('../services/ModerationService');
const Report = require('../models/Report');

class ModerationController {
  static async reportMessage(req, res) {
    try {
      const userId = req.user._id;
      const { reportedMessage, reason, description, room } = req.body;

      const report = new Report({
        reporter: userId,
        reportedMessage,
        reason,
        description,
        room
      });

      await report.save();

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async reportUser(req, res) {
    try {
      const userId = req.user._id;
      const { reportedUser, reason, description } = req.body;

      const report = new Report({
        reporter: userId,
        reportedUser,
        reason,
        description
      });

      await report.save();

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getReports(req, res) {
    try {
      const { status = 'pending' } = req.query;

      const reports = await Report.find({ status })
        .populate('reporter', 'username email')
        .populate('reportedUser', 'username email')
        .populate('reportedMessage')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: reports
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async reviewReport(req, res) {
    try {
      const { reportId } = req.params;
      const { status, action } = req.body;
      const reviewerId = req.user._id;

      const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      report.status = status;
      report.action = action;
      report.reviewedBy = reviewerId;
      report.reviewedAt = new Date();

      await report.save();

      res.status(200).json({
        success: true,
        message: 'Report reviewed successfully',
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async warnUser(req, res) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      const user = await ModerationService.warnUser(userId, reason);

      res.status(200).json({
        success: true,
        message: 'User warned successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async banUser(req, res) {
    try {
      const { userId } = req.params;
      const { reason, days } = req.body;

      const user = await ModerationService.banUser(userId, reason, days);

      res.status(200).json({
        success: true,
        message: 'User banned successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async unbanUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await ModerationService.unbanUser(userId);

      res.status(200).json({
        success: true,
        message: 'User unbanned successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = ModerationController;
