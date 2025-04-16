const { verifyToken } = require('../services/auth.service');
const { ApiError } = require('../utils/errors');
const { logger } = require('../utils/logger');

/**
 * Middleware to protect routes that require authentication
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new ApiError(401, 'Not authorized to access this route'));
    }
    
    // Verify token
    const { userId, username } = await verifyToken(token);
    
    // Add user info to request
    req.user = { id: userId, username };
    
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    next(error);
  }
};