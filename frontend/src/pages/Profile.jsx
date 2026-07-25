import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storeApi } from '../api/storeApi';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Profile = () => {
  const { user, login } = useAuth(); // Assuming login or a sync method updates the global auth state context
  const [activeTab, setActiveTab] = useState('details'); // details | security

  // --- Profile Meta States ---
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.shippingAddress?.address || '',
    city: user?.shippingAddress?.city || '',
    postalCode: user?.shippingAddress?.postalCode || ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // --- Password Transition States ---
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const updatedPayload = {
        name: profile.name,
        phone: profile.phone,
        shippingAddress: { address: profile.address, city: profile.city, postalCode: profile.postalCode }
      };
      const syncedUser = await storeApi.updateProfile(updatedPayload);
      // Optional background context update hook if your AuthContext supports user mapping mutations
      toast.success("Profile parameters synchronized successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile synchronization failed.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New credentials arrays do not verify perfectly.");
    }
    if (passwords.newPassword.length < 6) {
      return toast.error("Password complexity scope minimum requirements not met.");
    }

    setIsUpdatingPassword(true);
    try {
      await storeApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success("Security token successfully reset.");
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update authentication parameter.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl p-4 mx-auto font-sans duration-500 md:p-8 animate-in fade-in">
        <BackButton />
      <div className="flex flex-col items-start justify-between gap-4 pb-6 mb-8 border-b md:flex-row md:items-center border-slate-100">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Account Parameters</h1>
          <p className="mt-1 text-sm text-slate-500">Configure user identity and profile authentication bounds.</p>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl shrink-0">
          <button 
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'details' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            My Information
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'security' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Security Credentials
          </button>
        </div>
      </div>

      {activeTab === 'details' ? (
        /* INFORMATION LOG CARD */
        <form onSubmit={handleProfileSubmit} className="p-6 space-y-6 overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-100 md:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">Account Registry Owner</label>
              <input type="text" required value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-3 text-sm font-medium transition-colors border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" />
            </div>
            <div>
              <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">Network Endpoint Identifier (Immutable)</label>
              <input type="email" disabled value={user?.email || ''} className="w-full px-4 py-3 text-sm font-medium border cursor-not-allowed bg-slate-100 border-slate-200 rounded-xl text-slate-400" />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">Contact Sequence Number</label>
              <input type="tel" value={profile.phone} placeholder="Enter contact digits" onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-3 text-sm font-medium transition-colors border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" />
            </div>
            <div className="pt-4 border-t md:col-span-2 border-slate-100">
              <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">Default Logistics Destination Address</label>
              <input type="text" value={profile.address} placeholder="Street parameters, apartment metadata" onChange={(e) => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-3 mb-4 text-sm font-medium transition-colors border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={profile.city} placeholder="City Hub" onChange={(e) => setProfile({...profile, city: e.target.value})} className="w-full px-4 py-3 text-sm font-medium transition-colors border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" />
                <input type="text" value={profile.postalCode} placeholder="Postal Area Index" onChange={(e) => setProfile({...profile, postalCode: e.target.value})} className="w-full px-4 py-3 text-sm font-medium transition-colors border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-6 border-t border-slate-100">
            <button type="submit" disabled={isUpdatingProfile} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3.5 px-8 rounded-xl shadow-md uppercase tracking-wider transition-all">
              {isUpdatingProfile ? "Synchronizing Matrix..." : "Commit Parameters"}
            </button>
          </div>
        </form>
      ) : (
        /* SECURITY ALTERATION CARD */
        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6 overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-100 md:p-8">
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">Current Password</label>
              <input type="password" required value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} className="w-full px-4 py-3 text-sm font-medium transition-colors border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-1 gap-4 pt-4 border-t md:grid-cols-2 border-slate-100">
              <div>
                <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-400"> New Password</label>
                <input type="password" required value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="w-full px-4 py-3 text-sm font-medium transition-colors border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" placeholder="••••••••" />
              </div>
              <div>
                <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">Confirm New Password</label>
                <input type="password" required value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full px-4 py-3 text-sm font-medium transition-colors border outline-none bg-slate-50 border-slate-200 rounded-xl focus:border-emerald-500" placeholder="••••••••" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-6 border-t border-slate-100">
            <button type="submit" disabled={isUpdatingPassword} className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold py-3.5 px-8 rounded-xl shadow-md uppercase tracking-wider transition-all">
              {isUpdatingPassword ? "Processing Mutation..." : "Change Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;