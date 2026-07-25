import express from 'express';
import { changePassword, getAllUsers, getWishlist, toggleWishlistItem, updateProfile } from '../controllers/userController.js';
import { requireAdmin, requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply the admin guard to the GET route
router.get('/', requireAdmin, getAllUsers);
router.get('/wishlist', requireAuth, getWishlist);
router.post('/wishlist/toggle', requireAuth, toggleWishlistItem);
router.put('/profile', requireAuth, updateProfile);
 router.put('/change-password', requireAuth, changePassword);

export default router;