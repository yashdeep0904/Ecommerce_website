import 'dotenv/config'; // Automatically loads environment variables
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

const app = express();

// 1. Enterprise Security Middleware
app.use(helmet()); 
app.use(express.json());
app.use(cookieParser()); // Critical for reading HTTP-Only cookies

app.use(cors({
  origin: [
    'http://localhost:5173',
  'https://ecommerce-website-frontend-hhuq.onrender.com'
  ], // Update this to match your React frontend URL
  credentials: true, // Critical for allowing cookies cross-origin
}));

// 2. Brute Force Protection (Limits OTP spamming)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, 
  message: "Too many attempts from this IP, please try again after 15 minutes"
});
app.use('/api/auth', authLimiter);

// 3. Database Connection
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected securely');
} catch (err) {
  console.error('❌ DB Connection Error:', err);
  process.exit(1); // Stop server if DB fails
}

app.get('/', (req, res) => {
  res.status(200).json({ message: "Ecommerce website backend server is active and secure." });
});

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes); 
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);

// 5. Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Secure ES6 E-Commerce Server running on port ${PORT}`);
});