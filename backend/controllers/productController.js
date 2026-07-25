import Product from '../models/Product.js';

// Create a new product (Admin Only)
export const createProduct = async (req, res) => {
    try {
      // 👇 Ensure you are extracting 'images', NOT 'imageUrl'
      const { name, description, price, category, stock, images } = req.body;
  
      if (!name || !price || !images || images.length === 0) {
        return res.status(400).json({ message: "All fields and at least one image are required." });
      }
  
      const product = new Product({
        name,
        description,
        price,
        category,
        stock,
        images, // 👈 Saves the array of URLs
        user: req.user._id,
      });
  
      const createdProduct = await product.save();
      res.status(201).json(createdProduct);
    } catch (error) {
      console.error("🔴 Create Product Error:", error);
      res.status(500).json({ message: "Failed to create product in database." });
    }
  };

// Get all products (Public - for store, or Admin - for dashboard)
export const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    
    // 1. Initialize empty query object
    let query = {};

    // 2. Text Search (Case-insensitive Regex)
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // 3. Category Filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // 4. Price Range Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 5. Sorting Logic
    let sortObj = {};
    switch (sort) {
      case 'priceAsc': sortObj.price = 1; break;
      case 'priceDesc': sortObj.price = -1; break;
      case 'newest': sortObj.createdAt = -1; break;
      default: sortObj.createdAt = -1; // Default to newest
    }

    // 6. Execute Query
    const products = await Product.find(query).sort(sortObj);
    
    res.status(200).json(products);
  } catch (error) {
    console.error("Filter Engine Error:", error);
    res.status(500).json({ message: "Failed to retrieve product catalog." });
  }
};
// Update product (Admin Only)
export const updateProduct = async (req, res) => {
    try {
      const { name, description, price, category, stock, images } = req.body;
  
      const product = await Product.findById(req.params.id);
  
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      
      // 👇 Only update images if the frontend sent a new array
      if (images && images.length > 0) {
        product.images = images;
      }
  
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } catch (error) {
      console.error("Update Product Error:", error);
      res.status(500).json({ message: "Failed to update product." });
    }
  };

// Delete product (Admin Only)
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product removed from inventory." });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed." });
  }
};

// ==========================================
// ADD A PRODUCT REVIEW (Customer Only)
// ==========================================
export const createProductReview = async (req, res) => {
    try {
      const { rating, comment } = req.body;
      const product = await Product.findById(req.params.id);
  
      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }
  
      // 1. Prevent duplicate reviews from the same user
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
  
      if (alreadyReviewed) {
        return res.status(400).json({ message: "You have already reviewed this product." });
      }
  
      // 2. Create the new review object
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };
  
      // 3. Add to array and update math
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      
      // Calculate new average rating
      product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
  
      await product.save();
      res.status(201).json({ message: "Review added successfully!" });
  
    } catch (error) {
      console.error("Review Error:", error);
      res.status(500).json({ message: "Server error while submitting review." });
    }
  };

  export const getProductById = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };