import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Calendar, Clock, AlertTriangle, XCircle, RotateCcw, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const toast = useToast();
  
  // Rescheduling state
  const [reschedulingAppt, setReschedulingAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  
  // Calendar month state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch appointments & settings
  const fetchAppointmentsAndSettings = async () => {
    try {
      setLoading(true);
      const [apptsRes, settingsRes] = await Promise.all([
        axios.get('/api/appointments/my'),
        axios.get('/api/settings')
      ]);
      setAppointments(apptsRes.data);
      setSettings(settingsRes.data);
    } catch (err) {
      console.error('Error fetching appointments data:', err);
      toast('Failed to load active appointments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsAndSettings();
  }, []);

  // Fetch slots for reschedule date
  useEffect(() => {
    if (!newDate) return;
    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        const res = await axios.get(`/api/appointments/available-slots?date=${newDate}`);
        setAvailableSlots(res.data.slots || []);
      } catch (err) {
        console.error(err);
        toast('Failed to load available slots.', 'error');
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [newDate, toast]);

  // Cancel handler
  const handleCancel = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await axios.put(`/api/appointments/${apptId}/cancel`);
      toast('Appointment cancelled successfully.', 'success');
      fetchAppointmentsAndSettings();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Cancellation failed.';
      toast(msg, 'error');
    }
  };

  // Reschedule submit handler
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newSlot) {
      return toast('Please choose date and time slot.', 'warning');
    }

    try {
      setSubmittingReschedule(true);
      await axios.put(`/api/appointments/${reschedulingAppt._id}/reschedule`, {
        date: newDate,
        timeSlot: newSlot
      });
      toast('Appointment rescheduled successfully. Status is reset to Pending for owner confirmation.', 'success');
      setReschedulingAppt(null);
      setNewDate('');
      setNewSlot('');
      fetchAppointmentsAndSettings();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Rescheduling failed.';
      toast(msg, 'error');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // Helper to determine status badge classes
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400';
      case 'Pending':
        return 'bg-yellow-950/40 border-yellow-500/50 text-yellow-400';
      case 'Completed':
        return 'bg-blue-950/40 border-blue-500/50 text-blue-400';
      case 'Cancelled':
        return 'bg-red-950/40 border-red-500/50 text-red-400';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-300';
    }
  };

  // Generate calendar days grid
  const getDaysInMonthGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const d = new Date(year, month, dayNum);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const isBlocked = settings?.blockedDates.includes(dateStr) || false;
      const isPast = d < today;

      days.push({
        dateStr,
        dayNum,
        isBlocked,
        isPast
      });
    }
    return days;
  };

  const handlePrevMonth = () => {
    const today = new Date();
    if (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth()) {
      return;
    }
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthYearLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Filter into Upcoming (Pending, Confirmed) and Past (Completed, Cancelled)
  const upcomingAppts = appointments.filter(a => ['Pending', 'Confirmed'].includes(a.status));
  const pastAppts = appointments.filter(a => ['Completed', 'Cancelled'].includes(a.status));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-white tracking-wide">My Appointments</h1>
        <p className="text-zinc-400 text-sm font-light">Review your ritual booking history and active schedules</p>
      </div>

      {/* 1. UPCOMING APPOINTMENTS */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
          <CalendarDays className="text-gold" size={20} />
          <h2 className="text-xl font-bold text-white tracking-wide">Upcoming Bookings</h2>
          <span className="bg-gold/10 text-gold text-xs px-2.5 py-0.5 rounded-full border border-gold/20 font-bold">
            {upcomingAppts.length}
          </span>
        </div>

        {upcomingAppts.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl border border-zinc-850 text-center text-zinc-500 text-sm font-light">
            You do not have any active upcoming bookings.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingAppts.map((appt) => (
              <div key={appt._id} className="glass-panel border border-zinc-850 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-gold/20 transition duration-300">
                
                {/* Service Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gold">{appt.service?.category}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(appt.status)}`}>
                      {appt.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-wide">{appt.service?.name}</h3>
                  
                  {/* Schedule */}
                  <div className="flex gap-4 text-xs text-zinc-400 pt-1 font-semibold">
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gold" /> {appt.date}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-gold" /> {appt.timeSlot}</span>
                  </div>
                </div>

                {/* Footer Pricing & Actions */}
                <div className="pt-4 border-t border-zinc-900 flex justify-between items-center">
                  <span className="text-gold font-bold text-base">₹{appt.service?.price}</span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setReschedulingAppt(appt);
                        setNewDate('');
                        setNewSlot('');
                        setCurrentMonth(new Date());
                      }}
                      className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-gold hover:border-gold/30 rounded-lg text-xs font-bold uppercase tracking-wider transition"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(appt._id)}
                      className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-red-400 hover:bg-red-950/20 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. PAST APPOINTMENTS */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
          <RotateCcw className="text-zinc-500" size={20} />
          <h2 className="text-xl font-bold text-white tracking-wide">Booking History</h2>
        </div>

        {pastAppts.length === 0 ? (
          <div className="glass-panel p-6 rounded-xl border border-zinc-850 text-center text-zinc-500 text-sm font-light">
            No past appointment records found.
          </div>
        ) : (
          <div className="overflow-x-auto glass-panel border border-zinc-850 rounded-2xl">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-900/40 text-xs text-zinc-400 uppercase border-b border-zinc-900">
                <tr>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Investment</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {pastAppts.map((appt) => (
                  <tr key={appt._id} className="hover:bg-zinc-900/10">
                    <td className="px-6 py-4 font-bold text-white">{appt.service?.name}</td>
                    <td className="px-6 py-4">{appt.date}</td>
                    <td className="px-6 py-4">{appt.timeSlot}</td>
                    <td className="px-6 py-4 font-semibold text-gold">₹{appt.service?.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* RESCHEDULE MONTHLY CALENDAR MODAL */}
      {reschedulingAppt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-panel border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-5 animate-fade-in relative shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="text-lg font-bold text-white font-serif tracking-wide">Reschedule Booking</h3>
              <button
                onClick={() => setReschedulingAppt(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <span className="text-xs text-zinc-500 block">Service:</span>
                <span className="text-sm font-bold text-gold">{reschedulingAppt.service?.name}</span>
              </div>
              
              {/* Custom monthly calendar selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Select New Date
                </label>
                
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3 space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-900/60 pb-2">
                    <button
                      type="button"
                      disabled={currentMonth.getFullYear() === new Date().getFullYear() && currentMonth.getMonth() === new Date().getMonth()}
                      onClick={handlePrevMonth}
                      className="p-1 bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-serif font-bold text-white uppercase tracking-wider">
                      {monthYearLabel}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white rounded"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 text-center text-[9px] font-bold text-zinc-500 uppercase tracking-wider pb-1">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonthGrid().map((day, idx) => {
                      if (day === null) {
                        return <div key={`empty-${idx}`}></div>;
                      }

                      const isDisabled = day.isPast || day.isBlocked;
                      const isSelected = newDate === day.dateStr;

                      return (
                        <button
                          key={day.dateStr}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            setNewDate(day.dateStr);
                            setNewSlot('');
                          }}
                          className={`py-1.5 rounded text-xs font-bold border transition ${
                            isDisabled
                              ? 'bg-zinc-950/20 border-zinc-900/30 text-zinc-700 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-gold text-black border-transparent font-bold'
                              : 'bg-zinc-900/40 border-zinc-850 text-gray-300 hover:border-gold/30 hover:text-gold'
                          }`}
                        >
                          {day.dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {newDate && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Select Time Slot <span className="text-[10px] text-zinc-500 font-normal">for {newDate}</span>
                  </label>
                  {loadingSlots ? (
                    <div className="text-center py-2 text-xs text-zinc-500">Checking slot availability...</div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-2 text-xs text-red-400 font-semibold">No available slots. Select another date.</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-zinc-950/20 border border-zinc-900 rounded-lg">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setNewSlot(slot.time)}
                          className={`py-2 px-1 rounded text-center text-xs font-bold border uppercase tracking-wider ${
                            !slot.isAvailable
                              ? 'bg-zinc-950/25 border-zinc-900 text-zinc-650 cursor-not-allowed line-through'
                              : newSlot === slot.time
                              ? 'bg-gold text-black border-transparent'
                              : 'bg-zinc-900 border-zinc-850 text-gray-300 hover:border-gold/30'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReschedulingAppt(null)}
                  className="w-full py-2.5 bg-zinc-900 border border-zinc-800 text-gray-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReschedule || !newDate || !newSlot}
                  className="w-full py-2.5 bg-gold text-black rounded-lg text-xs font-extrabold uppercase tracking-wider hover:bg-gold-dark disabled:opacity-50"
                >
                  {submittingReschedule ? 'Rescheduling...' : 'Reschedule'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default MyAppointments;
