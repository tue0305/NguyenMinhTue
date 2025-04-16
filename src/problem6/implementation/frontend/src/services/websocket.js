class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {
      leaderboard_update: [],
      score_update: []
    };
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }
  
  connect(token) {
    if (this.socket) {
      this.disconnect();
    }
    
    try {
      this.socket = new WebSocket(`ws://${window.location.hostname}:3000/api/live/leaderboard?token=${token}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.connected = true;
        this.reconnectAttempts = 0;
      };
      
      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed', event);
        this.connected = false;
        
        // Attempt to reconnect if not closed cleanly and we haven't exceeded max attempts
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.connect(token);
          }, delay);
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Dispatch to appropriate listeners
          if (data.type && this.listeners[data.type]) {
            this.listeners[data.type].forEach(callback => {
              callback(data);
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }
  
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
    }
  }
  
  addListener(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    
    this.listeners[eventType].push(callback);
    
    // Return a function to remove this listener
    return () => {
      this.listeners[eventType] = this.listeners[eventType].filter(
        cb => cb !== callback
      );
    };
  }
  
  isConnected() {
    return this.connected;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;