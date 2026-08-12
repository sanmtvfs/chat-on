const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    reason: {
      type: String,
      enum: ['profanity', 'harassment', 'spam', 'inappropriate', 'other'],
      required: true
    },
    description: {
      type: String,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    action: String,
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
