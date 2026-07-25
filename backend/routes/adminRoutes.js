import express from 'express';
import { requireAdmin } from '../middlewares/authMiddleware.js'; 
import { 
  getAllUsers, 
  updateUserRole, 
  deleteUser,
  getAllOrders,       
  updateOrderStatus,
  getDashboardStats // 👈 IMPORT THE NEW FUNCTION
} from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAdmin); 

// --- DASHBOARD ROUTE ---
router.get('/stats', getDashboardStats); // 👈 ADD THIS NEW ROUTE

// --- USER ROUTES ---
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// --- ORDER ROUTES ---
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;