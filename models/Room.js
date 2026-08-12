const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  ageGroup: {
    type: String,
    required: true,
    enum: ['13-17', '18-25', '26-35', '36-45', '46-55', '56+']
  },
  minAge: {
    type: Number,
    required: true
  },
  maxAge: {
    type: Number,
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxMembers: {
    type: Number,
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

roomSchema.index({ ageGroup: 1 });
roomSchema.index({ creator: 1 });
roomSchema.index({ members: 1 });

module.exports = mongoose.model('Room', roomSchema);
