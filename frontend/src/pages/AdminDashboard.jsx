import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Calendar, Users, IndianRupee, Clock, ToggleLeft, ToggleRight, CheckSquare, XSquare, Settings, Sparkles } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const toast = useToast();

  // Settings form state
  const [walkInWaitTime, setWalkInWaitTime] = useState(15);
  const [showWaitTimeBanner, setShowWaitTimeBanner] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, settingsRes] = await Promise.all([
        axios.get('/api/appointments/stats'),
        axios.get('/api/settings')
      ]);
      setStats(statsRes.data);
      setSettings(settingsRes.data);
      
      // Populate settings form
      setWalkInWaitTime(settingsRes.data.walkInWaitTime);
      setShowWaitTimeBanner(settingsRes.data.showWaitTimeBanner);
    } catch (err) {
      console.error(err);
      toast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdatingSettings(true);
      const res = await axios.put('/api/settings', {
        walkInWaitTime: Number(walkInWaitTime),
        showWaitTimeBanner
      });
      setSettings(res.data);
      toast('Salon configuration updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to update salon configuration.', 'error');
    } finally {
      setUpdatingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  // Calculate SVG dimensions for the chart
  const chartWidth = 500;
  const chartHeight = 200;
  const barPadding = 20;
  
  // Find max bookings value to scale the bars
  const maxBookings = stats ? Math.max(...stats.weeklyAnalytics.map(d => d.bookings), 4) : 4;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-wide flex items-center gap-2">
            Owner Dashboard <span className="text-xs font-semibold px-2 py-0.5 bg-gold/15 text-gold border border-gold/30 rounded-full">Admin</span>
          </h1>
          <p className="text-zinc-400 text-sm">Real-time statistics, weekly analytics, and walk-in controls</p>
        </div>
        <div className="text-sm text-zinc-500 font-semibold bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 rounded">
          Today: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}
        </div>
      </div>

      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Appointments */}
        <div className="glass-panel p-6 rounded-xl border border-zinc-850 flex items-center gap-4 hover:border-gold/25 transition">
          <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center text-gold">
            <Calendar size={22} />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Today's Bookings</span>
            <span className="text-2xl font-bold text-white">{stats?.todayAppointmentsCount}</span>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="glass-panel p-6 rounded-xl border border-zinc-850 flex items-center gap-4 hover:border-gold/25 transition">
          <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-750 flex items-center justify-center text-gray-300">
            <Users size={22} />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Total Bookings</span>
            <span className="text-2xl font-bold text-white">{stats?.totalBookings}</span>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="glass-panel p-6 rounded-xl border border-zinc-850 flex items-center gap-4 hover:border-gold/25 transition">
          <div className="w-12 h-12 rounded-lg bg-emerald-950/20 border border-emerald-500/35 flex items-center justify-center text-emerald-400">
            <IndianRupee size={22} />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Total Revenue</span>
            <span className="text-2xl font-bold text-white">₹{stats?.revenueSummary}</span>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="glass-panel p-6 rounded-xl border border-zinc-850 flex items-center gap-4 hover:border-gold/25 transition">
          <div className="w-12 h-12 rounded-lg bg-yellow-950/20 border border-yellow-500/35 flex items-center justify-center text-yellow-400">
            <Clock size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Pending Review</span>
            <span className="text-2xl font-bold text-white">{stats?.counts.pending}</span>
          </div>
        </div>
      </div>

      {/* Detail Counts Row */}
      <div className="grid grid-cols-3 gap-4 max-w-lg">
        <div className="bg-zinc-950/40 border border-zinc-900 p-3 rounded text-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Confirmed</span>
          <span className="text-sm font-bold text-emerald-400">{stats?.counts.confirmed}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 p-3 rounded text-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Completed</span>
          <span className="text-sm font-bold text-blue-400">{stats?.counts.completed}</span>
        </div>
        <div className="bg-zinc-950/40 border border-zinc-900 p-3 rounded text-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Cancelled</span>
          <span className="text-sm font-bold text-red-400">{stats?.counts.cancelled}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. WEEKLY SVG ANALYTICS CHART */}
        <div className="glass-panel p-6 rounded-xl border border-zinc-850 lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-1.5 font-serif">
            <Sparkles size={16} className="text-gold" /> Bookings Performance This Week
          </h3>
          
          <div className="w-full overflow-x-auto pt-4 bg-zinc-950/20 rounded-lg border border-zinc-900 p-4">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto text-zinc-400"
            >
              {/* Grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#1f1f23" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#1f1f23" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#1f1f23" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#1f1f23" strokeWidth="1" />

              {/* Y Axis labels */}
              <text x="30" y="25" textAnchor="end" fontSize="10" fill="#71717a">{(maxBookings).toFixed(0)}</text>
              <text x="30" y="75" textAnchor="end" fontSize="10" fill="#71717a">{(maxBookings / 2).toFixed(0)}</text>
              <text x="30" y="125" textAnchor="end" fontSize="10" fill="#71717a">{(maxBookings / 4).toFixed(0)}</text>
              <text x="30" y="175" textAnchor="end" fontSize="10" fill="#71717a">0</text>

              {/* Render bars and labels */}
              {stats?.weeklyAnalytics.map((dayData, index) => {
                const numBars = stats.weeklyAnalytics.length;
                const barSpacing = (chartWidth - 80) / numBars;
                const barWidth = barSpacing - barPadding;
                const x = 50 + index * barSpacing;
                
                // Calculate height relative to maxBookings
                const barHeight = (dayData.bookings / maxBookings) * 140; // max height is 140px
                const y = 170 - barHeight;

                return (
                  <g key={dayData.date} className="group">
                    {/* Hover tooltip background */}
                    <rect
                      x={x - 5}
                      y="10"
                      width={barWidth + 10}
                      height="180"
                      fill="transparent"
                      className="hover:fill-zinc-800/10 cursor-pointer transition"
                    />

                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="url(#goldGrad)"
                      rx="3"
                      className="transition duration-300"
                    />

                    {/* Count Text on top of Bar */}
                    {dayData.bookings > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="#d4af37"
                      >
                        {dayData.bookings}
                      </text>
                    )}

                    {/* X Axis Day Label */}
                    <text
                      x={x + barWidth / 2}
                      y="188"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#a1a1aa"
                    >
                      {dayData.day}
                    </text>
                  </g>
                );
              })}

              {/* Definitions for Gradients */}
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#aa7c11" />
                  <stop offset="100%" stopColor="#d4af37" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* 3. SETTINGS & WALK-IN BANNER CONFIG */}
        <div className="glass-panel p-6 rounded-xl border border-zinc-850 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5 font-serif">
              <Settings size={18} className="text-gold" /> Salon Configurations
            </h3>
            <p className="text-zinc-400 text-xs">Configure walk-in waiting durations and alerts shown on client home screen.</p>
            
            <form onSubmit={handleSettingsSubmit} className="space-y-4 pt-2">
              
              {/* Wait Time Toggle */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div>
                  <span className="text-sm font-semibold text-white block">Wait Time Alert Banner</span>
                  <span className="text-[10px] text-zinc-500">Toggle display on user homepage</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWaitTimeBanner(!showWaitTimeBanner)}
                  className="text-gold focus:outline-none"
                >
                  {showWaitTimeBanner ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="text-zinc-600" />}
                </button>
              </div>

              {/* Wait Time Minutes */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Estimated Wait Time (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={walkInWaitTime}
                  onChange={(e) => setWalkInWaitTime(e.target.value)}
                  className="block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-gold"
                  placeholder="e.g. 15"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingSettings}
                  className="w-full py-2 bg-zinc-900 border border-gold text-gold hover:bg-gold-gradient hover:text-black font-bold text-xs rounded transition uppercase tracking-widest disabled:opacity-50"
                >
                  {updatingSettings ? 'Saving...' : 'Save Configurations'}
                </button>
              </div>

            </form>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-900 p-3 rounded text-[11px] text-zinc-500 leading-relaxed mt-4">
            <p className="font-bold text-zinc-400 mb-1">Owner Operational Rules:</p>
            You can override limits and double-booking in the Calendar View when adding or rescheduling bookings.
          </div>
        </div>

      </div>

    </div>
  );
};
export default AdminDashboard;
