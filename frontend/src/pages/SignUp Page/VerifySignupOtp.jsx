import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/authApi';


const VerifySignupOtp = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60); 
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract email and name passed from the Signup screen
  const userEmail = location.state?.email || '';
  const userName = location.state?.name || '';

  useEffect(() => {
    if (!userEmail) navigate('/signup'); // Boot them back if they didn't come from signup
    
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    else setCanResend(true); 
    return () => clearInterval(interval);
  }, [timer, userEmail, navigate]);

  const handleResendOtp = async () => {
    if (!canResend) return;
    setError('');
    
    try {
      await authApi.sendSignupOtp(userEmail);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError("Failed to resend OTP.");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) return setError("Please enter a valid 6-digit OTP.");

    setIsLoading(true);

    try {
      // Real API Call verifies against Redis backend
      await authApi.verifySignupOtp(userEmail, otp);
      
      // Backend sets an HTTP-Only 'setupToken' cookie automatically!
      navigate('/set-password', { state: { name: userName } });
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
    
  return (
    <form onSubmit={submitHandler} className='w-full p-8 border shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl border-white/20'>
      <div className='flex flex-col items-center justify-center gap-3 mb-6'>
        <div className="flex items-center justify-center w-12 h-12 shadow-lg rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-emerald-500/30">
          <span className="text-3xl font-black text-white transform -rotate-12">S</span>
        </div>
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-500">
          Verify Email
        </h2>
        <p className="text-sm text-center text-gray-500">We sent a 6-digit code to <br/><span className="font-bold">{userEmail}</span></p>
      </div>
      
      <div className="w-full mb-2">
        <input 
          type="text" 
          maxLength={6} 
          value={otp}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) setOtp(e.target.value);
          }}
          placeholder="000000" 
          className="w-full py-4 text-2xl font-bold tracking-[0.5em] text-center text-gray-800 transition-all duration-300 border border-gray-200 outline-none font-mono bg-gray-50/50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
          required
        />
        <div className='flex justify-end mt-3 mb-4 mr-1 text-sm'>
          {canResend ? (
            <button type="button" onClick={handleResendOtp} className='font-bold text-emerald-600 hover:underline'>Resend OTP</button>
          ) : (
            <p className='font-medium text-gray-400'>Resend code in <span className="font-bold text-gray-600">{timer}s</span></p>
          )}
        </div>
      </div>

      {error && <div className="w-full p-3 mb-4 rounded-lg bg-red-50"><p className="text-sm font-semibold text-center text-red-600">{error}</p></div>}
      
      <button disabled={isLoading} type="submit" className={`w-full py-3.5 mb-5 text-sm font-bold text-white transition-all duration-300 shadow-lg rounded-xl ${isLoading ? 'bg-gray-400 shadow-none cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:shadow-emerald-500/40 hover:-translate-y-0.5'}`}>
        {isLoading ? 'Verifying...' : 'Verify Code'}
      </button>
      
      <div className="text-center">
        <Link to={'/signup'} className='text-sm font-bold text-emerald-600 hover:underline'>Change Email Address</Link>
      </div>
    </form>
  );
}

export default VerifySignupOtp;