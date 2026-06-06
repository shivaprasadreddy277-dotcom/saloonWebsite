import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import { sendConfirmationEmail } from '../services/emailService.js';

// Helper: Convert time string 'HH:MM' to minutes since midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper: Convert minutes since midnight back to 'HH:MM'
const minutesToTime = (mins) => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// @desc    Get available slots for a date
// @route   GET /api/appointments/available-slots
// @access  Public
export const getAvailableSlots = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Please specify a date' });
  }

  try {
    const settings = await Settings.findOne() || {
      workingHours: { start: '09:00', end: '19:00', slotInterval: 30 },
      blockedDates: []
    };

    // 1. Check if date is blocked (holiday)
    if (settings.blockedDates.includes(date)) {
      return res.json({ date, slots: [], isBlockedDay: true, message: 'Salon is closed on this day' });
    }

    // Generate slots
    const startMins = timeToMinutes(settings.workingHours.start);
    const endMins = timeToMinutes(settings.workingHours.end);
    const interval = settings.workingHours.slotInterval;

    const allSlots = [];
    for (let mins = startMins; mins < endMins; mins += interval) {
      allSlots.push(minutesToTime(mins));
    }

    // 2. Fetch existing active bookings for this date (Pending & Confirmed)
    const activeAppointments = await Appointment.find({
      date,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    const bookedSlots = activeAppointments.map(app => app.timeSlot);

    // 3. Filter out past slots if date is today
    const now = new Date();
    // Format current date in India timezone or local machine time YYYY-MM-DD
    const todayStr = now.toISOString().split('T')[0];
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const slotsData = allSlots.map(slot => {
      let isAvailable = true;
      let reason = '';

      // Check if slot is already booked
      if (bookedSlots.includes(slot)) {
        isAvailable = false;
        reason = 'Booked';
      }

      // Check if in the past for today
      if (date === todayStr && timeToMinutes(slot) <= currentMins) {
        isAvailable = false;
        reason = 'Past';
      }

      // Check if general past date
      if (date < todayStr) {
        isAvailable = false;
        reason = 'Past Date';
      }

      return {
        time: slot,
        isAvailable,
        reason
      };
    });

    res.json({
      date,
      slots: slotsData,
      isBlockedDay: false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  const { serviceId, date, timeSlot, adminOverride, customerId } = req.body;

  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Target customer is either the authenticated user, or if admin, they can specify a customerId
    let targetCustomerId = req.user._id;
    let isAdminOverride = false;

    if (req.user.role === 'admin') {
      if (customerId) {
        targetCustomerId = customerId;
      }
      if (adminOverride === true) {
        isAdminOverride = true;
      }
    }

    const customer = await User.findById(targetCustomerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check Business Rules (unless adminOverride is active)
    if (!isAdminOverride) {
      // 1. Booking only allowed for future dates/times
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentMins = now.getHours() * 60 + now.getMinutes();

      if (date < todayStr || (date === todayStr && timeToMinutes(timeSlot) <= currentMins)) {
        return res.status(400).json({ message: 'Cannot book appointments in the past' });
      }

      // 2. No double booking on same time slot
      const existingSlotBooking = await Appointment.findOne({
        date,
        timeSlot,
        status: { $in: ['Pending', 'Confirmed'] }
      });

      if (existingSlotBooking) {
        return res.status(400).json({ message: 'This time slot is already booked' });
      }

      // 3. Customer cannot book more than 3 active appointments at once
      const activeBookingsCount = await Appointment.countDocuments({
        customer: targetCustomerId,
        status: { $in: ['Pending', 'Confirmed'] }
      });

      if (activeBookingsCount >= 3) {
        return res.status(400).json({
          message: 'You cannot have more than 3 active (Pending or Confirmed) appointments. Please complete, cancel, or reschedule your existing bookings first.'
        });
      }

      // 4. Verify settings (not a blocked date)
      const settings = await Settings.findOne();
      if (settings && settings.blockedDates.includes(date)) {
        return res.status(400).json({ message: 'The salon is closed on this date' });
      }
    }

    // Default status: customer bookings are 'Pending', admin bookings are 'Confirmed'
    const status = req.user.role === 'admin' ? 'Confirmed' : 'Pending';

    const appointment = await Appointment.create({
      customer: targetCustomerId,
      service: serviceId,
      date,
      timeSlot,
      status,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customer', 'name email phone')
      .populate('service', 'name price duration category');

    // Trigger email notification async (doesn't block response)
    sendConfirmationEmail(populatedAppointment).catch(err => console.error('Email send fail:', err.message));

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's appointments
// @route   GET /api/appointments/my
// @access  Private
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ customer: req.user._id })
      .populate('service', 'name price duration category')
      .sort({ date: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/appointments
// @access  Private/Admin
export const getAppointments = async (req, res) => {
  const { status, date } = req.query;

  try {
    const query = {};
    if (status) query.status = status;
    if (date) query.date = date;

    const appointments = await Appointment.find(query)
      .populate('customer', 'name email phone')
      .populate('service', 'name price duration category')
      .sort({ date: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status (Admin: Confirm / Complete / Cancel)
// @route   PUT /api/appointments/:id/status
// @access  Private/Admin
export const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;

  if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('service', 'name price duration category');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    // Send confirmation of update if confirmed or cancelled
    if (status === 'Confirmed' || status === 'Cancelled') {
      sendConfirmationEmail(appointment, `Your appointment status has been updated to: ${status}`).catch(err =>
        console.error('Update email fail:', err.message)
      );
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel appointment (Customer/Admin)
// @route   PUT /api/appointments/:id/cancel
// @access  Private
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('service', 'name price duration category');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify ownership
    if (req.user.role !== 'admin' && String(appointment.customer._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    sendConfirmationEmail(appointment, 'Your appointment has been successfully CANCELLED.').catch(err =>
      console.error('Cancel email fail:', err.message)
    );

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reschedule appointment (Customer/Admin)
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
export const rescheduleAppointment = async (req, res) => {
  const { date, timeSlot, adminOverride } = req.body;

  if (!date || !timeSlot) {
    return res.status(400).json({ message: 'Please specify new date and time slot' });
  }

  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('service', 'name price duration category');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify ownership
    if (req.user.role !== 'admin' && String(appointment.customer._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to reschedule this appointment' });
    }

    let isAdminOverride = req.user.role === 'admin' && adminOverride === true;

    // Check Business Rules
    if (!isAdminOverride) {
      // 1. Future date check
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentMins = now.getHours() * 60 + now.getMinutes();

      if (date < todayStr || (date === todayStr && timeToMinutes(timeSlot) <= currentMins)) {
        return res.status(400).json({ message: 'Cannot reschedule to a past date/time' });
      }

      // 2. No double booking
      const existingSlotBooking = await Appointment.findOne({
        _id: { $ne: appointment._id }, // exclude current appointment
        date,
        timeSlot,
        status: { $in: ['Pending', 'Confirmed'] }
      });

      if (existingSlotBooking) {
        return res.status(400).json({ message: 'The new time slot is already booked' });
      }

      // 3. Blocked date check
      const settings = await Settings.findOne();
      if (settings && settings.blockedDates.includes(date)) {
        return res.status(400).json({ message: 'The salon is closed on the selected date' });
      }
    }

    appointment.date = date;
    appointment.timeSlot = timeSlot;
    // Customer rescheduling resets status to Pending for review, Admin rescheduling keeps it Confirmed
    appointment.status = req.user.role === 'admin' ? 'Confirmed' : 'Pending';
    appointment.reminderSent = false; // reset reminder tracker for new date

    await appointment.save();

    sendConfirmationEmail(appointment, `Your appointment has been rescheduled to ${date} at ${timeSlot}.`).catch(err =>
      console.error('Reschedule email fail:', err.message)
    );

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats (Admin)
// @route   GET /api/appointments/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Counts by status
    const pendingCount = await Appointment.countDocuments({ status: 'Pending' });
    const confirmedCount = await Appointment.countDocuments({ status: 'Confirmed' });
    const cancelledCount = await Appointment.countDocuments({ status: 'Cancelled' });
    const completedCount = await Appointment.countDocuments({ status: 'Completed' });
    
    const totalBookings = await Appointment.countDocuments({});

    // Today's appointments count
    const todayAppointmentsCount = await Appointment.countDocuments({ date: today });

    // Revenue calculation (only completed appointments)
    const completedAppointments = await Appointment.find({ status: 'Completed' }).populate('service');
    const revenueSum = completedAppointments.reduce((sum, app) => {
      return sum + (app.service ? app.service.price : 0);
    }, 0);

    // Analytics: Bookings per day this week (last 7 days starting from 6 days ago to today)
    const weeklyAnalytics = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = await Appointment.countDocuments({ date: dateStr });
      
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyAnalytics.push({
        date: dateStr,
        day: dayName,
        bookings: count
      });
    }

    res.json({
      todayAppointmentsCount,
      totalBookings,
      revenueSummary: revenueSum,
      counts: {
        pending: pendingCount,
        confirmed: confirmedCount,
        cancelled: cancelledCount,
        completed: completedCount
      },
      weeklyAnalytics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
