const rateLimit = require('express-rate-limit');
const { ApiError } = require('../utils/errors');

/**
 * Rate limiter for API endpoints
 */
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests, please try again later'));
  }
});

/**
 * Rate limiter specifically for authentication endpoints
 */
exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many login attempts, please try again later'));
  }
});