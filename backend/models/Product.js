import mongoose from 'mongoose'; 

// 1. Create the individual review structure
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

// 2. Update your existing Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String, required: true }],
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  
  // New Review Fields
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;