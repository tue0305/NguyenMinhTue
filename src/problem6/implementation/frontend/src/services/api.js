import axios from 'axios';

// API service for interacting with the backend
const api = {
  // Get the leaderboard
  getLeaderboard: async () => {
    try {
      const response = await axios.get('/api/leaderboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },
  
  // Record an action to increase score
  recordAction: async (actionType, actionMetadata = {}) => {
    try {
      const response = await axios.post('/api/scores/update', {
        actionType,
        actionMetadata,
        timestamp: Date.now()
      });
      return response.data;
    } catch (error) {
      console.error('Error recording action:', error);
      throw error;
    }
  }
};

export default api;