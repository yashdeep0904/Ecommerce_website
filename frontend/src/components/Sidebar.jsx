import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const staticCategories = ['Electronics', 'Clothing', 'Home', 'Accessories', 'Fitness'];

  // Keyboard Accessibility
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setIsOpen]);

  // Routing Handlers
  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleCategoryClick = (category) => {
    setIsOpen(false);
    navigate(`/home?category=${encodeURIComponent(category)}`);
  };

  const handleTrendingClick = (sortType) => {
    setIsOpen(false);
    navigate(`/home?sort=${sortType}`);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    clearCart();
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* BACKDROP OVERLAY */}
      <div 
        className={`fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* SIDEBAR PANEL */}
      <div 
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        
        {/* PROFILE HEADER PLATE */}
        <div className="flex items-center justify-between p-6 text-white bg-slate-900 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 text-xl font-black rounded-full shadow-lg bg-emerald-500 shadow-emerald-500/30">
              {user ? user.name.charAt(0).toUpperCase() : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">
                {user ? `Hello, ${user.name}` : 'Hello, Sign In'}
              </h2>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mt-0.5">
                {user ? 'Premium Member' : 'Guest Account'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-8 h-8 transition-colors rounded-full bg-white/10 hover:bg-white/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* SCROLLABLE MENU CONTENT */}
        <div className="flex-1 py-2 overflow-y-auto no-scrollbar">
          
          {/* Section 1: Trending */}
          <div className="py-4 border-b border-slate-100">
            <h3 className="px-6 mb-2 text-xs font-black tracking-widest uppercase text-slate-400">Trending</h3>
            <button onClick={() => handleTrendingClick('newest')} className="flex items-center justify-between w-full px-6 py-3 font-bold text-left transition-colors text-slate-700 hover:bg-slate-50 hover:text-emerald-600 group">
              New Releases
              <svg className="w-4 h-4 transition-colors text-slate-300 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
            <button onClick={() => handleTrendingClick('priceAsc')} className="flex items-center justify-between w-full px-6 py-3 font-bold text-left transition-colors text-slate-700 hover:bg-slate-50 hover:text-emerald-600 group">
              Clearance Deals
              <svg className="w-4 h-4 transition-colors text-slate-300 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>

          {/* Section 2: Categories */}
          <div className="py-4 border-b border-slate-100">
            <h3 className="px-6 mb-2 text-xs font-black tracking-widest uppercase text-slate-400">Shop By Category</h3>
            {staticCategories.map((cat) => (
              <button 
                key={cat}
                onClick={() => handleCategoryClick(cat)} 
                className="w-full px-6 py-3 font-medium text-left transition-colors text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Section 3: Help & Settings */}
          <div className="py-4">
            <h3 className="px-6 mb-2 text-xs font-black tracking-widest uppercase text-slate-400">Help & Settings</h3>
            
            {user ? (
              <>
                <button onClick={() => handleNavigation('/my-orders')} className="flex items-center w-full gap-3 px-6 py-3 font-medium text-left transition-colors text-slate-600 hover:bg-slate-50 hover:text-emerald-600">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  Your Orders
                </button>
                {user.role === 'admin' && (
                  <button onClick={() => handleNavigation('/admin')} className="flex items-center w-full gap-3 px-6 py-3 font-medium text-left transition-colors text-slate-600 hover:bg-slate-50 hover:text-emerald-600">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Admin Portal
                  </button>
                )}
                <button onClick={handleLogout} className="flex items-center w-full gap-3 px-6 py-3 mt-2 font-medium text-left text-red-600 transition-colors border-t hover:bg-red-50 border-slate-100">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => handleNavigation('/login')} className="flex items-center w-full gap-3 px-6 py-3 font-bold text-left transition-colors text-emerald-600 hover:bg-emerald-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;