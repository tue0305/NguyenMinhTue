require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const { setupWebSocketServer } = require('./services/websocket.service');
const { logger } = require('./utils/logger');
const authRoutes = require('./routes/auth.routes');
const scoreRoutes = require('./routes/score.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Setup middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Setup WebSocket server for real-time updates
setupWebSocketServer(server);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // In production, consider graceful shutdown instead of process.exit
});