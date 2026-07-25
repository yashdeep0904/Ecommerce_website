import Order from '../models/Order.js';

// ==========================================
// CREATE NEW ORDER (Authenticated User)
// ==========================================
export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: "No order items found." });
    }

    const order = new Order({
      // req.user._id comes from your standard auth middleware!
      user: req.user._id, 
      orderItems,
      shippingAddress,
      totalPrice
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Server error while creating your order." });
  }
};

// ==========================================
// GET LOGGED-IN USER'S ORDERS (Customer Only)
// ==========================================

export const getMyOrders = async (req, res) => {
    try {
      // Find orders belonging to the authenticated user and sort by newest
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      
      if (!orders) {
        return res.status(404).json({ message: "No orders found." });
      }
  
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to retrieve your order history." });
    }
  };
  /**
 * Automates inventory reconciliation when an order is paid.
 * Use this inside your Payment Webhook or Payment Success handler.
 */
export const processPaymentSuccess = async (orderId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // 1. Fetch order and populate product references
      const order = await Order.findById(orderId).populate('orderItems.product');
      
      if (!order || order.isPaid) {
        throw new Error("Order not found or already processed.");
      }
  
      // 2. Iterate through items to check stock and decrement
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product._id);
        
        if (!product) throw new Error(`Product ${item.name} not found.`);
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
  
        // Decrement stock
        product.stock -= item.quantity;
        await product.save({ session });
      }
  
      // 3. Mark order as paid
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Paid';
      await order.save({ session });
  
      await session.commitTransaction();
      console.log(`✅ Order ${orderId} processed: Inventory updated and status set to Paid.`);
    } catch (error) {
      await session.abortTransaction();
      console.error("🔴 Inventory Reconciliation Failed:", error.message);
      throw error;
    } finally {
      session.endSession();
    }
  };


// GET ALL ORDERS (Admin Only)
export const getAdminOrders = async (req, res) => {
    try {
      // Fetch orders and populate the user details (name, email)
      const orders = await Order.find({})
        .populate('user', 'id name email')
        .sort({ createdAt: -1 }); // Newest first
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders." });
    }
  };
  
  // UPDATE ORDER STATUS (Admin Only)
  export const updateOrderStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findById(req.params.id);
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      order.status = status;
      
      // If marked as delivered, record the timestamp
      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
  
      const updatedOrder = await order.save();
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status." });
    }
  };