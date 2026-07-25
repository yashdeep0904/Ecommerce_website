import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { processPaymentSuccess } from './orderController.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================================
// 1. CREATE RAZORPAY ORDER
// ==========================================
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount." });
    }

    // Razorpay expects amount in the smallest currency subunit (paise for INR, cents for USD)
    // Let's assume INR for this integration. 500 INR = 50000 paise.
    const options = {
      amount: Math.round(amount * 100), 
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: "Failed to create Razorpay order" });
    }

    // Send the order ID to the frontend
    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ message: "Server error while initializing payment gateway." });
  }
};

// ==========================================
// 2. VERIFY PAYMENT & SAVE TO DB
// ==========================================
export const verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderItems,
      shippingAddress,
      totalPrice
    } = req.body;

    // 1. Mathematically verify the signature using your Secret Key
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid payment signature. Transaction failed." });
    }

    // 2. Signature is valid! The payment is real. Now save it to MongoDB.
    const newOrder = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      totalPrice,
      isPaid: true, // Mark as paid immediately!
      paidAt: Date.now(),
      paymentResult: {
        id: razorpay_payment_id,
        status: 'completed',
      }
    });

    const createdOrder = await newOrder.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ message: "Server error while verifying payment." });
  }
};

export const handleRazorpayWebhook = async (req, res) => {
    try {
      // 1. SECURITY: Verify the signature comes from actual Razorpay
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');
  
      if (digest !== req.headers['x-razorpay-signature']) {
        console.error("🔴 SEC ALARM: Invalid Razorpay Webhook Signature Detected!");
        return res.status(400).json({ message: 'Invalid signature' });
      }
  
      // 2. ROUTING: Check which event Razorpay is reporting
      const event = req.body.event;
  
      if (event === 'payment.captured') {
        // Extract your MongoDB Order ID from the Razorpay notes object
        // (Ensure you attach 'notes: { orderId: order._id }' when creating the Razorpay order initially)
        const orderId = req.body.payload.payment.entity.notes.orderId;
  
        if (orderId) {
          console.log(`🔵 Webhook Verified: Payment captured for Order ${orderId}. Starting reconciliation...`);
          
          // 3. THE TRIGGER: Deduct stock and mark as Paid!
          await processPaymentSuccess(orderId);
        }
      }
  
      // 4. THE HANDSHAKE: Always return 200 OK, otherwise Razorpay will retry this webhook for 24 hours
      res.status(200).json({ status: 'ok' });
  
    } catch (error) {
      console.error("🔴 Webhook Processing Error:", error.message);
      // We still return 200 to Razorpay so they don't spam our server, 
      // but the error is logged in our terminal for Admin review.
      res.status(200).json({ status: 'error_logged_internally' });
    }
  };