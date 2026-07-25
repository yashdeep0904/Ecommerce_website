import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storeApi } from '../api/storeApi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const data = await storeApi.getWishlist();
      setWishlistItems(data);
    } catch (err) {
      toast.error("Could not sync your saved items catalog.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await storeApi.toggleWishlist(productId);
      toast.success("Removed from wishlist.");
      // Instantly filter local state matrix to keep UI dynamic
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
    } catch (err) {
      toast.error("Failed to update item preference.");
    }
  };

  const handleMoveToCart = (product) => {
    addToCart(product);
    handleRemove(product._id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 rounded-full animate-spin border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl p-4 mx-auto duration-300 md:p-8 animate-in fade-in">
        <BackButton />
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Wishlist</h1>
        <p className="mt-2 font-medium text-slate-500">Keep track of items you love and buy them anytime.</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center p-12 text-center bg-white border shadow-sm rounded-3xl border-slate-100">
          <div className="flex items-center justify-center w-20 h-20 mb-6 border rounded-full bg-slate-50 border-slate-100">
            <svg className="w-9 h-9 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <h2 className="mb-1 text-lg font-bold text-slate-800">Your Wishlist is Empty</h2>
          <p className="max-w-sm mb-6 text-sm text-slate-500">Tap the heart icon on items that catch your eye while shopping to archive them here.</p>
          <button onClick={() => navigate('/home')} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all">
            Continue Exploration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((product) => (
            <div key={product._id} className="relative flex flex-col justify-between p-4 transition-all bg-white border shadow-sm border-slate-100 rounded-2xl hover:shadow-md group">
              
              {/* Delete Trash Trigger Widget */}
              <button 
                onClick={() => handleRemove(product._id)}
                className="absolute z-10 p-2 transition-colors border rounded-full shadow-xs top-6 right-6 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 border-slate-100 backdrop-blur-xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>

              <Link to={`/product/${product._id}`} className="block">
                <div className="flex items-center justify-center p-4 mb-4 overflow-hidden aspect-square bg-slate-50 rounded-xl">
                  <img src={product.images[0]} alt={product.name} className="object-contain max-w-full max-h-full transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{product.category}</p>
                <h3 className="mb-2 text-base font-bold transition-colors text-slate-800 line-clamp-1 hover:text-emerald-600">{product.name}</h3>
              </Link>

              <div className="mt-auto">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-lg font-black text-slate-900">${product.price.toFixed(2)}</span>
                  <span className="text-xs line-through text-slate-400">${(product.price * 1.25).toFixed(2)}</span>
                </div>

                <button
                  onClick={() => handleMoveToCart(product)}
                  disabled={product.stock <= 0}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    product.stock > 0
                      ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                      : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                  {product.stock > 0 ? 'Move to Cart' : 'Sold Out'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;