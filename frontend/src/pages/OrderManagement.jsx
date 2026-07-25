import React, { useState, useEffect } from 'react';
 // Adjust import path if needed
import toast from 'react-hot-toast';
import { adminApi } from '../api/adminApi';
import BackButton from '../components/BackButton';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // For the details modal

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAllOrders();
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load orders from server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      toast.loading("Updating status...", { id: 'status-update' });
      await adminApi.updateOrderStatus(orderId, newStatus);
      
      // Update local UI state instantly
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success(`Order marked as ${newStatus}`, { id: 'status-update' });
    } catch (err) {
      toast.error("Failed to update status", { id: 'status-update' });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Paid': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Shipped': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 min-h-screen bg-[#020617] text-slate-300">
      <BackButton />
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 pb-6 mb-8 border-b md:flex-row md:items-center border-slate-800">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Fulfillment Center</h1>
          <p className="mt-1 text-sm text-slate-500">Manage, process, and track all incoming shipments.</p>
        </div>
        <div className="flex items-center gap-3 p-3 border bg-slate-900/50 rounded-2xl border-slate-800">
          <div className="px-4 text-center border-r border-slate-800">
             <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Total Orders</p>
             <p className="text-xl font-black text-white">{orders.length}</p>
          </div>
          <div className="px-4 text-center">
             <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Pending Action</p>
             <p className="text-xl font-black text-amber-500">
               {orders.filter(o => o.status === 'Paid').length}
             </p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-[10px] uppercase tracking-widest text-slate-500 font-black border-b border-slate-800">
                <th className="p-5 pl-8">Order ID / Date</th>
                <th className="p-5">Customer</th>
                <th className="p-5">Total Value</th>
                <th className="p-5">Fulfillment Status</th>
                <th className="p-5 pr-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center">
                    <div className="w-8 h-8 mx-auto mb-4 border-2 rounded-full animate-spin border-slate-700 border-t-blue-500"></div>
                    <span className="font-medium text-slate-500">Syncing Ledger...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 font-medium text-center text-slate-500">No orders found in the database.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="transition-colors hover:bg-slate-800/20">
                    <td className="p-5 pl-8">
                      <p className="mb-1 font-mono text-xs font-bold text-white">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-white mb-0.5">{order.user?.name || "Guest Checkout"}</p>
                      <p className="text-xs text-slate-500">{order.user?.email || "N/A"}</p>
                    </td>
                    <td className="p-5">
                      <span className="font-mono font-bold text-emerald-400">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-5">
                      {/* Interactive Status Dropdown */}
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer appearance-none ${getStatusColor(order.status)}`}
                      >
                        <option value="Pending" className="bg-slate-900 text-amber-500">Pending</option>
                        <option value="Paid" className="text-blue-400 bg-slate-900">Paid (Processing)</option>
                        <option value="Shipped" className="text-purple-400 bg-slate-900">Shipped</option>
                        <option value="Delivered" className="bg-slate-900 text-emerald-400">Delivered</option>
                      </select>
                    </td>
                    <td className="p-5 pr-8 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 text-xs font-bold text-blue-400 transition-colors rounded-lg hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20"
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-950/50">
              <div>
                 <h2 className="text-xl font-black text-white">Invoice Details</h2>
                 <p className="mt-1 font-mono text-xs text-slate-500">ID: {selectedOrder._id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 transition-colors rounded-full text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
              
              {/* Shipping Block */}
              <div className="p-5 border bg-slate-800/30 border-slate-800 rounded-2xl">
                <h3 className="mb-3 text-xs font-black tracking-widest uppercase text-slate-500">Shipping Destination</h3>
                <p className="font-medium text-white">{selectedOrder.shippingAddress?.address}</p>
                <p className="text-slate-400">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
              </div>

              {/* Items Block */}
              <div>
                <h3 className="mb-4 text-xs font-black tracking-widest uppercase text-slate-500">Purchased Items</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border bg-slate-950/50 border-slate-800/50 rounded-xl">
                       <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12 overflow-hidden rounded-lg bg-slate-800">
                            <span className="text-xs font-bold text-slate-600">IMG</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200">{item.name}</p>
                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                          </div>
                       </div>
                       <p className="font-mono font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderManagement;