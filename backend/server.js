import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import connectDB from './config/db.js';

// Import Routes
import User from './models/User.js';
import Appointment from './models/Appointment.js';
import { sendReminderEmail } from './services/emailService.js';

// Route Handlers
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

// Load Env
dotenv.config();

// Connect Database & Seed
import { seedDatabase } from './utils/seed.js';
await connectDB();
await seedDatabase(false);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LuxeCut & Spa API is operational' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Setup 1-Hour Reminder Cron Job
// Check every 10 minutes for appointments starting in the next 1 hour
cron.schedule('*/10 * * * *', async () => {
  console.log('⏰ Running scheduled task: Checking for upcoming appointment reminders (1 hour before)...');
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Fetch confirmed appointments for today that haven't received a reminder
    const upcomingAppointments = await Appointment.find({
      date: todayStr,
      status: 'Confirmed',
      reminderSent: false,
    }).populate('customer').populate('service');

    const currentMins = now.getHours() * 60 + now.getMinutes();

    for (const appt of upcomingAppointments) {
      const [hours, minutes] = appt.timeSlot.split(':').map(Number);
      const apptMins = hours * 60 + minutes;
      
      const diffMins = apptMins - currentMins;

      // If appointment is starting within 60 minutes (and not already in the past)
      if (diffMins > 0 && diffMins <= 60) {
        console.log(`⏰ Sending 1-hour email reminder to ${appt.customer?.email} for slot ${appt.timeSlot}`);
        await sendReminderEmail(appt);
        appt.reminderSent = true;
        await appt.save();
      }
    }
  } catch (error) {
    console.error('❌ Error in reminder cron job:', error.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
