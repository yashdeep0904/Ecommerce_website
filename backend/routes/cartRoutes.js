import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateQuantity, 
  removeFromCart, 
  clearCart 
} from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js'; // Adjust path if needed

const router = express.Router();

router.use(protect); // Secure ALL cart routes

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateQuantity);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);

export default router;