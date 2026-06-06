import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Calendar, Clock, Filter, Check, X, CheckCircle, Info, CalendarOff, Plus, Trash } from 'lucide-react';

export const AdminCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  
  // Blocked Date Form State
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [submittingSettings, setSubmittingSettings] = useState(false);
  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch settings
      const settingsRes = await axios.get('/api/settings');
      setSettings(settingsRes.data);

      // Fetch appointments with filters
      let apptsUrl = '/api/appointments';
      const params = [];
      if (statusFilter !== 'All') params.push(`status=${statusFilter}`);
      if (dateFilter) params.push(`date=${dateFilter}`);
      if (params.length > 0) apptsUrl += `?${params.join('&')}`;

      const apptsRes = await axios.get(apptsUrl);
      setAppointments(apptsRes.data);
    } catch (err) {
      console.error(err);
      toast('Failed to load calendar data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, dateFilter]);

  // Update appointment status (Confirm / Cancel / Complete)
  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await axios.put(`/api/appointments/${apptId}/status`, { status: newStatus });
      toast(`Appointment status updated to ${newStatus}.`, 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Status update failed.';
      toast(msg, 'error');
    }
  };

  // Add Blocked Date
  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!newBlockedDate) return;

    if (settings.blockedDates.includes(newBlockedDate)) {
      return toast('This date is already blocked.', 'warning');
    }

    try {
      setSubmittingSettings(true);
      const updatedBlockedDates = [...settings.blockedDates, newBlockedDate];
      const res = await axios.put('/api/settings', {
        blockedDates: updatedBlockedDates
      });
      setSettings(res.data);
      setNewBlockedDate('');
      toast(`Salon closed date registered: ${newBlockedDate}`, 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to block date.', 'error');
    } finally {
      setSubmittingSettings(false);
    }
  };

  // Remove Blocked Date
  const handleRemoveBlockedDate = async (dateStr) => {
    try {
      setSubmittingSettings(true);
      const updatedBlockedDates = settings.blockedDates.filter(d => d !== dateStr);
      const res = await axios.put('/api/settings', {
        blockedDates: updatedBlockedDates
      });
      setSettings(res.data);
      toast(`Date unlocked successfully: ${dateStr}`, 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to unlock date.', 'error');
    } finally {
      setSubmittingSettings(false);
    }
  };

  const statusOptions = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

  const getStatusRowClass = (status) => {
    switch (status) {
      case 'Confirmed': return 'border-l-4 border-emerald-500 bg-zinc-900/10';
      case 'Pending': return 'border-l-4 border-yellow-500 bg-zinc-900/10';
      case 'Completed': return 'border-l-4 border-blue-500 bg-zinc-900/10';
      case 'Cancelled': return 'border-l-4 border-red-500 bg-zinc-900/10';
      default: return 'border-l-4 border-zinc-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-950/40 border-emerald-500 text-emerald-400';
      case 'Pending': return 'bg-yellow-950/40 border-yellow-500 text-yellow-400';
      case 'Completed': return 'bg-blue-950/40 border-blue-500 text-blue-400';
      case 'Cancelled': return 'bg-red-950/40 border-red-500 text-red-400';
      default: return 'bg-zinc-800 border-zinc-700 text-zinc-350';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Appointment Planner</h1>
        <p className="text-zinc-400 text-sm">Monitor daily schedules, click actions to approve, and manage holidays</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* APPOINTMENT LIST & FILTERS (Colspan 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filters Bar */}
          <div className="glass-panel p-4 rounded-xl border border-zinc-850 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gold" />
              <span className="text-sm font-semibold text-white">Filters:</span>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-xs text-gray-300 px-3 py-1.5 rounded focus:outline-none focus:border-gold"
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt} Bookings</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-xs text-gray-300 px-3 py-1 rounded focus:outline-none focus:border-gold"
                />
              </div>

              {/* Reset Filters */}
              {(statusFilter !== 'All' || dateFilter) && (
                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setDateFilter('');
                  }}
                  className="text-xs text-zinc-500 hover:text-white underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="glass-panel p-12 text-center text-zinc-500 rounded-xl border border-zinc-850">
              <Calendar size={40} className="mx-auto mb-3 text-zinc-700" />
              <p>No bookings match the selected filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  className={`glass-panel rounded-xl overflow-hidden p-5 border border-zinc-855 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${getStatusRowClass(appt.status)}`}
                >
                  {/* Left: Schedule and Service */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getStatusBadge(appt.status)}`}>
                        {appt.status}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Calendar size={12} className="text-gold" />
                        <span className="font-semibold text-white">{appt.date}</span>
                        <Clock size={12} className="text-gold ml-1.5" />
                        <span className="font-semibold text-white">{appt.timeSlot}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base tracking-wide">
                        {appt.service?.name || 'Deleted Service'}
                        <span className="text-xs font-normal text-zinc-500 ml-2">({appt.service?.duration} mins)</span>
                      </h3>
                      
                      {/* Customer Info */}
                      <div className="text-xs text-zinc-400 pt-1 space-y-0.5">
                        <p><strong className="text-zinc-300">Client:</strong> {appt.customer?.name} ({appt.customer?.email})</p>
                        {appt.customer?.phone && <p><strong className="text-zinc-300">Phone:</strong> {appt.customer.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Admin Quick Actions */}
                  <div className="w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-zinc-900 flex md:flex-col items-center md:items-end justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-zinc-500 block text-right">Investment</span>
                      <span className="text-base font-serif font-bold text-gold">₹{appt.service?.price}</span>
                    </div>

                    {/* Quick Buttons */}
                    <div className="flex gap-1.5">
                      {appt.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(appt._id, 'Confirmed')}
                          className="p-1.5 bg-emerald-950/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded transition"
                          title="Confirm Appointment"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      
                      {['Pending', 'Confirmed'].includes(appt.status) && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(appt._id, 'Completed')}
                            className="p-1.5 bg-blue-950/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500 hover:text-black rounded transition"
                            title="Mark Completed"
                          >
                            <CheckCircle size={14} />
                          </button>
                          
                          <button
                            onClick={() => handleUpdateStatus(appt._id, 'Cancelled')}
                            className="p-1.5 bg-red-950/20 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-black rounded transition"
                            title="Cancel Booking"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* HOLIDAYS / BLOCKED DATES (Colspan 1) */}
        <div className="space-y-6">
          
          <div className="glass-panel p-6 rounded-xl border border-zinc-850 space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <CalendarOff className="text-gold" size={20} />
              <h2 className="text-lg font-serif font-bold text-white tracking-wide">Manage Days Off</h2>
            </div>

            {/* Block Date Form */}
            <form onSubmit={handleAddBlockedDate} className="space-y-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Select Holiday / Day Off
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  disabled={submittingSettings || !newBlockedDate}
                  className="px-3 bg-gold text-black rounded font-bold text-xs flex items-center justify-center hover:bg-gold-dark disabled:opacity-50"
                  title="Block Date"
                >
                  <Plus size={16} />
                </button>
              </div>
            </form>

            {/* Blocked Dates List */}
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Currently Closed Dates ({settings?.blockedDates.length || 0})
              </span>
              
              {(!settings?.blockedDates || settings.blockedDates.length === 0) ? (
                <p className="text-zinc-650 text-xs italic">No holidays scheduled.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {settings.blockedDates.map((dateStr) => (
                    <div
                      key={dateStr}
                      className="flex justify-between items-center bg-zinc-950/60 border border-zinc-900 px-3 py-2 rounded text-xs text-white"
                    >
                      <span className="font-semibold">{dateStr}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlockedDate(dateStr)}
                        className="text-red-400 hover:text-red-300 p-0.5"
                        title="Unlock Date"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
export default AdminCalendar;
