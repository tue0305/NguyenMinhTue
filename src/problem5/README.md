# Product API

A simple, RESTful API built with Express, TypeScript, and MongoDB for managing products.

## Features

- CRUD operations for products
- Filtering options for product listing
- Data persistence with MongoDB
- Type safety with TypeScript
- Error handling
- Input validation

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas connection)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd product-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/product-api
   ```

   Note: Adjust the `MONGODB_URI` if you're using MongoDB Atlas or a different setup.

## Running the Application

### Development Mode

```
npm run dev
```

This command starts the server with nodemon, which automatically restarts the server when you make changes.

### Production Build

```
npm run build
npm start
```

The first command compiles TypeScript to JavaScript, and the second command starts the server using the compiled code.

## API Endpoints

### Products

- **GET /api/products**: Get all products
  - Query parameters for filtering:
    - `category`: Filter by category (electronics, clothing, books, food, other)
    - `inStock`: Filter by availability (true/false)
    - `minPrice`: Filter by minimum price
    - `maxPrice`: Filter by maximum price
    - `search`: Search by name

- **GET /api/products/:id**: Get a product by ID

- **POST /api/products**: Create a new product
  - Required fields:
    - `name`: Product name (string, max 100 chars)
    - `description`: Product description (string, max 1000 chars)
    - `price`: Product price (number, >= 0)
    - `category`: Product category (enum: electronics, clothing, books, food, other)
  - Optional fields:
    - `inStock`: Product availability (boolean, default: true)

- **PUT /api/products/:id**: Update a product by ID

- **DELETE /api/products/:id**: Delete a product by ID

## Examples

### Create a Product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 149.99,
    "category": "electronics",
    "inStock": true
  }'
```

### Get All Products

```bash
# Get all products
curl http://localhost:3000/api/products

# Filter by category
curl http://localhost:3000/api/products?category=electronics

# Filter by price range
curl http://localhost:3000/api/products?minPrice=50&maxPrice=200

# Search by name
curl http://localhost:3000/api/products?search=headphones
```

### Get a Product by ID

```bash
curl http://localhost:3000/api/products/60a1c2b3d4e5f6a7b8c9d0e1
```

### Update a Product

```bash
curl -X PUT http://localhost:3000/api/products/60a1c2b3d4e5f6a7b8c9d0e1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 129.99,
    "inStock": false
  }'
```

### Delete a Product

```bash
curl -X DELETE http://localhost:3000/api/products/60a1c2b3d4e5f6a7b8c9d0e1
```

## Testing

To run tests:

```
npm test
```

## Project Structure

```
src/
├── config/         # Configuration files
│   └── database.ts # Database connection setup
├── controllers/    # Request handlers
│   └── product.controller.ts
├── middleware/     # Express middleware
│   └── error.middleware.ts
├── models/         # Mongoose models
│   └── product.model.ts
├── routes/         # API routes
│   └── product.routes.ts
├── utils/          # Utility functions
│   └── api-error.ts
├── app.ts          # Express app setup
└── server.ts       # Entry point
```

## License

MIT