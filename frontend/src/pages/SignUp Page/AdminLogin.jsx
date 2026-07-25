import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import { authApi } from '../../api/authApi';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
 
  const { user, logout, login } = useAuth();
  
  useEffect(() => {
    // If a normal Customer tries to access the Admin login, clear their session instantly
    if (user && user.role !== 'admin') {
      logout();
    }
  }, [user, logout]);

  // 💡 UX Upgrade: Clear errors automatically when the user starts typing again
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Authenticate with backend
      const response = await authApi.loginWithPassword(email, password);
      
      // 💡 Reliability Upgrade: Safely extract the user object regardless of how Axios wraps it
      const loggedInUser = response.user || response;
      
      // 2. Strict Role Verification (The Database Trapdoor)
      if (loggedInUser?.role !== 'admin') {
        // If a standard customer finds this hidden URL, kick them out instantly
        await authApi.logoutUser(); 
        setError("Access Denied. Unauthorized clearance level.");
        setIsLoading(false);
        return;
      }

      // 3. Success: Save to global state and route to dashboard
      login(loggedInUser); 
      navigate('/admin/dashboard'); 

    } catch (err) {
      // Safely catch backend error messages or default to a generic one
      setError(err.response?.data?.message || "Authentication failed. Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617] selection:bg-emerald-500/30">
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md p-8 sm:p-10">
        
        {/* Terminal/OLED Styled Card */}
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]">
          
          <div className="flex flex-col items-center justify-center gap-4 mb-10">
            <div className="flex items-center justify-center border shadow-inner w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-emerald-500/20">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-100">Restricted Access</h2>
              <p className="mt-2 font-mono text-xs tracking-widest uppercase text-slate-500">ShopHub System Control</p>
            </div>
          </div> 
          
          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Admin Email</label>
              <input 
                type="email" 
                value={email}
                onChange={handleEmailChange} 
                placeholder="staff@shophub.com" 
                autoFocus // 💡 UX Upgrade: Automatically clicks into this input on load
                className="w-full px-4 py-3 text-sm transition-all border outline-none text-slate-200 border-slate-700 bg-slate-950/50 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 placeholder:text-slate-600" 
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Passphrase</label>
              <input 
                type="password" 
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••" 
                className="w-full px-4 py-3 font-mono text-sm tracking-widest transition-all border outline-none text-slate-200 border-slate-700 bg-slate-950/50 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 placeholder:text-slate-600" 
                required 
              />
            </div>

            {error && (
              <div className="p-3 mt-4 border rounded-lg animate-in fade-in bg-red-500/10 border-red-500/20">
                <p className="text-xs font-semibold text-center text-red-400">{error}</p>
              </div>
            )}
            
            <button 
              disabled={isLoading} 
              type="submit" 
              className={`w-full py-3.5 mt-2 text-sm font-bold text-white transition-all duration-300 rounded-xl ${
                isLoading 
                  ? 'bg-slate-700 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]'
              }`}
            >
              {isLoading ? 'Authenticating...' : 'Initialize Session'}
            </button>
            
            <Link to={'/login'} className='flex justify-center text-gray-400 hover:font-semibold'>Go to User Login</Link>
          </form>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;