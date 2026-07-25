import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import BackButton from '../components/BackButton';

const Orders = () => {
  // Data States
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAllOrders();
      setOrders(data);
    } catch (err) {
      setError("Failed to load order history.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers ---
  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminApi.updateOrderStatus(selectedOrder._id, newStatus);
      
      // Update UI instantly without refreshing
      setOrders(orders.map(o => 
        o._id === selectedOrder._id ? { ...o, status: newStatus } : o
      ));
      setIsStatusModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- UI Helpers ---
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Shipped': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="relative w-full p-6 mx-auto max-w-7xl md:p-8">
      
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
      <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Order Fulfillment</h1>
          <p className="mt-1 text-sm text-slate-500">Track customer purchases and update shipping statuses.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white border shadow-sm border-slate-200 rounded-xl">
           <span className="text-sm font-semibold text-slate-700">Total Orders: {orders.length}</span>
        </div>
      </div>

      {/* ORDERS TABLE */}
      {error ? (
        <div className="p-4 font-medium text-red-600 border border-red-200 bg-red-50 rounded-2xl">{error}</div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border shadow-sm border-slate-100 rounded-3xl">
          <div className="w-10 h-10 border-4 rounded-full animate-spin border-slate-200 border-t-emerald-500"></div>
          <p className="mt-4 text-sm font-medium text-slate-500">Syncing with database...</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white border shadow-sm border-slate-100 rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500">Order ID / Date</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-right uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="transition-colors hover:bg-slate-50/50">
                    
                    {/* ID & Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-mono text-xs font-bold text-slate-800">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Safety check: If user was deleted, order.user might be null */}
                      <p className="text-sm font-bold text-slate-800">{order.user?.name || 'Deleted Account'}</p>
                      <p className="text-xs text-slate-500">{order.user?.email || 'N/A'}</p>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-mono font-bold whitespace-nowrap text-emerald-600">
                      ${order.totalPrice.toFixed(2)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => openStatusModal(order)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
                
                {orders.length === 0 && (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No orders have been placed yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          UPDATE STATUS MODAL
          ========================================== */}
      {isStatusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 duration-200 bg-white shadow-xl rounded-3xl animate-in fade-in zoom-in">
            <h3 className="mb-2 text-xl font-bold text-slate-800">Update Order Status</h3>
            <p className="mb-6 text-sm text-slate-500">
              Order <span className="font-mono font-bold text-slate-700">#{selectedOrder._id.slice(-6).toUpperCase()}</span>
            </p>
            
            <form onSubmit={handleUpdateStatus}>
              <div className="mb-6">
                <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Select New Status</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-bold border outline-none cursor-pointer bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500 text-slate-700"
                >
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsStatusModalOpen(false)} 
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading || newStatus === selectedOrder.status}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Saving...' : 'Apply Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;