import axios from 'axios';

const BASE_URL = 'https://ecommerce-website-backend-w3ob.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // FIX: Prevent infinite loop if the refresh request itself fails
      if (originalRequest.url.includes('/api/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // FIX: Remove window.location.href to stop the infinite refresh loop.
        // Instead, we broadcast an event that the token is dead.
        window.dispatchEvent(new CustomEvent('session-expired'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;