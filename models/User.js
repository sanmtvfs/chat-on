const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { differenceInYears } = require('date-fns');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required for age verification']
    },
    age: {
      type: Number,
      computed: true
    },
    ageGroup: {
      type: String,
      enum: ['child', 'teen', 'adult'],
      required: true
    },
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: 200
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    banReason: String,
    bannedUntil: Date,
    lastActive: Date,
    rooms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    }],
    blockedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    warnings: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Calculate age before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('dateOfBirth')) {
    this.age = differenceInYears(new Date(), this.dateOfBirth);
    
    // Determine age group
    if (this.age < 13) {
      return next(new Error('User must be at least 13 years old'));
    } else if (this.age < 18) {
      this.ageGroup = 'teen';
    } else {
      this.ageGroup = 'adult';
    }
  }

  // Hash password if modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if user is banned
userSchema.methods.isBannedNow = function() {
  if (!this.isBanned) return false;
  if (this.bannedUntil && this.bannedUntil < new Date()) {
    return false;
  }
  return true;
};

module.exports = mongoose.model('User', userSchema);
