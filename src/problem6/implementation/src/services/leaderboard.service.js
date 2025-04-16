const Score = require('../models/score.model');
const User = require('../models/user.model');
const { logger } = require('../utils/logger');
const redis = require('../utils/redis');
const { broadcast } = require('./websocket.service');

// Cache duration for leaderboard in seconds
const LEADERBOARD_CACHE_DURATION = 60; // 1 minute

/**
 * Gets the current top 10 leaderboard
 */
exports.getLeaderboard = async () => {
  try {
    // Try to get cached leaderboard
    const cachedLeaderboard = await redis.get('leaderboard:top10');
    
    if (cachedLeaderboard) {
      return {
        updatedAt: await redis.get('leaderboard:lastUpdated') || Date.now(),
        leaderboard: JSON.parse(cachedLeaderboard)
      };
    }
    
    // If not cached, fetch from database
    const leaderboard = await fetchLeaderboardFromDB();
    
    // Cache the result
    await redis.set(
      'leaderboard:top10',
      JSON.stringify(leaderboard),
      'EX',
      LEADERBOARD_CACHE_DURATION
    );
    
    // Store the update timestamp
    await redis.set(
      'leaderboard:lastUpdated',
      Date.now(),
      'EX',
      LEADERBOARD_CACHE_DURATION
    );
    
    return {
      updatedAt: Date.now(),
      leaderboard
    };
  } catch (error) {
    logger.error('Error getting leaderboard:', error);
    throw error;
  }
};

/**
 * Publishes a score update event
 */
exports.publishScoreUpdate = async (userId, username, newScore, change, position) => {
  try {
    const updateData = {
      type: 'score_update',
      userId,
      username,
      newScore,
      change,
      newPosition: position
    };
    
    // Broadcast the update to all connected clients
    broadcast(updateData);
    
    // If this update might affect the top 10, refresh the leaderboard
    if (position <= 10) {
      await refreshLeaderboard();
    }
  } catch (error) {
    logger.error('Error publishing score update:', error);
  }
};

/**
 * Refreshes the cached leaderboard and broadcasts the update
 */
async function refreshLeaderboard() {
  try {
    // Fetch fresh leaderboard data
    const leaderboard = await fetchLeaderboardFromDB();
    
    // Update the cache
    await redis.set(
      'leaderboard:top10',
      JSON.stringify(leaderboard),
      'EX',
      LEADERBOARD_CACHE_DURATION
    );
    
    await redis.set(
      'leaderboard:lastUpdated',
      Date.now(),
      'EX',
      LEADERBOARD_CACHE_DURATION
    );
    
    // Broadcast the updated leaderboard
    broadcast({
      type: 'leaderboard_update',
      leaderboard
    });
  } catch (error) {
    logger.error('Error refreshing leaderboard:', error);
  }
}

/**
 * Fetches the top 10 leaderboard from the database
 */
async function fetchLeaderboardFromDB() {
  // Get top 10 scores
  const topScores = await Score.find()
    .sort({ score: -1 })
    .limit(10)
    .lean();
  
  // Get user details
  const userIds = topScores.map(score => score.userId);
  const users = await User.find({ _id: { $in: userIds } })
    .select('username')
    .lean();
  
  // Map users to scores
  const userMap = {};
  users.forEach(user => {
    userMap[user._id.toString()] = user.username;
  });
  
  // Format the leaderboard entries
  return topScores.map((score, index) => ({
    userId: score.userId.toString(),
    username: userMap[score.userId.toString()] || 'Unknown User',
    score: score.score,
    position: index + 1
  }));
}