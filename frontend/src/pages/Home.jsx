import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 
import { storeApi } from '../api/storeApi';
import toast from 'react-hot-toast';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Search, Filter & Wishlist States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [wishlistIds, setWishlistIds] = useState([]); 

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart(); 

  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlSort = searchParams.get('sort');

  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlSort) setSortOrder(urlSort);
  }, [urlCategory, urlSort]);

  const isAuthRoute = ['/login', '/signup', '/set-password'].includes(location.pathname) || location.pathname.startsWith('/verify');
  const isStorefrontRoute = location.pathname === '/home' || location.pathname === '/';
  const staticCategories = ['All', 'Electronics', 'Clothing', 'Home', 'Accessories', 'Fitness'];

  // --- Fetch Wishlist IDs ---
  useEffect(() => {
    const fetchUserWishlist = async () => {
      if (user && isStorefrontRoute && user.role === 'customer') {
        try {
          const data = await storeApi.getWishlist();
          setWishlistIds(data.map(item => item._id));
        } catch (err) {
          console.error("Failed to sync wishlist data");
        }
      } else if (!user) {
        setWishlistIds([]); 
      }
    };
    fetchUserWishlist();
  }, [user, location.pathname]);

  // --- Database Sync Engine ---
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        const data = await storeApi.getProducts({
          search: searchQuery,
          category: selectedCategory,
          sort: sortOrder
        });
        setProducts(data);
      } catch (err) {
        console.error("Failed to sync catalog metadata");
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      if (isStorefrontRoute) fetchCatalog();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, sortOrder, location.pathname]);

  // --- Wishlist Toggle Handler ---
  const handleWishlistToggle = async (e, productId) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please sign in to save items to your Wishlist.");
      navigate('/login');
      return;
    }

    try {
      const res = await storeApi.toggleWishlist(productId);
      if (res.isWishlisted) {
        setWishlistIds(prev => [...prev, productId]);
        toast.success("Saved to Wishlist!");
      } else {
        setWishlistIds(prev => prev.filter(id => id !== productId));
        toast.success("Removed from Wishlist.");
      }
    } catch (error) {
      toast.error("Failed to update wishlist.");
    }
  };

  return (
    <div className="relative min-h-screen font-sans bg-slate-50 text-slate-800">
      
      {/* Main Layout Wrapper */}
      <div className={`transition-all duration-500 ease-in-out h-screen flex ${isAuthRoute ? 'blur-md scale-[0.98] opacity-60 pointer-events-none select-none' : 'scale-100 opacity-100'}`}>
        
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
          <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <main className="flex-1 p-4 overflow-y-auto lg:p-8 custom-scrollbar">
            <div className="mx-auto max-w-7xl">
              
              {isStorefrontRoute || isAuthRoute ? (
                <>
                  {/* --- COMPACT, COLORFUL LIGHT HERO BANNER --- */}
                  <div className="relative flex flex-col items-center justify-between p-6 mb-8 overflow-hidden border shadow-sm bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 rounded-3xl md:p-10 md:flex-row border-white/60 isolate">
                    {/* Soft Colorful Blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none bg-yellow-300/30 blur-3xl -translate-y-1/3 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none bg-emerald-400/20 blur-3xl translate-y-1/3 -translate-x-1/4"></div>
                    
                    <div className="relative z-10 max-w-xl text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 border rounded-full bg-white/60 border-white/80 backdrop-blur-sm shadow-sm">
                        <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">New Collection</span>
                      </div>
                      
                      <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
                        Shop the <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                          Extraordinary.
                        </span>
                      </h1>
                      
                      <p className="max-w-md mx-auto mb-6 text-sm font-medium text-slate-600 md:text-base md:mx-0">
                        Curated premium products, exclusive daily deals, and a seamless checkout experience.
                      </p>
                      
                      {!user && (
                        <button onClick={() => navigate('/signup')} className="px-6 py-3 text-sm font-bold text-white transition-all duration-300 shadow-lg bg-slate-900 hover:bg-emerald-500 rounded-xl hover:-translate-y-0.5">
                          Join for Free
                        </button>
                      )}
                    </div>
                    
                    {/* Optional Right Side Graphic/Illustration space can go here if needed later */}
                  </div>

                  {/* --- COMPACT COMMAND BAR (Filters & Search) --- */}
                  <div className="flex flex-col items-center justify-between gap-3 p-2 mb-8 bg-white border shadow-sm lg:flex-row border-slate-100 rounded-2xl lg:rounded-full">
                    
                    {/* Search Input */}
                    <div className="relative w-full lg:w-72 shrink-0">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      </span>
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full py-2.5 pr-4 text-sm font-medium transition-all bg-transparent border-none outline-none pl-10 text-slate-700 placeholder:text-slate-400 focus:ring-0"
                      />
                    </div>

                    <div className="hidden w-px h-6 lg:block bg-slate-100"></div>

                    {/* Category Pills */}
                    <div className="flex items-center w-full gap-1.5 px-2 py-1 overflow-x-auto lg:w-auto no-scrollbar lg:py-0">
                      {staticCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                            selectedCategory === cat
                              ? 'bg-slate-900 text-white shadow-sm scale-105'
                              : 'bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="hidden w-px h-6 lg:block bg-slate-100"></div>

                    {/* Sort Dropdown */}
                    <div className="w-full px-2 pb-2 lg:w-auto shrink-0 lg:pb-0 lg:px-2">
                      <div className="relative flex items-center transition-colors bg-slate-50 rounded-xl">
                        <select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          className="w-full py-2 pl-4 pr-8 text-xs font-bold bg-transparent border-none outline-none appearance-none cursor-pointer text-slate-700 focus:ring-0"
                        >
                          <option value="newest">Sort: Newest</option>
                          <option value="priceAsc">Price: Low to High</option>
                          <option value="priceDesc">Price: High to Low</option>
                        </select>
                        <svg className="absolute right-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* --- RESULTS HEADER --- */}
                  <div className="flex items-center justify-between px-1 mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      {selectedCategory === 'All' ? 'Latest Arrivals' : `${selectedCategory}`}
                    </h2>
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full text-slate-500 bg-white border border-slate-200 shadow-sm">
                      {products.length} Items
                    </span>
                  </div>

                  {/* --- COMPACT PRODUCT GRID --- */}
                  {isLoading ? (
                    <div className="flex items-center justify-center min-h-[40vh]">
                       <div className="w-10 h-10 border-4 rounded-full animate-spin border-slate-200 border-t-emerald-500"></div>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed rounded-3xl border-slate-200">
                      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-slate-50 text-slate-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-slate-900">No products found</h3>
                      <p className="max-w-xs text-sm font-medium text-slate-500">We couldn't find anything matching your filters.</p>
                    </div>
                  ) : (
                    /* 5-Column Grid on Large Screens for Smaller Cards */
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-6">
                      
                      {products.map((product) => {
                        const isSaved = wishlistIds.includes(product._id);
                        const displayImage = product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/400?text=No+Image';
                        
                        return (
                          /* SMALLER PRODUCT CARD */
                          <div key={product._id} className="relative flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border shadow-sm border-slate-100 rounded-2xl hover:shadow-md hover:-translate-y-1 group">
                            
                            {/* Wishlist Button */}
                            <button 
                              onClick={(e) => handleWishlistToggle(e, product._id)}
                              className="absolute z-20 flex items-center justify-center transition-all duration-300 rounded-full shadow-sm top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm hover:scale-110"
                            >
                              <svg className={`w-4 h-4 transition-colors duration-300 ${isSaved ? 'text-red-500 fill-red-500' : 'text-slate-300 fill-transparent hover:text-red-400'}`} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                              </svg>
                            </button>

                            {/* Image Container (Compact Square) */}
                            <Link to={`/product/${product._id}`} className="relative block w-full overflow-hidden border-b bg-slate-50 aspect-square isolate border-slate-50">
                              <img 
                                src={displayImage} 
                                alt={product.name} 
                                className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-110" 
                              />
                              {product.stock <= 0 && (
                                 <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                                    <span className="px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase rounded-full shadow-md bg-slate-900">Sold Out</span>
                                 </div>
                              )}
                            </Link>
                            
                            {/* Compact Content Block */}
                            <div className="flex flex-col flex-1 p-4">
                              <Link to={`/product/${product._id}`} className="block mb-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">{product.category}</p>
                                <h3 className="text-sm font-bold tracking-tight transition-colors text-slate-900 line-clamp-1 group-hover:text-emerald-600">{product.name}</h3>
                              </Link>
                              
                              <p className="flex-1 mt-1 mb-3 text-xs font-medium leading-relaxed text-slate-500 line-clamp-2">{product.description}</p>
                              
                              {/* Action Row */}
                              <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100">
                                <span className="text-lg font-black tracking-tight text-slate-900">
                                  ${Number(product.price).toFixed(2)}
                                </span>
                                
                                <button 
                                  onClick={() => addToCart(product)}
                                  disabled={product.stock <= 0}
                                  className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 ${
                                    product.stock > 0 
                                      ? 'bg-slate-900 text-white shadow-sm hover:bg-emerald-500 hover:shadow-emerald-500/20 hover:-translate-y-0.5' 
                                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  }`}
                                  aria-label="Add to Cart"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                </button>
                              </div>
                            </div>
                            
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Outlet /> 
              )}

            </div>
          </main>
        </div>
      </div>

      {/* --- AUTHENTICATION MODAL OVERLAY --- */}
      {isAuthRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-300 ease-out">
             <button 
               onClick={() => navigate('/home')} 
               className="absolute z-50 flex items-center justify-center w-10 h-10 transition-all duration-300 bg-white border rounded-full shadow-lg -top-4 -right-4 hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:scale-110 hover:rotate-90"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
             <div className="overflow-hidden bg-white shadow-2xl rounded-3xl ring-1 ring-slate-900/5">
                <Outlet />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;