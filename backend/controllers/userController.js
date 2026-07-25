import User from '../models/User.js';


import bcrypt from 'bcryptjs';

// UPDATE USER PROFILE METADATA
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, shippingAddress } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (shippingAddress) user.shippingAddress = shippingAddress;

    const updatedUser = await user.save();
    
    // Strip sensitive fields before returning
    const sanitizedUser = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      shippingAddress: updatedUser.shippingAddress,
      role: updatedUser.role
    };

    res.status(200).json(sanitizedUser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error during profile sync." });
  }
};

// SECURE PASSWORD MODIFICATION ENGINE
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All parameters are mandatory." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User account context dropped." });
    }

    // 1. Verify historic password matches hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current authorization password invalid." });
    }

    // 2. Hash new token sequence and update document
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Cryptographic pipeline alteration failed." });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // .select('-password') ensures we never accidentally send hashes to the frontend
    // .sort({ createdAt: -1 }) shows the newest users first
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user database." });
  }
};

// ==========================================
// GET USER WISHLIST (Populated with Product Details)
// ==========================================
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) return res.status(404).json({ message: "User session not found." });
    
    res.status(200).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error while gathering wishlist metrics." });
  }
};

// ==========================================
// TOGGLE WISHLIST ITEM (Add if missing, Remove if present)
// ==========================================
export const toggleWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User session not found." });

    const isAdded = user.wishlist.includes(productId);

    if (isAdded) {
      // Pull/Remove product from array
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
      await user.save();
      return res.status(200).json({ message: "Item removed from wishlist.", wishlist: user.wishlist, isWishlisted: false });
    } else {
      // Push/Add product to array
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({ message: "Item saved to wishlist.", wishlist: user.wishlist, isWishlisted: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update wishlist state." });
  }
};