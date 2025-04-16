const express = require('express');
const { recordAction } = require('../services/score.service');
const { protect } = require('../middleware/auth.middleware');
const { apiLimiter } = require('../middleware/ratelimit.middleware');
const { ApiError } = require('../utils/errors');
const router = express.Router();

/**
 * @route   POST /api/scores/update
 * @desc    Record action and update score
 * @access  Private
 */
router.post('/update', protect, apiLimiter, async (req, res, next) => {
  try {
    const { actionType, actionMetadata, timestamp } = req.body;
    
    if (!actionType) {
      throw new ApiError(400, 'Action type is required');
    }
    
    const result = await recordAction(
      req.user.id,
      req.user.username,
      { actionType, actionMetadata, timestamp }
    );
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;