const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema({
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['warn', 'ban', 'unban', 'mute', 'unmute', 'kick']
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  duration: {
    type: Number,
    default: null // in days, null for permanent
  },
  expiresAt: {
    type: Date,
    default: null
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

moderatorLogSchema.index({ targetUser: 1 });
moderatorLogSchema.index({ moderator: 1 });
moderatorLogSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('ModerationLog', moderationLogSchema);
