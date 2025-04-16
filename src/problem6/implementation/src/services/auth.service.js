const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { logger } = require('../utils/logger');
const { ApiError } = require('../utils/errors');

/**
 * Authenticates a user and generates a JWT token
 */
exports.authenticateUser = async (username, password) => {
  try {
    // Find user by username
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    // Update last active timestamp
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });
    
    // Generate JWT token
    const token = generateToken(user._id);
    const expiresIn = process.env.JWT_EXPIRE || '24h';
    
    return { token, expiresIn };
  } catch (error) {
    logger.error('Authentication error:', error);
    throw error;
  }
};

/**
 * Verifies a JWT token and returns the user ID
 */
exports.verifyToken = async (token) => {
  try {
    if (!token) {
      throw new ApiError(401, 'No token provided');
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }
    
    return { userId: user._id, username: user.username };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token');
    }
    
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    }
    
    logger.error('Token verification error:', error);
    throw error;
  }
};

/**
 * Generates a JWT token for a user
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};