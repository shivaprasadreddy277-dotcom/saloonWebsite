import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Clock, CheckCircle2, RotateCcw, Shield } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/appointments/my');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
      toast('Unable to load your booking history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const upcoming = appointments.filter((appt) => ['Pending', 'Confirmed'].includes(appt.status));
  const past = appointments.filter((appt) => ['Completed', 'Cancelled'].includes(appt.status));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="glass-panel rounded-3xl border border-zinc-850 p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="rounded-3xl bg-gold/10 p-4 border border-gold/20">
              <User size={28} className="text-gold" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">Profile</p>
              <h1 className="text-3xl font-serif font-bold text-white">{user?.name}</h1>
              <p className="text-sm text-zinc-400">{user?.role === 'admin' ? 'Salon Owner' : 'Customer'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-zinc-950/70 border border-zinc-800 p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Email</p>
              <p className="text-sm text-white break-all">{user?.email}</p>
            </div>
            <div className="rounded-2xl bg-zinc-950/70 border border-zinc-800 p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Phone</p>
              <p className="text-sm text-white">{user?.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="rounded-2xl bg-zinc-950/70 border border-zinc-800 p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gold">{appointments.length}</p>
            </div>
            <div className="rounded-2xl bg-zinc-950/70 border border-zinc-800 p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Upcoming</p>
              <p className="text-2xl font-bold text-emerald-400">{upcoming.length}</p>
            </div>
            <div className="rounded-2xl bg-zinc-950/70 border border-zinc-800 p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Past</p>
              <p className="text-2xl font-bold text-zinc-500">{past.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-zinc-850 p-8 space-y-6">
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <Shield size={20} className="text-gold" />
            <p>Every booking is securely stored and available when you re-login.</p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">Personal preferences</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">Use your profile page to review your appointments, cancel or reschedule, and stay updated with email reminders before each booking.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Calendar className="text-gold" size={18} />
          <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="glass-panel border border-zinc-850 rounded-3xl p-8 text-center text-zinc-500">
            No bookings found yet. Start by booking your first appointment.
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.slice(0, 6).map((appt) => (
              <div key={appt._id} className="glass-panel rounded-3xl border border-zinc-850 p-5 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-zinc-500">{appt.service?.category}</p>
                  <h3 className="text-lg font-bold text-white">{appt.service?.name}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Clock size={14} /> {appt.service?.duration} mins</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {appt.date}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 size={14} /> {appt.timeSlot}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-zinc-500">Status</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold ${appt.status === 'Confirmed' ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30' : appt.status === 'Pending' ? 'bg-yellow-950/30 text-yellow-300 border border-yellow-500/30' : appt.status === 'Cancelled' ? 'bg-red-950/30 text-red-300 border border-red-500/30' : 'bg-blue-950/30 text-blue-300 border border-blue-500/30'}`}>
                    {appt.status}
                  </span>
                  <p className="mt-3 text-base font-semibold text-gold">₹{appt.service?.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
