import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. Verify the user is logged in
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json({ message: "Unauthorized. No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) return res.status(401).json({ message: "User not found." });
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// 2. Verify the user has Admin privileges
export const requireAdmin = async (req, res, next) => {
    try {
      const token = req.cookies.access_token;
      if (!token) return res.status(401).json({ message: "Unauthorized. No session found." });
  
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden. Admin clearance required." });
      }
  
      req.user = user; // Attach user to request for downstream use
      next(); // Pass control to the controller
    } catch (error) {
      res.status(401).json({ message: "Unauthorized. Session expired." });
    }
}

export const protect = async (req, res, next) => {
  let token;

  // Check for HTTP-Only Cookie first, fallback to standard Bearer header
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Attach user to request, securely hiding the password
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: "User belonging to this token no longer exists." });
    }
    
    next(); // Pass control to the next function
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Unauthorized. Invalid or expired token." });
  }
};