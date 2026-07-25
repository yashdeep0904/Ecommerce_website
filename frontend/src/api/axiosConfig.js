import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000/api', // Must match your backend port
  withCredentials: true, // CRITICAL: Tells browser to send HTTP-Only cookies
});

// Response Interceptor for Silent Token Refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to silently refresh the token
        await axios.post('http://localhost:4000/api/auth/refresh', {}, { withCredentials: true });
        
        // If successful, retry the original failed request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails (session truly expired), force logout
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 