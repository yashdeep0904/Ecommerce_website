import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';


const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await authApi.logoutUser();
    logout();
    navigate('/admin/login');
  };

  const navLinks = [
    
    { 
        name: 'Dashboard', 
        path: '/admin/dashboard', 
        icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' 
    },
    { 
      name: 'User Management', 
      path: '/admin/users', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' 
    },
    { 
      name: 'Products', 
      path: '/admin/products', 
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' 
    },
    // 👇 ADD THIS NEW ORDER LINK 👇
    { 
      name: 'Orders', 
      path: '/admin/orders', 
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' 
    }
  ];

  return (
    <div className="flex min-h-screen font-sans bg-slate-50 text-slate-900">
      
      {/* 1. Dedicated Admin Sidebar */}
      <aside className="w-64 bg-[#0b1120] text-slate-300 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 font-black text-white rounded-lg bg-emerald-500">S</div>
            <h1 className="text-xl font-bold tracking-tight text-white">ShopHub <span className="ml-1 font-mono text-sm text-emerald-500">OS</span></h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname.includes(link.path);
            return (
              <Link 
                key={link.name} 
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path>
                </svg>
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-slate-900 rounded-xl">
             <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full bg-slate-700">
                {user?.name?.charAt(0).toUpperCase()}
             </div>
             <div className="truncate">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Administrator</p>
             </div>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10">
            Log Out
          </button>
        </div>
      </aside>

      {/* 2. Admin Main Content Area */}
      <main className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Mobile Header (Shows only on small screens) */}
        <header className="md:hidden bg-[#0b1120] text-white p-4 flex justify-between items-center">
          <h1 className="font-bold">ShopHub OS</h1>
          <button onClick={handleLogout} className="text-sm font-medium text-red-400">Logout</button>
        </header>

        {/* Scrollable Content Viewport */}
        <div className="flex-1 p-4 overflow-y-auto md:p-8">
          <Outlet /> {/* This is where Users.jsx or Products.jsx will render! */}
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;