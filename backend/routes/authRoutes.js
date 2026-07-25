import express from 'express';
import { 
  sendSignupOtp, 
  verifySignupOtp, 
  finalizeSignup, 
  loginWithPassword, 
  sendLoginOtp, 
  loginWithOtp, 
  refreshToken, 
  logout,
   // 1. Import the new function
} from '../controllers/authController.js';



const router = express.Router();

router.post('/signup/send-otp', sendSignupOtp);
router.post('/signup/verify-otp', verifySignupOtp);
router.post('/signup/finalize', finalizeSignup);

router.post('/login/password',loginWithPassword);
router.post('/login/send-otp',sendLoginOtp);
router.post('/login/verify-otp', loginWithOtp);

router.post('/refresh', refreshToken);
router.post('/logout', logout);



export default router;