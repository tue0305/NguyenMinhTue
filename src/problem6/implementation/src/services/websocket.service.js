const WebSocket = require('ws');
const { verifyToken } = require('./auth.service');
const { logger } = require('../utils/logger');
const url = require('url');

let wss;
const clients = new Map();

/**
 * Sets up the WebSocket server
 */
exports.setupWebSocketServer = (server) => {
  wss = new WebSocket.Server({ server, path: '/api/live/leaderboard' });
  
  wss.on('connection', async (ws, req) => {
    try {
      // Parse token from URL query
      const params = url.parse(req.url, true).query;
      const token = params.token;
      
      // Verify token and get user info
      const { userId, username } = await verifyToken(token);
      
      // Store client info
      clients.set(ws, { userId, username, connected: Date.now() });
      
      logger.info(`WebSocket client connected: ${username} (${userId})`);
      
      // Handle client disconnection
      ws.on('close', () => {
        clients.delete(ws);
        logger.info(`WebSocket client disconnected: ${username} (${userId})`);
      });
      
      // Send initial leaderboard data
      const { getLeaderboard } = require('./leaderboard.service');
      const leaderboardData = await getLeaderboard();
      
      ws.send(JSON.stringify({
        type: 'leaderboard_update',
        leaderboard: leaderboardData.leaderboard
      }));
    } catch (error) {
      logger.error('WebSocket connection error:', error);
      ws.close();
    }
  });
  
  // Periodic ping to keep connections alive
  setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    });
  }, 30000);
  
  return wss;
};

/**
 * Broadcasts a message to all connected clients
 */
exports.broadcast = (data) => {
  if (!wss) {
    logger.warn('WebSocket server not initialized');
    return;
  }
  
  const message = JSON.stringify(data);
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

/**
 * Gets the current number of connected clients
 */
exports.getConnectedClientsCount = () => {
  return clients.size;
};