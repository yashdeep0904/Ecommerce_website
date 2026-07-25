import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext'; // To protect against self-deletion/demotion
import BackButton from '../components/BackButton';

const Users = () => {
  const { user: currentUser } = useAuth(); // The currently logged-in admin
  
  // Data States
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal & Action States
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  
  const handleRoleChange = async () => {
    setActionError('');
    setActionLoading(true);
    
    // Toggle the role logic
    const newRole = selectedUser.role === 'admin' ? 'user' : 'admin';

    try {
      await adminApi.updateUserRole(selectedUser._id, newRole);
      
      // Update UI optimistically without refreshing the page
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, role: newRole } : u));
      setIsRoleModalOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update role.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setActionError('');
    setActionLoading(true);

    try {
      await adminApi.deleteUser(selectedUser._id);
      
      // Remove user from the table instantly
      setUsers(users.filter(u => u._id !== selectedUser._id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="relative w-full p-6 mx-auto max-w-7xl md:p-8">
      <BackButton/>
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage all registered accounts on ShopHub.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white border shadow-sm border-slate-200 rounded-xl">
          <span className="relative flex w-3 h-3">
            <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400"></span>
            <span className="relative inline-flex w-3 h-3 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-sm font-semibold text-slate-700">Total Users: {users.length}</span>
        </div>
      </div>

      {/* Main Table */}
      {error ? (
        <div className="p-4 font-medium text-red-600 border border-red-200 bg-red-50 rounded-2xl">
          {error}
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border shadow-sm border-slate-100 rounded-3xl">
          <div className="w-10 h-10 border-4 rounded-full animate-spin border-slate-200 border-t-emerald-500"></div>
          <p className="mt-4 text-sm font-medium text-slate-500">Loading user database...</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white border shadow-sm border-slate-100 rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500">User Info</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500">Role</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-500">Joined Date</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-right uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id} className="transition-colors hover:bg-slate-50/50">
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 font-bold border rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-slate-200 text-slate-600">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {user.name} 
                            {currentUser?._id === user._id && <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">(You)</span>}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        user.role === 'admin' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {/* Only show actions if it's NOT the currently logged-in admin */}
                      {currentUser?._id !== user._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedUser(user); setIsRoleModalOpen(true); }}
                            className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            Swap Role
                          </button>
                          <button 
                            onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS
          ========================================== */}
      
      {/* 1. ROLE CHANGE MODAL */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 duration-200 bg-white shadow-xl rounded-3xl animate-in fade-in zoom-in">
            <h3 className="mb-2 text-xl font-bold text-slate-800">Modify Clearance Level</h3>
            <p className="mb-6 text-sm text-slate-500">
              You are about to change the role for <span className="font-bold text-slate-700">{selectedUser.name}</span>. 
              They are currently an <span className="font-bold uppercase text-slate-700">{selectedUser.role}</span>.
            </p>
            
            {actionError && <p className="p-2 mb-4 text-xs text-red-500 rounded-lg bg-red-50">{actionError}</p>}
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setIsRoleModalOpen(false); setActionError(''); }} 
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleRoleChange} 
                disabled={actionLoading}
                className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors disabled:opacity-70"
              >
                {actionLoading ? 'Updating...' : `Change to ${selectedUser.role === 'admin' ? 'User' : 'Admin'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DELETE ACCOUNT MODAL */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 duration-200 bg-white border-t-4 border-red-500 shadow-xl rounded-3xl animate-in fade-in zoom-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 text-red-500 bg-red-100 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Eradicate User Account</h3>
            </div>
            
            <p className="mt-4 mb-6 text-sm text-slate-500">
              Are you absolutely sure you want to delete <span className="font-bold text-slate-700">{selectedUser.name}</span>? 
              This will permanently wipe their data from the MongoDB cluster. This action <span className="font-bold text-red-500">cannot be undone.</span>
            </p>

            {actionError && <p className="p-2 mb-4 text-xs text-red-500 rounded-lg bg-red-50">{actionError}</p>}

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setActionError(''); }} 
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser} 
                disabled={actionLoading}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 shadow-[0_0_15px_-3px_rgba(220,38,38,0.4)] rounded-xl transition-colors disabled:opacity-70"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;