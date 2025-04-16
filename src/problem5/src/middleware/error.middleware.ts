import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import mongoose from 'mongoose';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);
  
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  // Handle specific error types
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.name === 'MongoError' && (err as any).code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }
  
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};