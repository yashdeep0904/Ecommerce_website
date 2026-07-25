// Inside routes/orderRoutes.js

import express from 'express';
import { 
  createOrder, 
  getAdminOrders, 
  updateOrderStatus, 
  getMyOrders // Make sure to import the controller we just built!
} from '../controllers/orderController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Customer Routes ---
router.post('/', requireAuth, createOrder);

// 🟢 ADD IT HERE: Fetch logged-in user's orders
router.get('/myorders', requireAuth, getMyOrders); 

// --- Admin Routes ---
router.get('/admin', requireAdmin, getAdminOrders);
router.put('/admin/:id/status', requireAdmin, updateOrderStatus);

export default router;