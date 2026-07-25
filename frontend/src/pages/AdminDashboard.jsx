import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import BackButton from '../components/BackButton';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Brand colors for the chart
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError("Failed to load analytics engine.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 rounded-full animate-spin border-slate-200 border-t-emerald-500"></div>
        <p className="mt-4 font-medium text-slate-500">Compiling Analytics...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 m-8 font-bold text-center text-red-500 bg-red-50 rounded-2xl">{error}</div>;
  }

  return (
    <div className="w-full p-6 mx-auto duration-500 max-w-7xl md:p-8 animate-in fade-in">
      
      <BackButton />
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Command Center</h1>
        <p className="mt-1 text-sm text-slate-500">Real-time overview of your e-commerce platform.</p>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Revenue Card */}
        <div className="relative p-6 overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-100 group">
          <div className="absolute top-0 right-0 w-24 h-24 transition-all translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20"></div>
          <p className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Total Revenue</p>
          <p className="text-3xl font-black text-slate-900">${stats.metrics.totalRevenue.toFixed(2)}</p>
        </div>

        {/* Orders Card */}
        <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-100">
          <p className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Orders Processed</p>
          <p className="text-3xl font-black text-slate-900">{stats.metrics.totalOrders}</p>
        </div>

        {/* Users Card */}
        <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-100">
          <p className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Registered Users</p>
          <p className="text-3xl font-black text-slate-900">{stats.metrics.totalUsers}</p>
        </div>

        {/* Products Card */}
        <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-100">
          <p className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">Active Inventory</p>
          <p className="text-3xl font-black text-slate-900">{stats.metrics.totalProducts}</p>
        </div>
      </div>

      {/* CHARTS AREA */}
      <div className="p-6 bg-white border shadow-sm md:p-8 rounded-3xl border-slate-100">
        <h2 className="mb-6 text-lg font-bold text-slate-800">Inventory Distribution by Category</h2>
        
        {stats.charts.categoryData.length === 0 ? (
           <p className="py-12 text-center text-slate-500">No inventory data available to chart.</p>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.charts.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;