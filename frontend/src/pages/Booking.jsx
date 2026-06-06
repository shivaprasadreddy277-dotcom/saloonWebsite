import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Scissors, Calendar, Clock, CheckCircle2, ChevronRight, ChevronLeft, CalendarDays, Sparkles } from 'lucide-react';

export const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  // Wizard Steps: 1: Service, 2: Date, 3: Time Slot, 4: Confirm
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  
  // Selection States
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  
  // Calendar View Month State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Loading States
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Dynamic Data
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isBlockedDay, setIsBlockedDay] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // Load Services and Settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, settingsRes] = await Promise.all([
          axios.get('/api/services'),
          axios.get('/api/settings')
        ]);
        setServices(servicesRes.data);
        setSettings(settingsRes.data);
        
        // If navigation state passed a pre-selected serviceId
        const preSelectedId = location.state?.serviceId;
        if (preSelectedId) {
          const matched = servicesRes.data.find(s => s._id === preSelectedId);
          if (matched) {
            setSelectedService(matched);
            setStep(2); // Jump straight to date selection
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast('Failed to load services. Please refresh the page.', 'error');
      } finally {
        setLoadingServices(false);
      }
    };
    fetchData();
  }, [location.state, toast]);

  // Load slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    
    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        const res = await axios.get(`/api/appointments/available-slots?date=${selectedDate}`);
        setAvailableSlots(res.data.slots || []);
        setIsBlockedDay(res.data.isBlockedDay || false);
      } catch (err) {
        console.error('Error fetching slots:', err);
        toast('Failed to load available time slots.', 'error');
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, toast]);

  // Generate all grid boxes for the monthly calendar view
  const getDaysInMonthGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon, etc.
    
    // Last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastDayOfMonth.getDate();
    
    const days = [];
    
    // 1. Padding from previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 2. Actual days of the month
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
    // Prevent going to past months
    const today = new Date();
    if (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth()) {
      return;
    }
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedTimeSlot(''); // reset slot
    setStep(3);
  };

  const handleSelectSlot = (slotTime) => {
    setSelectedTimeSlot(slotTime);
    setStep(4);
  };

  const handleConfirmBooking = async () => {
    try {
      setSubmitting(true);
      await axios.post('/api/appointments', {
        serviceId: selectedService._id,
        date: selectedDate,
        timeSlot: selectedTimeSlot
      });
      toast(`Appointment booked successfully! Confirmation sent to your email.`, 'success');
      navigate('/my-appointments');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Booking failed. Please try again.';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['All', 'Hair', 'Skin', 'Beard', 'Massage'];
  const filteredServices = activeCategory === 'All'
    ? services
    : services.filter(s => s.category === activeCategory);

  const monthYearLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Disable "Previous Month" button if viewing current month
  const isPrevMonthDisabled = () => {
    const today = new Date();
    return currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide">Book Your Session</h1>
        <p className="text-zinc-400 text-sm font-light">Four steps to absolute relaxation & premium styling</p>
      </div>

      {/* Progress Wizard Breadcrumbs */}
      <div className="flex items-center justify-between border-y border-zinc-800/80 py-4 px-4 bg-zinc-950/20 rounded-xl max-w-2xl mx-auto">
        <button
          onClick={() => selectedService && setStep(1)}
          className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold transition ${
            step === 1 ? 'text-gold' : selectedService ? 'text-zinc-300 hover:text-gold' : 'text-zinc-650 cursor-not-allowed'
          }`}
        >
          <Scissors size={14} /> Service
        </button>
        <ChevronRight size={14} className="text-zinc-600" />
        
        <button
          onClick={() => selectedDate && setStep(2)}
          className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold transition ${
            step === 2 ? 'text-gold' : selectedDate ? 'text-zinc-300 hover:text-gold' : 'text-zinc-650 cursor-not-allowed'
          }`}
        >
          <Calendar size={14} /> Date
        </button>
        <ChevronRight size={14} className="text-zinc-600" />
        
        <button
          onClick={() => selectedTimeSlot && setStep(3)}
          className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold transition ${
            step === 3 ? 'text-gold' : selectedTimeSlot ? 'text-zinc-300 hover:text-gold' : 'text-zinc-650 cursor-not-allowed'
          }`}
        >
          <Clock size={14} /> Slot
        </button>
        <ChevronRight size={14} className="text-zinc-600" />
        
        <span className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold ${step === 4 ? 'text-gold' : 'text-zinc-600'}`}>
          <CheckCircle2 size={14} /> Confirm
        </span>
      </div>

      {/* STEP 1: SERVICE SELECTION */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-xl font-bold text-white tracking-wide">Step 1: Select Ritual Service</h2>
            <div className="flex gap-2 bg-zinc-950/45 p-1 rounded-full border border-zinc-900">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition ${
                    activeCategory === cat
                      ? 'bg-gold text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loadingServices ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map(service => (
                <div
                  key={service._id}
                  onClick={() => handleSelectService(service)}
                  className={`glass-panel p-6 rounded-xl border transition-all cursor-pointer flex justify-between items-center group ${
                    selectedService?._id === service._id
                      ? 'border-gold shadow-gold-glow bg-zinc-950/20'
                      : 'border-zinc-850 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2">
                    <span className="text-[10px] text-gold uppercase font-bold tracking-widest">{service.category}</span>
                    <h3 className="text-lg font-bold text-white group-hover:text-gold transition">{service.name}</h3>
                    <p className="text-zinc-400 text-xs font-light line-clamp-1">{service.description || 'Premium grooming experience.'}</p>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 pt-1 font-semibold">
                      <span>{service.duration} mins</span>
                      <span>&bull;</span>
                      <span className="text-gold font-bold">₹{service.price}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-zinc-650 group-hover:text-gold transition group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: FULL MONTH CALENDAR DATE SELECTION */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white tracking-wide">Step 2: Choose Date</h2>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-gold transition"
            >
              <ChevronLeft size={16} /> Back to Services
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-zinc-850 p-6 space-y-6">
            {/* Calendar Month Selector Header */}
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <button
                type="button"
                disabled={isPrevMonthDisabled()}
                onClick={handlePrevMonth}
                className="p-2 bg-zinc-900/60 border border-zinc-800 text-zinc-450 hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={18} />
              </button>
              
              <span className="text-base font-serif font-bold text-white tracking-wider uppercase">
                {monthYearLabel}
              </span>
              
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 bg-zinc-900/60 border border-zinc-800 text-zinc-450 hover:text-white rounded-lg transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Grid for days of the week */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest pb-2">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonthGrid().map((day, idx) => {
                // Return empty box for placeholders
                if (day === null) {
                  return <div key={`empty-${idx}`} className="aspect-square"></div>;
                }

                const isDisabled = day.isPast || day.isBlocked;
                const isSelected = selectedDate === day.dateStr;

                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDate(day.dateStr)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold border transition-all ${
                      isDisabled
                        ? 'bg-zinc-950/20 border-zinc-900/30 text-zinc-700 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-gold-gradient text-black border-transparent shadow-gold-glow font-bold scale-[1.05]'
                        : 'bg-zinc-900/40 border-zinc-850 text-gray-300 hover:border-gold/30 hover:text-gold hover:scale-[1.03]'
                    }`}
                  >
                    <span>{day.dayNum}</span>
                    {day.isBlocked && (
                      <span className="text-[7px] text-red-500 font-bold uppercase tracking-tight block scale-[0.9] -mt-0.5">
                        Closed
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex justify-center gap-6 text-[10px] text-zinc-500 uppercase tracking-wider pt-2 border-t border-zinc-900">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-zinc-900/40 border border-zinc-850 rounded"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-zinc-950/20 border border-zinc-900/30 rounded line-through"></span> Unavailable</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-gold rounded"></span> Selected</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: TIME SLOT SELECTION */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-wide">
              Step 3: Select Time Slot <span className="text-xs font-normal text-zinc-500">for {selectedDate}</span>
            </h2>
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-gold transition"
            >
              <ChevronLeft size={16} /> Back to Calendar
            </button>
          </div>

          {loadingSlots ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
            </div>
          ) : isBlockedDay ? (
            <div className="text-center py-12 glass-panel border-red-900/20 rounded-xl">
              <p className="text-red-400 font-bold text-sm">The salon is closed on this date. Please select another date.</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p>No available timeslots found for this day.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.isAvailable}
                  onClick={() => handleSelectSlot(slot.time)}
                  className={`py-3.5 rounded-xl border text-center font-bold text-xs uppercase tracking-wider transition ${
                    !slot.isAvailable
                      ? 'bg-zinc-950/20 border-zinc-900 text-zinc-650 cursor-not-allowed line-through'
                      : selectedTimeSlot === slot.time
                      ? 'bg-gold-gradient text-black border-transparent shadow-gold-glow'
                      : 'bg-zinc-900/40 border-zinc-850 text-gray-300 hover:border-gold/30 hover:text-white'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 4: SUMMARY & CONFIRMATION */}
      {step === 4 && (
        <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white tracking-wide">Step 4: Verify Booking</h2>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-gold transition"
            >
              <ChevronLeft size={16} /> Back to Slots
            </button>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-zinc-805 space-y-6 shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-gold py-1">
              <Sparkles size={16} />
              <h3 className="font-serif font-bold text-lg tracking-wider uppercase">Luxury Summary</h3>
              <Sparkles size={16} />
            </div>

            <div className="border-t border-zinc-900/60 pt-4 space-y-4 text-sm font-light">
              <div className="flex justify-between">
                <span className="text-zinc-500">Guest Name:</span>
                <span className="text-white font-semibold">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Email Address:</span>
                <span className="text-white font-semibold">{user?.email}</span>
              </div>
              
              <div className="border-t border-zinc-900/60 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ritual Service:</span>
                  <span className="text-gold font-bold">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Category:</span>
                  <span className="text-white font-semibold">{selectedService?.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Duration:</span>
                  <span className="text-white font-semibold">{selectedService?.duration} minutes</span>
                </div>
              </div>

              <div className="border-t border-zinc-900/60 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Selected Date:</span>
                  <span className="text-white font-bold">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Selected Slot:</span>
                  <span className="text-white font-bold">{selectedTimeSlot}</span>
                </div>
              </div>

              <div className="border-t border-zinc-900/60 pt-4 flex justify-between items-center">
                <span className="text-zinc-400 font-bold text-base">Total Investment:</span>
                <span className="text-2xl font-serif font-bold text-gold">₹{selectedService?.price}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={submitting}
              className="w-full py-3.5 bg-gold-gradient text-black font-extrabold text-sm rounded shadow-gold-glow hover:shadow-gold-glow-lg transition duration-200 uppercase tracking-widest disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                'Confirm Luxury Booking'
              )}
            </button>

            <p className="text-[10px] text-zinc-500 text-center leading-relaxed font-light">
              By confirming, you agree to show up 10 minutes prior to your booking. Cancellations can be made up to 1 hour beforehand.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
export default Booking;
