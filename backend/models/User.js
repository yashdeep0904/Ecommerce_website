import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true, 
    trim: true
  },
  password: { 
    type: String, 
    required: true, 
    select: false // CRITICAL: This ensures passwords never leak in standard API responses
  },
  role: { 
    type: String, 
    default: 'user' // Default to standard customer. Admins must be manually promoted.
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, { timestamps: true });

// Note: No pre('save') middleware is used. 
// Password hashing is explicitly handled inside authController.js

const User = mongoose.model('User', userSchema);
export default User;