import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storeApi } from '../api/storeApi';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Settings = () => {
  const { user, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  // Notification Preferences State
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  });

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call or use storeApi.updatePreferences(preferences)
      await new Promise(resolve => setTimeout(resolve, 800)); 
      toast.success("Preferences updated successfully.");
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if(window.confirm("Are you absolutely sure? This action cannot be undone and will permanently delete your purchase history.")) {
      toast.error("Account deletion requested. Please contact support to finalize.");
      // In a real app, call storeApi.deleteAccount() then logout()
    }
  };

  return (
    <div className="max-w-3xl p-4 mx-auto font-sans duration-500 md:p-8 animate-in fade-in">
        <BackButton />
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Account Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your notification preferences and account security.</p>
      </div>

      <div className="space-y-6">
        {/* Notifications Card */}
        <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-100 md:p-8">
          <h2 className="flex items-center gap-2 mb-6 text-lg font-bold text-slate-900">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            Communication Preferences
          </h2>
          
          <div className="space-y-4">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div>
                <p className="text-sm font-bold text-slate-800">Order Updates</p>
                <p className="text-xs text-slate-500 mt-0.5">Receive emails about your shipping and delivery status.</p>
              </div>
              <button onClick={() => handleToggle('orderUpdates')} className={`w-12 h-6 rounded-full transition-colors relative ${preferences.orderUpdates ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.orderUpdates ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div>
                <p className="text-sm font-bold text-slate-800">Promotions & Offers</p>
                <p className="text-xs text-slate-500 mt-0.5">Get notified about exclusive discounts and flash sales.</p>
              </div>
              <button onClick={() => handleToggle('promotions')} className={`w-12 h-6 rounded-full transition-colors relative ${preferences.promotions ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.promotions ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-bold text-slate-800">Weekly Newsletter</p>
                <p className="text-xs text-slate-500 mt-0.5">Tech news, fashion guides, and platform updates.</p>
              </div>
              <button onClick={() => handleToggle('newsletter')} className={`w-12 h-6 rounded-full transition-colors relative ${preferences.newsletter ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.newsletter ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-8">
             <button onClick={handleSaveSettings} disabled={isSaving} className="px-6 py-3 text-xs font-bold text-white transition-all shadow-md bg-slate-900 hover:bg-slate-800 rounded-xl">
               {isSaving ? "Saving..." : "Save Preferences"}
             </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 border border-red-100 bg-red-50/50 rounded-3xl md:p-8">
          <h2 className="mb-2 text-lg font-bold text-red-600">Danger Zone</h2>
          <p className="mb-6 text-sm text-red-400">Permanently remove your account and all associated data. This action is irreversible.</p>
          <button onClick={handleDeleteAccount} className="px-6 py-3 text-xs font-bold text-red-600 transition-all bg-white border border-red-200 shadow-sm hover:bg-red-600 hover:text-white rounded-xl">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;