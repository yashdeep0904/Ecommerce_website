import rateLimit from 'express-rate-limit';


// 1. Create the Limiter Configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes timeframe
  max: 50, // Allow exactly 20 requests per IP within the 15 minutes
  message: { 
    success: false, 
    message: "Too many login attempts from this IP, please try again after 15 minutes." 
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default loginLimiter;