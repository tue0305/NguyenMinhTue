const express = require('express');
const { authenticateUser } = require('../services/auth.service');
const { authLimiter } = require('../middleware/ratelimit.middleware');
const { ApiError } = require('../utils/errors');
const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      throw new ApiError(400, 'Please provide username and password');
    }
    
    const result = await authenticateUser(username, password);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;