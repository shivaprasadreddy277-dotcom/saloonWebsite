import express from 'express';
import {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment,
  getDashboardStats,
} from '../controllers/appointmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to fetch available time slots
router.get('/available-slots', getAvailableSlots);

// Logged-in customer/admin routes
router.route('/')
  .post(protect, createAppointment)
  .get(protect, admin, getAppointments);

router.get('/my', protect, getMyAppointments);

// Admin dashboard statistics
router.get('/stats', protect, admin, getDashboardStats);

// Status updates and actions
router.put('/:id/status', protect, admin, updateAppointmentStatus);
router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/reschedule', protect, rescheduleAppointment);

export default router;
