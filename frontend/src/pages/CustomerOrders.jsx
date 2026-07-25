import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeApi } from '../api/storeApi';
import BackButton from '../components/BackButton';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserHistory = async () => {
      try {
        const data = await storeApi.getMyOrders();
        setOrders(data);
      } catch (err) {
        setError("Unable to retrieve your order history at this time.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="max-w-4xl p-4 mx-auto duration-500 md:p-8 animate-in fade-in">
      <div className="mb-8">
      <BackButton />
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Orders</h1>
        <p className="mt-2 font-medium text-slate-500">Track shipping details and review past purchases.</p>
      </div>

      {error ? (
        <div className="p-4 font-medium text-red-600 border border-red-200 bg-red-50 rounded-2xl">{error}</div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border shadow-sm border-slate-100 rounded-3xl">
          <div className="w-10 h-10 border-4 rounded-full animate-spin border-slate-200 border-t-emerald-500"></div>
          <p className="mt-4 text-sm font-medium text-slate-500">Gathering purchase history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center p-12 text-center bg-white border shadow-sm rounded-3xl border-slate-100">
          <div className="flex items-center justify-center w-20 h-20 mb-6 border rounded-full bg-slate-50 border-slate-100">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          </div>
          <h2 className="mb-1 text-lg font-bold text-slate-800">No orders found</h2>
          <p className="max-w-sm mb-6 text-sm text-slate-500">You haven't placed any orders yet. Once you complete checkout, your invoices will appear here.</p>
          <button onClick={() => navigate('/home')} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all">
            Browse Storefront
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="overflow-hidden transition-all bg-white border shadow-sm border-slate-100 rounded-3xl hover:shadow-md">
              
              {/* Order Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b bg-slate-50/70 border-slate-100">
                <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
                  <div>
                    <p className="uppercase tracking-wider text-[10px] text-slate-400">Date Placed</p>
                    <p className="text-slate-700 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-[10px] text-slate-400">Total Valuation</p>
                    <p className="text-emerald-600 font-bold font-mono mt-0.5">${order.totalPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-[10px] text-slate-400">Order Reference ID</p>
                    <p className="text-slate-700 font-mono mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Items List Inside Order */}
              <div className="p-6 divide-y divide-slate-100">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Qty: <span className="font-bold text-slate-700">{item.qty}</span> × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-800">
                      ${(item.qty * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Snapshot Footer */}
              <div className="flex items-center justify-between px-6 py-3 text-xs font-medium border-t bg-slate-50/30 border-slate-100 text-slate-500">
                <span>Shipping Destination:</span>
                <span className="font-semibold text-slate-700">
                  {order.shippingAddress.address}, {order.shippingAddress.city} ({order.shippingAddress.postalCode})
                </span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;