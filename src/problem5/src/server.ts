import { createApp } from './app';
import { dbConnect } from './config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = createApp();
const PORT = process.env.PORT || 3000;

// Connect to database and start server
dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });