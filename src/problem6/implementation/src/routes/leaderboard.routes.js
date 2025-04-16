const express = require('express');
const { getLeaderboard } = require('../services/leaderboard.service');
const { apiLimiter } = require('../middleware/ratelimit.middleware');
const router = express.Router();

/**
 * @route   GET /api/leaderboard
 * @desc    Get the top 10 users on the leaderboard
 * @access  Public
 */
router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const leaderboard = await getLeaderboard();
    
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

module.exports = router;