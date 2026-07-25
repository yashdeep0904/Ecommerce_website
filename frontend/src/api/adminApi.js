import axiosInstance from './axiosConfig';

export const adminApi = {
  // --- USER ENDPOINTS ---
  getUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },
  updateUserRole: async (userId, role) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // --- PRODUCT ENDPOINTS ---
  getProducts: async () => {
    // Assuming your product routes are mounted at /api/products in server.js
    const response = await axiosInstance.get('/products'); 
    return response.data;
  },
  createProduct: async (productData) => {
    const response = await axiosInstance.post('/products', productData);
    return response.data;
  },
  updateProduct: async (id, payload) => {
    const response = await axiosInstance.put(`/products/${id}`, payload);
    return response.data;
  },
  deleteProduct: async (productId) => {
    const response = await axiosInstance.delete(`/products/${productId}`);
    return response.data;
  },

  // --- ORDER ENDPOINTS ---
getAllOrders: async () => {
    const response = await axiosInstance.get('/admin/orders');
    return response.data;
  },
  updateOrderStatus: async (orderId, status) => {
    const response = await axiosInstance.patch(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  // --- ANALYTICS ENDPOINTS ---
  getDashboardStats: async () => {
    // Make sure this matches the route we built in adminRoutes.js
    const response = await axiosInstance.get('/admin/stats');
    return response.data;
  },
  // --- MULTIPLE IMAGE UPLOAD ENGINE ---
  uploadImages: async (imageFilesArray) => {
    const formData = new FormData();
    
    for (let i = 0; i < imageFilesArray.length; i++) {
      formData.append('images', imageFilesArray[i]);
    }
    
    // Force a 15-second timeout. If it hangs, React will abort and throw an error!
    const response = await axiosInstance.post('/upload/multiple', formData, {
      timeout: 15000 
    });
    
    return response.data.imageUrls; 
  },
  
};

