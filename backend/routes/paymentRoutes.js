import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { createRazorpayOrder, handleRazorpayWebhook, verifyPaymentAndCreateOrder } from '../controllers/paymentController.js';

const router = express.Router();

// Only logged-in customers can access payment routes
router.post('/razorpay/create-order', requireAuth, createRazorpayOrder);
router.post('/razorpay/verify-payment', requireAuth, verifyPaymentAndCreateOrder);
router.post('/webhook', handleRazorpayWebhook);

export default router; 