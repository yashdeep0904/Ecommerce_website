import express from 'express';
import { createProduct, getProducts, updateProduct, deleteProduct, createProductReview, getProductById } from '../controllers/productController.js';
import { requireAdmin, requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Publicly viewable
router.get('/', getProducts);

// Admin-only protected routes
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);
router.post('/:id/reviews', requireAuth, createProductReview);
router.get('/:id', getProductById);

export default router;