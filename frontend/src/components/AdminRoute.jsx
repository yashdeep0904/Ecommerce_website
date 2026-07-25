import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user } = useAuth(); // If you don't have isLoading here, rely on user check

  // If there is no user, send to admin login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // If user exists but isn't admin, send to home
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Success
  return <Outlet />;
};

export default AdminRoute;