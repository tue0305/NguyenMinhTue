import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';

export const productRoutes = Router();

// Get all products and create a new product
productRoutes.route('/')
  .get(getAllProducts)
  .post(createProduct);

// Get, update, and delete a product by ID
productRoutes.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);