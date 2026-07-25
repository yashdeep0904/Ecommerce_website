import User from '../models/User.js';
import Order from '../models/Order.js'; 
import Product from '../models/Product.js';

// Fetch all users (excluding passwords)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

// // Update user role (e.g., promote to admin)
// export const updateUserRole = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { role } = req.body;

//     const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
//     if (!user) return res.status(404).json({ message: "User not found." });

//     res.status(200).json({ message: "User role updated.", user });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to update role." });
//   }
// };

// Inside your admin controller to fetch all orders:

const getAllOrdersForAdmin = async (req, res) => {
    // This automatically swaps the user ID with their actual Name and Email!
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'title'); 
      
    res.status(200).json(orders);
  };

  // ==========================================
// 1. UPDATE USER ROLE (Admin Only)
// ==========================================
export const updateUserRole = async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
  
      // SECURITY CHECK: Prevent an admin from changing their own role
      if (req.user._id.toString() === id) {
        return res.status(403).json({ message: "Action Denied: You cannot modify your own clearance level." });
      }
  
      // Validate the role input
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified." });
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
      ).select('-password'); // Never return the password hash
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found in the database." });
      }
  
      res.status(200).json({ 
        message: `User clearance successfully updated to ${role}.`,
        user: updatedUser 
      });
  
    } catch (error) {
      console.error("Update Role Error:", error);
      res.status(500).json({ message: "Server error while updating user role." });
    }
  };
  
  // ==========================================
  // 2. DELETE USER ACCOUNT (Admin Only)
  // ==========================================
  export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
  
      // SECURITY CHECK: Prevent an admin from deleting themselves
      if (req.user._id.toString() === id) {
        return res.status(403).json({ message: "Action Denied: You cannot delete your own active administrator account." });
      }
  
      const deletedUser = await User.findByIdAndDelete(id);
  
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found in the database." });
      }
  
      res.status(200).json({ message: "User account permanently eradicated from the system." });
  
    } catch (error) {
      console.error("Delete User Error:", error);
      res.status(500).json({ message: "Server error while attempting to delete user." });
    }
  };



// ==========================================
// 3. GET ALL ORDERS (Admin Only)
// ==========================================
export const getAllOrders = async (req, res) => {
  try {
    // .populate() reaches into the User collection and grabs their name and email
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ message: "Server error while fetching orders." });
  }
};

// ==========================================
// 4. UPDATE ORDER STATUS (Admin Only)
// ==========================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status input against our schema enum
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status." });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      message: `Order status successfully updated to ${status}.`,
      order: updatedOrder
    });

  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ message: "Server error while updating order status." });
  }
};

// ==========================================
// GET DASHBOARD ANALYTICS (Admin Only)
// ==========================================
export const getDashboardStats = async (req, res) => {
    try {
      // 1. Fast counts for high-level metrics
      const totalUsers = await User.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalProducts = await Product.countDocuments();
  
      // 2. Aggregate Total Revenue
      const revenueCalc = await Order.aggregate([
        { 
          $group: { 
            _id: null, 
            totalRevenue: { $sum: "$totalPrice" } 
          } 
        }
      ]);
      const totalRevenue = revenueCalc.length > 0 ? revenueCalc[0].totalRevenue : 0;
  
      // 3. Aggregate Inventory by Category (For our Pie Chart)
      const inventoryByCategory = await Product.aggregate([
        { 
          $group: { 
            _id: "$category", 
            count: { $sum: 1 } 
          } 
        }
      ]);
  
      // Format the category data cleanly for the frontend chart
      const formattedCategoryData = inventoryByCategory.map(item => ({
        name: item._id,
        value: item.count
      }));
  
      // Send the compiled payload
      res.status(200).json({
        metrics: {
          totalUsers,
          totalOrders,
          totalProducts,
          totalRevenue
        },
        charts: {
          categoryData: formattedCategoryData
        }
      });
  
    } catch (error) {
      console.error("Analytics Aggregation Error:", error);
      res.status(500).json({ message: "Server error while compiling dashboard metrics." });
    }
  };