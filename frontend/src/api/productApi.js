import axiosInstance from './axiosConfig';

export const productApi = {
  getProducts: async () => {
    const response = await axiosInstance.get('/products');
    return response.data;
  },
  
  createProduct: async (formData) => {
    // We pass the raw formData object directly; Axios handles the multipart headers automatically
    const response = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await axiosInstance.delete(`/products/${productId}`);
    return response.data;
  }
};