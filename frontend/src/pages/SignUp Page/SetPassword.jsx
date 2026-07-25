import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext'; // Import hook
import { authApi } from '../../api/authApi';

const SetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Destructure login function
  
  const userName = location.state?.name || 'User';

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) return setError("Password too short.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setIsLoading(true);

    try {
      // Backend validates setup_session cookie and returns { user: {...} }
      const response = await authApi.finalizeSignup(userName, password);
      
      // Update global state
      login(response.user); 
      
      navigate('/home');
    } catch (err) {
      setError("Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className='w-full p-8 border shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl border-white/20'>
      <div className='flex flex-col items-center gap-3 mb-8'>
        <h2 className="text-3xl font-extrabold text-emerald-600">Secure Account</h2>
      </div>
      
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Set password' className='w-full p-3 mb-4 border rounded-xl' required />
      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder='Confirm password' className='w-full p-3 mb-4 border rounded-xl' required />
      
      {error && <p className="mb-2 text-sm text-center text-red-500">{error}</p>}
      
      <button disabled={isLoading} type="submit" className="w-full py-3 font-bold text-white bg-emerald-500 rounded-xl">
        {isLoading ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  );
};

export default SetPassword;