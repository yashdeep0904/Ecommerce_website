import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Sidebar from './Sidebar'; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, clearCart } = useCart();
  const navigate = useNavigate();
  
  // State to control the Mobile Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State to control the Desktop Profile Dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    clearCart(); // 🟢 CLEAR THE CART BEFORE LOGGING OUT
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full transition-all border-b shadow-sm bg-white/80 backdrop-blur-lg border-slate-100">
        <div className="flex items-center justify-between h-20 px-4 mx-auto max-w-7xl md:px-8">
          
          {/* LEFT: Hamburger Button & Brand */}
          <div className="flex items-center gap-4">
            
            {/* The Hamburger Button (Visible on ALL screen sizes) */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 transition-colors bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-200 hover:text-emerald-600"
              aria-label="Open Sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            
            <Link to="/home" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-10 h-10 transition-transform shadow-lg bg-emerald-500 rounded-xl shadow-emerald-500/20 group-hover:scale-105">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <span className="hidden text-xl font-black tracking-tight text-slate-900 sm:block">
                Shop<span className="text-emerald-500">Hub</span>
              </span>
            </Link>
          </div>

          {/* MIDDLE: Desktop Navigation */}
          <div className="items-center hidden gap-8 md:flex">
            <Link to="/home" className="text-sm font-bold transition-colors text-slate-500 hover:text-emerald-500">Discover</Link>
            <Link to="/home?category=Electronics" className="text-sm font-bold transition-colors text-slate-500 hover:text-emerald-500">Tech</Link>
            <Link to="/home?category=Clothing" className="text-sm font-bold transition-colors text-slate-500 hover:text-emerald-500">Fashion</Link>
            <Link to="/home?sort=priceAsc" className="text-sm font-bold transition-colors text-slate-500 hover:text-emerald-500">Deals</Link>
          </div>

          {/* RIGHT: Actions & Authentication */}
          <div className="flex items-center gap-3 md:gap-5">
            
            <button onClick={() => navigate('/cart')} className="relative p-2 transition-colors text-slate-600 hover:text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="hidden w-px h-6 bg-slate-200 sm:block"></div>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 py-1 pl-2 pr-1 transition-all border rounded-full bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none"
                >
                  <div className="hidden text-right sm:block">
                    <p className="text-xs font-bold leading-none text-slate-800">{user.name || "Customer"}</p>
                    <p className="text-[10px] font-semibold text-emerald-600">Online</p>
                  </div>
                  <div className="flex items-center justify-center text-sm font-bold text-white rounded-full shadow-inner w-9 h-9 bg-slate-800">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 w-64 mt-3 overflow-hidden duration-200 origin-top-right bg-white border shadow-2xl rounded-2xl border-slate-100 animate-in fade-in slide-in-from-top-4">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-sm font-black truncate text-slate-900">{user.name}</p>
                      <p className="text-xs font-medium truncate text-slate-500">{user.email}</p>
                    </div>
                    
                    <div className="flex flex-col gap-1 p-2">
                      <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        My Profile
                      </Link>
                      <Link to="/my-orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        Order History
                      </Link>
                      <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        Account Settings
                      </Link>
                      <Link to="/support" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        Help & Support
                      </Link>
                    </div>
                    
                    <div className="p-2 border-t border-slate-100">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                      >
                        Sign Out
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="hidden text-sm font-bold transition-colors sm:block text-slate-600 hover:text-slate-900"
                >
                  Log In
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-slate-900 hover:bg-emerald-500 text-white text-sm font-bold py-2.5 px-6 rounded-full shadow-lg shadow-slate-900/10 hover:shadow-emerald-500/20 transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}
            
          </div>
        </div>
      </nav>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    </>
  );
};

export default Navbar;