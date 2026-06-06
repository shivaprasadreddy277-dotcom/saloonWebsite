import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    // Salon Operational Hours
    workingHours: {
      start: {
        type: String,
        default: '09:00', // HH:MM
      },
      end: {
        type: String,
        default: '19:00', // HH:MM
      },
      slotInterval: {
        type: Number,
        default: 30, // in minutes
      },
    },
    // Blocked dates (Holidays / Days off)
    blockedDates: {
      type: [String], // Array of 'YYYY-MM-DD'
      default: [],
    },
    // Walk-in wait time banner config
    walkInWaitTime: {
      type: Number,
      default: 15, // in minutes
    },
    showWaitTimeBanner: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
