import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';


const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); 
  
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(''); 

    if (!name.trim()) return setError("Full name cannot be empty.");
    if (!email) return setError("Email cannot be empty.");
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return setError("Invalid email id. Only @gmail.com accounts are allowed.");
    }

    setIsLoading(true);

    try {
      // Real API Call
      await authApi.sendSignupOtp(email);
      
      // Navigate and pass data via state so the next screen knows who is verifying
      navigate('/verify/signupOtp', { state: { email, name } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className='w-full p-8 border shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl border-white/20'> 
      <div className='flex flex-col items-center justify-center gap-3 mb-8'>
        <div className="flex items-center justify-center w-12 h-12 shadow-lg rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-emerald-500/30">
          <span className="text-3xl font-black text-white transform -rotate-12">S</span>
        </div>
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-500">
          Join ShopHub
        </h2>
        <p className="text-sm text-gray-500">Create an account to get started.</p>
      </div>
      
      <div className='flex flex-col gap-4 mb-2'>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)} 
          placeholder='Enter your fullname' 
          className='w-full px-4 py-3 text-sm text-gray-800 transition-all duration-300 border border-gray-200 outline-none bg-gray-50/50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10' 
          required
        />
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          placeholder='Enter your @gmail.com email' 
          className='w-full px-4 py-3 text-sm text-gray-800 transition-all duration-300 border border-gray-200 outline-none bg-gray-50/50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10' 
          required
        />
      </div>

      {error && (
        <div className="p-3 mt-2 mb-4 rounded-lg bg-red-50">
          <p className="text-sm font-semibold text-center text-red-600">{error}</p>
        </div>
      )}
      
      <button disabled={isLoading} type="submit" className={`w-full py-3.5 mt-4 text-sm font-bold text-white transition-all duration-300 shadow-lg rounded-xl ${isLoading ? 'bg-gray-400 shadow-none cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 hover:shadow-emerald-500/40 hover:-translate-y-0.5'}`}>
        {isLoading ? 'Sending OTP ...' : 'Continue'}
      </button>
      
      <p className="mt-6 text-sm font-medium text-center text-gray-500">
        Already have an account? <Link to="/login" className="font-bold text-emerald-600 hover:underline">Log in</Link>
      </p>
    </form>
  );
};

export default Signup;