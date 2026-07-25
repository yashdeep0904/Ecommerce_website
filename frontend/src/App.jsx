// src/App.jsx - FINAL CLEAN VERSION
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';

// Layouts & Pages
import Home from './pages/Home';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/SignUp Page/AdminLogin';
import Users from './pages/Users';
import ManageProducts from './pages/ManageProducts';

// Auth Pages (Keep your paths exactly as they are)
import Login from './pages/SignUp Page/Login';
import Signup from './pages/SignUp Page/Signup';
import SetPassword from './pages/SignUp Page/SetPassword';
import VerifySignupOtp from './pages/SignUp Page/VerifySignupOtp';
import Orders from './pages/Orders';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CustomerOrders from './pages/CustomerOrders';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import OrderManagement from './pages/OrderManagement';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import Support from './pages/Support';
import Settings from './pages/Settings';

const App = () => {
  return (
    
      <AuthProvider>
        <CartProvider>
        <Routes>
          {/* ADMIN PORTAL */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* PROTECTED ADMIN DASHBOARD */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="users" element={<Users />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="orders" element={<Orders />} />
              <Route path="/admin/orders" element={<OrderManagement />} />
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* CUSTOMER STOREFRONT */}
          <Route path="/" element={<Home />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={null} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="verify/signupOtp" element={<VerifySignupOtp />} />
            <Route path="set-password" element={<SetPassword />} />
            <Route path="cart" element={<Cart/>} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<CustomerOrders />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />
          </Route>
        </Routes>
        </CartProvider>
      </AuthProvider>
    
  );
};

export default App;