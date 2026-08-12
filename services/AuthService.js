const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  static async register({ username, email, password, dateOfBirth }) {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      dateOfBirth
    });

    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user._id);

    return {
      user: user.toJSON(),
      tokens
    };
  }

  static async login(email, password) {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is banned
    if (user.isBanned) {
      if (user.bannedUntil && user.bannedUntil > new Date()) {
        throw new Error(`User is banned until ${user.bannedUntil}`);
      } else if (user.bannedUntil) {
        // Ban expired, unban user
        user.isBanned = false;
        user.bannedUntil = null;
        await user.save();
      }
    }

    // Compare password
    const isValid = await user.comparePassword(password);

    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user._id);

    return {
      user: user.toJSON(),
      tokens
    };
  }

  static async refreshToken(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return this.generateTokens(userId);
  }

  static generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}

module.exports = AuthService;
