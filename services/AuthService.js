const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { differenceInYears } = require('date-fns');

class AuthService {
  static async register(userData) {
    const { username, email, password, dateOfBirth } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error('User already exists with that email or username');
    }

    // Calculate age
    const age = differenceInYears(new Date(), new Date(dateOfBirth));
    if (age < 13) {
      throw new Error('User must be at least 13 years old');
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      dateOfBirth
    });

    await user.save();

    const token = generateToken(user._id);
    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        age: user.age,
        ageGroup: user.ageGroup
      },
      token
    };
  }

  static async login(email, password) {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if password matches
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      throw new Error('Invalid credentials');
    }

    // Check if user is banned
    if (user.isBannedNow()) {
      throw new Error('User is banned');
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user._id);
    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        age: user.age,
        ageGroup: user.ageGroup,
        avatar: user.avatar
      },
      token
    };
  }

  static async refreshToken(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const token = generateToken(user._id);
    return { token };
  }
}

module.exports = AuthService;
