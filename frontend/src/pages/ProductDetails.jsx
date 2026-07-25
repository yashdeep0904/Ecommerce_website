import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storeApi } from '../api/storeApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [isPincodeChecked, setIsPincodeChecked] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    checkWishlistStatus();
  }, [id, user]);

  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      const data = await storeApi.getProductById(id);
      
      // 🟢 THE DEFENSIVE SANITIZATION ENGINE 🟢
      // Automatically protects the UI from missing fields on older products
      const safeProduct = {
        ...data,
        rating: data.rating ?? 0,
        numReviews: data.numReviews ?? 0,
        reviews: data.reviews || [],
        images: data.images && data.images.length > 0 
          ? data.images 
          : (data.imageUrl ? [data.imageUrl] : ['https://via.placeholder.com/500?text=No+Image+Available'])
      };
      
      setProduct(safeProduct);
      
      if (safeProduct.images.length > 0) {
        setSelectedImage(safeProduct.images[0]); 
      }
      
    } catch (err) {
      toast.error("Unable to retrieve product information.");
      navigate('/home');
    } finally {
      setIsLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (user && user.role === 'customer') {
      try {
        const data = await storeApi.getWishlist();
        setIsWishlisted(data.some(item => item._id === id));
      } catch (err) {
        console.error("Failed to load wishlist status");
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) return toast.error("Please sign in to save items.");
    try {
      const res = await storeApi.toggleWishlist(id);
      setIsWishlisted(res.isWishlisted);
      toast.success(res.isWishlisted ? "Saved to Wishlist!" : "Removed from Wishlist.");
    } catch (error) {
      toast.error("Failed to update wishlist.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Review comment cannot be blank.");
    setIsSubmitting(true);
    try {
      await storeApi.createReview(id, { rating, comment });
      toast.success("Thank you for your feedback!");
      setComment('');
      setRating(5);
      fetchProductDetails(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstimatedDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return deliveryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const checkPincodeDelivery = (e) => {
    e.preventDefault();
    if (deliveryPincode.length < 5) return toast.error("Please enter a valid pincode.");
    setIsPincodeChecked(true);
    toast.success("Standard delivery available for this location!");
  };

  const renderStars = (score, clickableOptions = null) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => clickableOptions && clickableOptions(star)}
          className={`w-5 h-5 ${clickableOptions ? 'cursor-pointer transition-transform hover:scale-110' : ''} ${
            star <= Math.round(score) ? 'text-amber-400' : 'text-slate-200'
          }`}
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  if (isLoading || !product) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 border-4 rounded-full animate-spin border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 mx-auto font-sans duration-300 max-w-7xl md:p-8 bg-slate-50 animate-in fade-in">
      <BackButton />
      <nav className="flex items-center gap-2 mb-6 text-xs font-semibold text-slate-400">
        <span className="cursor-pointer hover:text-slate-600" onClick={() => navigate('/home')}>Home</span>
        <span>/</span>
        <span className="cursor-pointer hover:text-slate-600" onClick={() => navigate(`/home?category=${product.category}`)}>{product.category}</span>
        <span>/</span>
        <span className="text-slate-600 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="flex flex-col gap-12 p-6 mb-8 overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-100 md:p-12 lg:flex-row">
        
        {/* LEFT COLUMN: VISUAL MEDIA */}
        <div className="relative flex flex-col w-full gap-4 lg:w-1/2 md:flex-row">
          
          <button 
            onClick={handleWishlistToggle}
            className="absolute z-10 flex items-center justify-center w-12 h-12 transition-transform duration-300 border rounded-full shadow-md top-4 right-4 bg-white/90 backdrop-blur-sm hover:scale-105 border-slate-100"
          >
            <svg className={`w-6 h-6 transition-colors duration-300 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-slate-400 fill-transparent'}`} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>

          {/* Thumbnail Rail */}
          <div className="flex order-2 gap-3 overflow-x-auto md:flex-col md:order-1 md:overflow-x-visible shrink-0 no-scrollbar">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-16 md:w-20 md:h-20 bg-slate-50 border-2 rounded-xl overflow-hidden p-2 transition-all flex items-center justify-center ${
                  selectedImage === img ? 'border-emerald-500 shadow-sm ring-2 ring-emerald-500/10' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <img src={img} alt={`Gallery ${idx + 1}`} className="object-contain max-w-full max-h-full" />
              </button>
            ))}
          </div>

          <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 p-8 flex items-center justify-center min-h-[350px] md:min-h-[450px] order-1 md:order-2 relative group overflow-hidden">
            <img src={selectedImage} alt={product.name} className="max-w-full max-h-[400px] object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" />
            {product.stock <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs">
                <span className="px-4 py-2 text-xs font-black tracking-widest text-white uppercase rounded-full bg-slate-900">Out of Stock</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DATA */}
        <div className="flex flex-col justify-between w-full lg:w-1/2">
          <div>
            <p className="mb-2 text-xs font-black tracking-widest uppercase text-emerald-600">{product.category} Section</p>
            <h1 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl text-slate-900">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-bold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 w-fit">
              <div className="flex items-center gap-1">
                <span className="font-black text-slate-800">{product.rating.toFixed(1)}</span>
                {renderStars(product.rating)}
              </div>
              <span className="font-normal text-slate-300">|</span>
              <span className="cursor-pointer text-emerald-600 hover:underline">{product.numReviews} Verified Reviews</span>
            </div>

            <div className="p-4 mb-6 border bg-slate-50/50 border-slate-100 rounded-2xl">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                <span className="text-sm font-bold line-through text-slate-400">${(product.price * 1.25).toFixed(2)}</span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">20% OFF</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">Inclusive of all structural duties and retail taxes.</p>
            </div>

            <div className="mb-6 space-y-3">
              <p className="text-sm leading-relaxed text-slate-600"><span className="font-bold text-slate-800">Description:</span> {product.description}</p>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-slate-400">Availability:</span>
                {product.stock > 0 ? (
                  <span className={`px-2.5 py-0.5 rounded-md border ${product.stock < 5 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {product.stock < 5 ? `Hurry, only ${product.stock} items left!` : 'In Stock'}
                  </span>
                ) : (
                  <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-0.5 rounded-md">Temporarily Unavailable</span>
                )}
              </div>
            </div>

            <div className="py-4 mb-6 border-t border-b border-slate-100">
              <label className="block mb-2 text-xs font-black tracking-wider uppercase text-slate-400">Delivery & Fulfilment Check</label>
              <form onSubmit={checkPincodeDelivery} className="flex max-w-sm gap-2">
                <input 
                  type="text" 
                  maxLength="6"
                  placeholder="Enter destination pincode" 
                  value={deliveryPincode}
                  onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-2 text-sm font-medium transition-all border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white"
                />
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white transition-all bg-slate-900 hover:bg-slate-800 rounded-xl shrink-0">Check</button>
              </form>
              {isPincodeChecked && (
                <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1.5 animate-in fade-in duration-300">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  Guaranteed delivery by <span className="font-bold text-slate-800">{getEstimatedDeliveryDate()}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4 sm:flex-row">
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`flex-1 font-bold py-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                product.stock > 0 ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10 hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              Add to Shopping Cart
            </button>
            <button 
              onClick={() => { if (product.stock > 0) { addToCart(product); navigate('/cart'); } }}
              disabled={product.stock <= 0}
              className={`flex-1 font-bold py-4 rounded-xl text-sm transition-all shadow-md ${
                product.stock > 0 ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/10 hover:-translate-y-0.5' : 'bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
            >
              Instant Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 mb-8 bg-white border shadow-sm rounded-3xl border-slate-100 md:p-8">
        <h3 className="pb-2 mb-4 text-lg font-bold border-b text-slate-800 border-slate-100">Technical Specifications</h3>
        <div className="grid grid-cols-1 text-sm md:grid-cols-2 gap-x-8 gap-y-3">
          <div className="flex justify-between py-2 border-b border-slate-50"><span className="font-medium text-slate-400">Model Code</span><span className="font-bold text-slate-700">SH-{product._id.slice(-6).toUpperCase()}</span></div>
          <div className="flex justify-between py-2 border-b border-slate-50"><span className="font-medium text-slate-400">Retail Category</span><span className="font-bold text-slate-700">{product.category}</span></div>
          <div className="flex justify-between py-2 border-b border-slate-50"><span className="font-medium text-slate-400">Fulfillment Center</span><span className="font-bold text-slate-700">ShopHub Prime Ledger</span></div>
          <div className="flex justify-between py-2 border-b border-slate-50"><span className="font-medium text-slate-400">Warranty Scope</span><span className="font-bold text-slate-700">1 Year Standard Merchant Warranty</span></div>
        </div>
      </div>

      <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-100 md:p-12">
        <h2 className="mb-8 text-xl font-bold text-slate-900">Customer Reviews Matrix</h2>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
            {product.reviews.length === 0 ? (
              <div className="p-8 italic font-medium text-center border bg-slate-50 rounded-2xl border-slate-100/70 text-slate-400">
                No customer logs present. Be the first to catalog your feedback for this asset.
              </div>
            ) : (
              product.reviews.map((review) => (
                <div key={review._id} className="p-5 transition-all border bg-slate-50/70 rounded-2xl border-slate-100 hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-800">{review.name}</h4>
                    <span className="text-xs font-semibold text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mb-2">{renderStars(review.rating)}</div>
                  <p className="text-xs font-medium leading-relaxed md:text-sm text-slate-600">{review.comment}</p>
                </div>
              ))
            )}
          </div>

          <div>
            <div className="relative p-6 overflow-hidden text-white shadow-xl bg-slate-900 md:p-8 rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl"></div>
              <h3 className="relative z-10 mb-4 text-lg font-bold">Submit System Evaluation</h3>
              {!user ? (
                <div className="relative z-10 p-6 text-center border bg-white/5 border-white/10 rounded-xl backdrop-blur-sm">
                  <p className="mb-4 text-sm font-medium text-slate-400">Authentication session required to commit verification logs.</p>
                  <button onClick={() => navigate('/login')} className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold py-2.5 px-6 rounded-xl w-full transition-all">Sign In to Account</button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="relative z-10 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Score Allocation</label>
                    {renderStars(rating, setRating)}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Review Analysis Summary</label>
                    <textarea required value={comment} onChange={(e) => setComment(e.target.value)} rows="3" className="w-full px-4 py-3 text-xs font-medium text-white transition-all border outline-none resize-none bg-slate-800/80 border-slate-700 rounded-xl focus:border-emerald-500 md:text-sm" placeholder="Detail functional performance parameters..."></textarea>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-wider">
                    {isSubmitting ? 'Processing Transaction...' : 'Commit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;