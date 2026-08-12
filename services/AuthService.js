const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

class AuthService {
  static async register({ username, email, password, dateOfBirth }) {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error('Email or username already in use');
    }

    // Calculate age group
    const age = this.calculateAge(dateOfBirth);
    const ageGroup = this.getAgeGroup(age);

    // Verify age is at least 13
    if (age < 13) {
      throw new Error('Users must be at least 13 years old');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      dateOfBirth,
      ageGroup
    });

    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user._id);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        ageGroup: user.ageGroup
      },
      ...tokens
    };
  }

  static async login(email, password) {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Check if banned
    if (user.isBanned) {
      throw new Error('User account is banned');
    }

    // Generate tokens
    const tokens = this.generateTokens(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        ageGroup: user.ageGroup
      },
      ...tokens
    };
  }

  static async refreshToken(userId) {
    const user = await User.findById(userId);
    if (!user || user.isBanned) {
      throw new Error('Invalid user');
    }

    return this.generateTokens(user._id);
  }

  static generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  static calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  static getAgeGroup(age) {
    if (age < 18) return '13-17';
    if (age < 26) return '18-25';
    if (age < 36) return '26-35';
    if (age < 51) return '36-50';
    return '50+';
  }
}

module.exports = AuthService;
