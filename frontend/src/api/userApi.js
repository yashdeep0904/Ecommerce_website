import axiosInstance from './axiosConfig';

export const userApi = {
  getAllUsers: async () => {
    // Because axiosInstance has withCredentials: true, it will automatically attach your admin cookie!
    const response = await axiosInstance.get('/users'); 
    return response.data;
  },
};