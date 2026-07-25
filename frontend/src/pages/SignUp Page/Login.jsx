import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';

const Login = () => {
  // --- Form States ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // --- Mode States ---
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- Feedback States ---
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();
  const { user, logout, login } = useAuth();
  
  useEffect(() => {
    // If an Admin tries to access the Customer login, clear their admin session instantly
    if (user && user.role === 'admin') {
      logout();
    }
  }, [user, logout]);

  // =======================================================
  // HANDLERS
  // =======================================================

  const handleSendOtp = async () => {
    if (!email) return setError("Please enter your email first to receive an OTP.");
    
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await authApi.sendLoginOtp(email); 
      setIsOtpMode(true);
      setSuccessMsg("Secure OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      let data;
      // Execute appropriate API call
      if (isOtpMode) {
        data = await authApi.loginWithOtp(email, otp);
      } else {
        data = await authApi.loginWithPassword(email, password);
      }

      const loggedInUser = data.user;
      
      // ✅ SUCCESS: Update global Auth State
      login(loggedInUser); 
      
      // 🛡️ Safety Catch: If an admin accidentally logs in here, send them to the right place
      if (loggedInUser.role === 'admin') {
        navigate('/admin/login'); 
      } else {
        navigate('/home'); 
      }

    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };
    
  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="w-full max-w-md p-8 mx-auto transition-colors duration-500 border shadow-2xl backdrop-blur-xl rounded-3xl bg-white/90 border-white/20">
      
      {/* --- HEADER --- */}
      <div className='flex flex-col items-center justify-center gap-3 mb-8'>
        <div className="flex items-center justify-center transition-colors duration-500 shadow-lg w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-emerald-500/30">
            <span className="text-3xl font-black text-white transform -rotate-12">S</span>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-transparent transition-colors duration-500 bg-clip-text bg-gradient-to-r from-green-700 to-emerald-500">
            Welcome Back
          </h2>
        </div>
      </div> 
      
      <form onSubmit={submitHandler}>
        
        {/* --- EMAIL INPUT --- */}
        <div className='flex flex-col mb-4'>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={isOtpMode}
            placeholder="Enter your email" 
            className="w-full px-4 py-3.5 text-sm outline-none rounded-xl transition-all disabled:opacity-60 border border-gray-200 bg-gray-50/50 text-slate-800 focus:border-emerald-500 disabled:bg-gray-100" 
            required 
          />
        </div>

        {/* --- PASSWORD / OTP DYNAMIC INPUT --- */}
        <div className='flex flex-col mb-2'>
          {isOtpMode ? (
            <input 
              type="text" 
              maxLength={6} 
              value={otp} 
              onChange={(e) => { if (/^\d*$/.test(e.target.value)) setOtp(e.target.value); }} 
              placeholder="000 000" 
              className="w-full py-4 text-2xl text-center tracking-[0.5em] font-mono outline-none rounded-xl transition-all border border-gray-200 bg-gray-50/50 text-slate-800 focus:border-emerald-500" 
              required
            />
          ) : (
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password" 
              minLength={8} 
              className="w-full px-4 py-3.5 text-sm outline-none rounded-xl transition-all border border-gray-200 bg-gray-50/50 text-slate-800 focus:border-emerald-500" 
              required 
            />
          )}
        </div>
        
        {/* --- OTP TOGGLE LINK --- */}
        <div className="flex justify-end mb-5">
          {isOtpMode ? (
            <button type="button" onClick={() => setIsOtpMode(false)} className="text-xs font-bold transition-colors text-slate-500 hover:text-slate-800">
              Use Password instead
            </button>
          ) : (
            <button type="button" onClick={handleSendOtp} disabled={isLoading} className="text-xs font-bold transition-colors disabled:opacity-50 text-emerald-600 hover:text-emerald-700">
              Login with OTP instead
            </button>
          )}
        </div>

        {/* --- FEEDBACK MESSAGES --- */}
        {error && (
          <div className="p-3 mb-4 border border-red-100 rounded-xl animate-in fade-in bg-red-50">
            <p className="text-xs font-semibold text-center text-red-600">{error}</p>
          </div>
        )}
        
        {successMsg && (
          <div className="p-3 mb-4 border rounded-xl animate-in fade-in bg-emerald-50 border-emerald-100">
            <p className="text-xs font-semibold text-center text-emerald-600">{successMsg}</p>
          </div>
        )}

        {/* --- SUBMIT BUTTON --- */}
        <button 
          disabled={isLoading} 
          type="submit" 
          className="w-full py-3.5 mt-2 text-sm font-bold text-white rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-lg hover:shadow-emerald-500/30"
        >
          {isLoading ? 'Authenticating...' : 'Login securely'}
        </button>
      </form>

      {/* =======================================================
          THE PORTAL TOGGLE (FIXED)
          ======================================================= */}
      <div className="pt-6 mt-6 text-center transition-colors duration-500 border-t border-slate-100">
        <Link to={'/admin/login'}
          
          className="text-xs font-bold transition-colors text-slate-400 hover:text-slate-600"
        >
          Staff Member? Access Portal
        </Link>
      </div>

    </div>
  );
};

export default Login;