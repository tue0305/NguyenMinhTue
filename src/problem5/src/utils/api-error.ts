export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    
    // Ensure the right prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}