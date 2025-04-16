import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { productRoutes } from './routes/product.routes';
import { errorHandler } from './middleware/error.middleware';
import { dbConnect } from './config/database';

export const createApp = (): Application => {
  const app: Application = express();

  // Middleware
  app.use(helmet()); // Security headers
  app.use(cors()); // Allow cross-origin requests
  app.use(morgan('dev')); // HTTP request logger
  app.use(express.json()); // Parse JSON bodies
  
  // Routes
  app.use('/api/products', productRoutes);
  
  // Error handler
  app.use(errorHandler);
  
  return app;
};

// Connect to database and start server if this file is run directly
if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 3000;
  
  // Connect to database
  dbConnect()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}