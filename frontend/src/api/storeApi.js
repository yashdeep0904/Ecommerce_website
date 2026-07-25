import axiosInstance from './axiosConfig';

export const storeApi = {
  getProducts: async (params = {},filters= {}) => {
    const response = await axiosInstance.get('/products',{params},{params:filters}); 
    return response.data;
  },
  // 👇 ADD THIS NEW METHOD 👇
  createOrder: async (orderData) => {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  },
  getMyOrders: async () => {
    const response = await axiosInstance.get('/orders/myorders');
    return response.data;
  },
  // 1. Ask backend to generate a Razorpay Order ID
  createRazorpayOrder: async (amountData) => {
    const response = await axiosInstance.post('/payments/razorpay/create-order', amountData);
    return response.data;
  },
  
  // 2. Send the successful payment signature and cart data to be verified/saved
  verifyRazorpayPayment: async (paymentData) => {
    const response = await axiosInstance.post('/payments/razorpay/verify-payment', paymentData);
    return response.data;
  },
  // 1. Fetch a single product by its MongoDB ID
  getProductById: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  // 2. Submit a review
  createReview: async (productId, reviewData) => {
    const response = await axiosInstance.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },
  // --- WISHLIST API GATEWAY ---
  getWishlist: async () => {
    const response = await axiosInstance.get('/users/wishlist');
    return response.data;
  },
  toggleWishlist: async (productId) => {
    const response = await axiosInstance.post('/users/wishlist/toggle', { productId });
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/users/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordPayload) => {
    const response = await axiosInstance.put('/users/change-password', passwordPayload);
    return response.data;
  },
  // Add these inside your storeApi object
  updatePreferences: async (preferences) => {
    // Note: You can route this to your existing profile update endpoint
    const response = await axiosInstance.put('/users/preferences', preferences);
    return response.data;
  },

  submitSupportTicket: async (ticketData) => {
    const response = await axiosInstance.post('/support/ticket', ticketData);
    return response.data;
  },
  getCart: async () => {
    const response = await axiosInstance.get('/cart');
    return response.data;
  },

  addToCart: async (productData) => {
    // productData should contain { product, name, price, image }
    const response = await axiosInstance.post('/cart/add', productData);
    return response.data;
  },

  updateCartQuantity: async (productId, quantity) => {
    const response = await axiosInstance.put('/cart/update', { productId, quantity });
    return response.data;
  },

  removeFromCart: async (productId) => {
    const response = await axiosInstance.delete(`/cart/remove/${productId}`);
    return response.data;
  },

  clearCartDB: async () => {
    const response = await axiosInstance.delete('/cart/clear');
    return response.data;
  },

  
};