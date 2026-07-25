import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Added bcryptjs for manual hashing
import User from '../models/User.js';
import redisClient from '../config/redis.js';
import sendEmail from '../utils/sendEmail.js';

// Update this object at the top of controllers/authController.js
// const cookieOptions = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production only
//   sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // 'lax' allows cross-port local dev
// };

const cookieOptions = {
  httpOnly: true,
  secure: true, // MUST be true for cross-site cookies
  sameSite: 'none', // CRITICAL: This allows the cookie to be sent between different Render URLs
  maxAge: 7 * 24 * 60 * 60 * 1000 // Or whatever your expiry is
};

// Utility to generate Access & Refresh Tokens
const issueTokens = (res, userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  res.cookie('access_token', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

/* ==========================================
   PHASE 1: REGISTRATION & OTP
   ========================================== */

export const sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(403).json({ message: "Only @gmail.com addresses are permitted." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already registered." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.setEx(`signup_otp:${email}`, 300, otp); // Expires in 5 mins

    await sendEmail(email, "ShopHub Verification Code", `Your verification code is: ${otp}. It expires in 5 minutes.`);

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("OTP Error Details:", error);
    res.status(500).json({ message: "Server error during OTP generation." });
  }
};

export const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const cachedOtp = await redisClient.get(`signup_otp:${email}`);
    if (!cachedOtp) return res.status(400).json({ message: "OTP expired or invalid." });
    if (cachedOtp !== otp) return res.status(400).json({ message: "Incorrect OTP." });

    await redisClient.del(`signup_otp:${email}`);

    // Issue a temporary setup cookie to allow access to SetPassword screen
    const setupToken = jwt.sign({ email }, process.env.JWT_SETUP_SECRET, { expiresIn: '15m' });
    res.cookie('setup_session', setupToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

    res.status(200).json({ message: "Email verified. Proceed to set password." });
  } catch (error) {
    res.status(500).json({ message: "Server error during verification." });
  }
}; 

export const finalizeSignup = async (req, res) => {
  try {
    const { name, password } = req.body;
    const setupToken = req.cookies.setup_session;

    if (!setupToken) return res.status(401).json({ message: "Unauthorized. Please verify email first." });

    const decoded = jwt.verify(setupToken, process.env.JWT_SETUP_SECRET);
    const email = decoded.email;

    const assignedRole = email === 'dhankharyashdeep@gmail.com' ? 'admin' : 'user';
    
    // --- MANUALLY HASH PASSWORD BEFORE SAVING ---
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save with the securely hashed password
    const newUser = await User.create({ 
      name, 
      email, 
      password: hashedPassword ,
      role: assignedRole
    });

    res.clearCookie('setup_session');
    issueTokens(res, newUser._id);

    res.status(201).json({ message: "Account created securely.", user: { name: newUser.name, email: newUser.email } });
  } catch (error) {
    // Check if it's the specific MongoDB Duplicate Key Error (Code 11000)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }
    
    // Otherwise, it's a generic server error
    console.error(error);
    res.status(500).json({ message: "Failed to create account." });
  }
}

/* ==========================================
   PHASE 2: SECURE LOGIN
   ========================================== */

export const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // --- MANUALLY COMPARE HASHED PASSWORD ---
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    issueTokens(res, user._id);
    // res.status(200).json({ message: "Logged in successfully", user: { name: user.name, email: user.email } });

    res.status(200).json({ message: "Logged in successfully", user: { name: user.name, email: user.email, role: user.role } });

  } catch (error) {
    res.status(500).json({ message: "Server error during login." });
  }
};

export const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Account not found." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.setEx(`login_otp:${email}`, 300, otp); 

    await sendEmail(email, "ShopHub Login Code", `Your secure login code is: ${otp}. Do not share this.`);

    res.status(200).json({ message: "Login OTP sent." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

export const loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const cachedOtp = await redisClient.get(`login_otp:${email}`);
    if (!cachedOtp || cachedOtp !== otp) return res.status(401).json({ message: "Invalid or expired OTP." });

    await redisClient.del(`login_otp:${email}`);
    
    const user = await User.findOne({ email });
    issueTokens(res, user._id);

    // res.status(200).json({ message: "Logged in via OTP", user: { name: user.name, email: user.email } });

    res.status(200).json({ message: "Logged in via OTP", user: { name: user.name, email: user.email, role: user.role } });

  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

/* ==========================================
   PHASE 3: SESSION MANAGEMENT
   ========================================== */

export const refreshToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refresh_token;
    if (!incomingRefreshToken) return res.status(401).json({ message: "Session expired." });

    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
    
    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    res.cookie('access_token', newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

    res.status(200).json({ message: "Token refreshed silently." });
  } catch (error) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(403).json({ message: "Invalid refresh token. Please log in again." });
  }
};

export const logout = (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('setup_session');
  res.status(200).json({ message: "Logged out securely." });
};



