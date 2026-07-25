import axiosInstance from './axiosConfig';

export const authApi = {
  // Signup Pipeline
  sendSignupOtp: async (email) => {
    const response = await axiosInstance.post('/auth/signup/send-otp', { email });
    return response.data;  
  },
  verifySignupOtp: async (email, otp) => {
    const response = await axiosInstance.post('/auth/signup/verify-otp', { email, otp });
    return response.data;
  },
  finalizeSignup: async (name, password) => {
    const response = await axiosInstance.post('/auth/signup/finalize', { name, password });
    return response.data;
  },

  // Login Pipeline
  loginWithPassword: async (email, password) => {
    const response = await axiosInstance.post('/auth/login/password', { email, password });
    return response.data;
  },
  sendLoginOtp: async (email) => {
    const response = await axiosInstance.post('/auth/login/send-otp', { email });
    return response.data;
  },
  loginWithOtp: async (email, otp) => {
    const response = await axiosInstance.post('/auth/login/verify-otp', { email, otp });
    return response.data;
  },

  // Session
  checkAuth: async () => {
    const response = await axiosInstance.get('/auth/me'); // Or your verify route
    return response.data;
  },
  logoutUser: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  }
};