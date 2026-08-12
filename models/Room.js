const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a room name'],
      trim: true,
      unique: true
    },
    description: {
      type: String,
      maxlength: 500
    },
    ageGroup: {
      type: String,
      enum: ['child', 'teen', 'adult', 'mixed'],
      required: true
    },
    minAge: {
      type: Number,
      required: true
    },
    maxAge: {
      type: Number,
      default: null
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
    isPrivate: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    maxMembers: {
      type: Number,
      default: 1000
    },
    banner: String,
    rules: [String]
  },
  { timestamps: true }
);

roomSchema.index({ ageGroup: 1, isActive: 1 });

module.exports = mongoose.model('Room', roomSchema);
