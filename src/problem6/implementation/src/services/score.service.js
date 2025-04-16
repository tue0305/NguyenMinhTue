const Score = require('../models/score.model');
const Action = require('../models/action.model');
const User = require('../models/user.model');
const { logger } = require('../utils/logger');
const { ApiError } = require('../utils/errors');
const { publishScoreUpdate } = require('./leaderboard.service');
const redis = require('../utils/redis');

// Action types and their score values
const ACTION_SCORE_VALUES = {
  COMPLETE_TASK: 10,
  WIN_GAME: 50,
  DAILY_LOGIN: 5,
  SHARE_CONTENT: 15
};

/**
 * Records an action and updates the user's score
 */
exports.recordAction = async (userId, username, actionData) => {
  try {
    // Validate action type
    if (!ACTION_SCORE_VALUES[actionData.actionType]) {
      throw new ApiError(400, 'Invalid action type');
    }
    
    // Check for duplicate action ID using Redis for faster lookups
    const actionId = actionData.id || `${userId}-${Date.now()}`;
    const isDuplicate = await redis.get(`action:${actionId}`);
    
    if (isDuplicate) {
      throw new ApiError(400, 'Action already processed');
    }
    
    // Apply rate limiting for this action type
    const rateLimitKey = `ratelimit:${actionData.actionType}:${userId}`;
    const currentCount = await redis.incr(rateLimitKey);
    
    // First time? Set expiry
    if (currentCount === 1) {
      await redis.expire(rateLimitKey, 60 * 60); // 1 hour expiry
    }
    
    // Check rate limit (e.g., 5 actions of this type per hour)
    const actionRateLimit = getActionRateLimit(actionData.actionType);
    if (currentCount > actionRateLimit) {
      throw new ApiError(429, 'Rate limit exceeded for this action type');
    }
    
    // Calculate score value
    const scoreValue = ACTION_SCORE_VALUES[actionData.actionType];
    
    // Create action record
    const action = await Action.create({
      id: actionId,
      userId,
      type: actionData.actionType,
      timestamp: actionData.timestamp || Date.now(),
      scoreValue,
      metadata: actionData.actionMetadata || {},
      processed: false
    });
    
    // Mark action as processed in Redis (for idempotency)
    await redis.set(`action:${actionId}`, '1', 'EX', 86400); // 24 hour expiry
    
    // Update user score
    let score = await Score.findOne({ userId });
    
    // If user doesn't have a score record yet, create one
    if (!score) {
      score = await Score.create({
        userId,
        score: scoreValue,
        lastUpdated: Date.now()
      });
    } else {
      // Update existing score
      score.score += scoreValue;
      score.lastUpdated = Date.now();
      await score.save();
    }
    
    // Mark action as processed in database
    action.processed = true;
    await action.save();
    
    // Get user's new leaderboard position
    const position = await getLeaderboardPosition(userId);
    
    // Publish score update event
    await publishScoreUpdate(userId, username, score.score, scoreValue, position);
    
    return {
      success: true,
      newScore: score.score,
      leaderboardPosition: position
    };
  } catch (error) {
    logger.error('Error recording action:', error);
    throw error;
  }
};

/**
 * Gets the leaderboard position for a user
 */
async function getLeaderboardPosition(userId) {
  try {
    const userScore = await Score.findOne({ userId });
    
    if (!userScore) {
      return null;
    }
    
    // Count how many users have higher scores
    const higherScores = await Score.countDocuments({
      score: { $gt: userScore.score }
    });
    
    // Position is 1-based
    return higherScores + 1;
  } catch (error) {
    logger.error('Error getting leaderboard position:', error);
    return null;
  }
}

/**
 * Returns the rate limit for a specific action type
 */
function getActionRateLimit(actionType) {
  const limits = {
    COMPLETE_TASK: 20,   // 20 tasks per hour
    WIN_GAME: 10,        // 10 game wins per hour
    DAILY_LOGIN: 1,      // 1 daily login per hour
    SHARE_CONTENT: 5     // 5 shares per hour
  };
  
  return limits[actionType] || 5; // Default to 5
}