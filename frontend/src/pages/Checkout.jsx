import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { storeApi } from '../api/storeApi';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

// Utility to dynamically load the Razorpay script without installing heavy NPM packages
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState({
    address: '', city: '', postalCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Math
  const shippingEstimate = cartTotal > 0 ? 5.99 : 0;
  const taxEstimate = cartTotal * 0.08;
  const finalTotal = cartTotal + shippingEstimate + taxEstimate;

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Load Razorpay Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load Razorpay SDK. Check your internet connection.");
        setIsLoading(false);
        return;
      }

      // 2. Ask Backend to Create an Order
      const order = await storeApi.createRazorpayOrder({ amount: finalTotal });

      // 3. Format cart items exactly how our MongoDB schema expects them
      const formattedItems = cartItems.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        product: item._id
      }));

      // 4. Configure the Razorpay Payment Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "ShopHub E-Commerce",
        description: "Secure Checkout Transaction",
        order_id: order.id, 
        
        // This handler runs automatically when the user successfully pays
        handler: async function (response) {
          try {
            toast.loading("Verifying payment...", { id: 'payment-toast' });
            
            // Send the cryptographic signature and order details to the backend
            await storeApi.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderItems: formattedItems,
              shippingAddress,
              totalPrice: finalTotal
            });

            toast.success("Payment Successful! Order Placed.", { id: 'payment-toast' });
            clearCart();
            navigate('/orders'); // Redirect to their new order history
            
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed.", { id: 'payment-toast' });
          }
        },
        
        // Pre-fill user data to save them time
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#10b981", // Emerald 500 to match your UI
        },
      };

      // 5. Open the Razorpay Modal
      const paymentObject = new window.Razorpay(options);
      
      // Handle the case where the user closes the modal without paying
      paymentObject.on('payment.failed', function (response) {
        toast.error("Payment failed or was cancelled.");
        setIsLoading(false);
      });

      paymentObject.open();

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initialize checkout.");
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        
        <h2 className="text-2xl font-bold text-slate-800">Your cart is empty!</h2>
        <button onClick={() => navigate('/home')} className="mt-4 font-bold text-emerald-600 hover:underline">
          Go back to shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl p-4 mx-auto duration-500 md:p-8 animate-in fade-in">
      <div className="mb-8">
      <BackButton />
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Secure Checkout</h1>
        <p className="mt-2 font-medium text-slate-500">Please provide your shipping details to complete the order.</p>
      </div>

      <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-100 md:p-8">
        <form onSubmit={handleCheckout} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="pb-2 text-lg font-bold border-b text-slate-800 border-slate-100">Shipping Information</h3>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Street Address</label>
              <input type="text" required value={shippingAddress.address} onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})} className="w-full px-4 py-3 text-sm font-medium border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">City</label>
                <input type="text" required value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} className="w-full px-4 py-3 text-sm font-medium border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" placeholder="New York" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Postal Code</label>
                <input type="text" required value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})} className="w-full px-4 py-3 text-sm font-medium border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" placeholder="10001" />
              </div>
            </div>
          </div>

          <div className="p-6 mt-8 border bg-slate-50 rounded-2xl border-slate-100">
             <div className="flex items-end justify-between">
                <div>
                   <p className="text-sm font-bold tracking-widest uppercase text-slate-500">Total Amount to Pay</p>
                   <p className="mt-1 text-xs text-slate-400">Includes shipping & taxes</p>
                </div>
                <span className="text-3xl font-black text-emerald-600">${finalTotal.toFixed(2)}</span>
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-slate-900/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading Secure Gateway...' : 'Pay with Razorpay'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;