import { Request, Response, NextFunction } from 'express';
import { Product, IProduct } from '../models/product.model';
import { ApiError } from '../utils/api-error';

// Get all products with filtering options
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, inStock, minPrice, maxPrice, search } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (category) filter.category = category;
    if (inStock) filter.inStock = inStock === 'true';
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (search) filter.name = { $regex: search, $options: 'i' };
    
    // Execute query
    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single product by ID
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new product
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Update a product
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated product
        runValidators: true, // Run model validators
      }
    );
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};