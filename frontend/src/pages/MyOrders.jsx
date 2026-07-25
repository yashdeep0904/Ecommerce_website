import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeApi } from '../api/storeApi';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setIsLoading(true);
      const data = await storeApi.getMyOrders();
      setOrders(data);
    } catch (err) {
      toast.error("Unable to load your order history.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="px-3 py-1 text-xs font-bold tracking-wide border rounded-full bg-amber-50 text-amber-600 border-amber-200">Awaiting Payment</span>;
      case 'Paid':
        return <span className="px-3 py-1 text-xs font-bold tracking-wide text-blue-600 border border-blue-200 rounded-full bg-blue-50">Processing</span>;
      case 'Shipped':
        return <span className="px-3 py-1 text-xs font-bold tracking-wide text-purple-600 border border-purple-200 rounded-full bg-purple-50">Shipped</span>;
      case 'Delivered':
        return <span className="px-3 py-1 text-xs font-bold tracking-wide border rounded-full bg-emerald-50 text-emerald-600 border-emerald-200">Delivered</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold tracking-wide border rounded-full bg-slate-50 text-slate-600 border-slate-200">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 rounded-full animate-spin border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl p-4 mx-auto font-sans duration-500 md:p-8 animate-in fade-in">
      <div className="mb-8">
      <BackButton />
        <h1 className="text-3xl font-black tracking-tight md:text-4xl text-slate-900">My Orders</h1>
        <p className="mt-2 font-medium text-slate-500">Track, manage, and review your purchase history.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center p-12 text-center bg-white border shadow-sm rounded-3xl border-slate-100">
          <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-slate-50">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-800">No orders placed yet</h2>
          <p className="max-w-md mb-6 text-slate-500">When you purchase items from our store, they will appear here for easy tracking and management.</p>
          <button 
            onClick={() => navigate('/home')} 
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="flex flex-col overflow-hidden transition-all bg-white border shadow-sm rounded-3xl border-slate-100 hover:shadow-md">
              
              {/* Order Header */}
              <div className="flex flex-col items-start justify-between gap-4 p-6 border-b bg-slate-50/50 border-slate-100 sm:flex-row sm:items-center">
                <div className="flex flex-wrap text-sm gap-x-8 gap-y-2">
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Order Placed</p>
                    <p className="font-bold text-slate-800">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Total Amount</p>
                    <p className="font-bold text-slate-800">${order.totalPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Order ID</p>
                    <p className="font-mono font-bold text-slate-600">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="shrink-0">
                  {getStatusDisplay(order.status)}
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="divide-y divide-slate-100">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-center w-16 h-16 overflow-hidden border sm:w-20 sm:h-20 bg-slate-50 rounded-xl border-slate-100 shrink-0">
                         {/* Fallback image block if product images aren't stored directly on the order item */}
                         <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold transition-colors cursor-pointer sm:text-base text-slate-800 line-clamp-1 hover:text-emerald-600" onClick={() => navigate(`/product/${item.product}`)}>
                          {item.name}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">Qty: <span className="font-bold text-slate-700">{item.quantity}</span></p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black sm:text-base text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Order Footer Actions */}
              <div className="flex justify-end px-6 py-4 border-t bg-slate-50/50 border-slate-100">
                 <button 
                   onClick={() => navigate(`/product/${order.orderItems[0]?.product}`)}
                   className="text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                 >
                   View Product Details
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                 </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;