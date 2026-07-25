import Cart from '../models/Cart.js';

export const getCart = async (req, res) => {
  try {
    // 🟢 Ensure we are finding the cart specific to this user
    let cart = await Cart.findOne({ user: req.user._id });
    
    // If no cart exists, create a fresh one for them
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cart", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { product, name, price, image } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === product);

    if (itemIndex > -1) {
      // 🟢 Item exists: Increase quantity AND "Self-Heal" missing images/prices
      cart.items[itemIndex].quantity += 1;
      if (image) cart.items[itemIndex].image = image; 
      if (price) cart.items[itemIndex].price = price;
    } else {
      // 🟢 New item
      cart.items.push({ product, name, price, image, quantity: 1 });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to add to cart", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
    }
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to update quantity", error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    await cart.save();
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to remove item", error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to clear cart", error: error.message });
  }
};