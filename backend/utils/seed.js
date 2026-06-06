import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

dotenv.config();

const defaultServices = [
  {
    name: 'Haircut',
    description: 'Classic or modern scissor or clipper cut tailored to your face shape.',
    price: 150,
    duration: 30,
    category: 'Hair',
  },
  {
    name: 'Hair Coloring',
    description: 'Full hair color or highlights using premium, ammonia-free organic dyes.',
    price: 800,
    duration: 90,
    category: 'Hair',
  },
  {
    name: 'Beard Trim',
    description: 'Precision beard shaping and trimming followed by hot towel and beard oil treatment.',
    price: 80,
    duration: 20,
    category: 'Beard',
  },
  {
    name: 'Facial',
    description: 'Deep cleansing, exfoliating, and hydrating facial to refresh your skin.',
    price: 400,
    duration: 60,
    category: 'Skin',
  },
  {
    name: 'Head Massage',
    description: 'Relaxing Ayurvedic head massage using warm herbal oils to relieve stress.',
    price: 200,
    duration: 30,
    category: 'Massage',
  },
  {
    name: 'Hair Wash & Blow Dry',
    description: 'Invigorating hair wash followed by a salon-style blow dry and styling.',
    price: 250,
    duration: 45,
    category: 'Hair',
  },
];

export const seedDatabase = async (shouldExit = true) => {
  try {
    // 1. Seed Services (only if database has no services)
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(defaultServices);
      console.log('🌱 Seeded default services.');
    } else {
      console.log('Service collection already has data. Skipping service seed.');
    }

    // 2. Seed Admin User (only if it does not exist)
    const adminEmail = 'admin@luxecut.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: 'Salon Owner',
        email: adminEmail,
        password: 'adminpassword', // Will be hashed by userSchema pre-save hook
        phone: '+919999988888',
        role: 'admin',
      });
      console.log('🌱 Seeded default admin user: admin@luxecut.com / adminpassword');
    } else {
      console.log('Admin user already exists. Skipping user seed.');
    }

    // 3. Seed Default Settings (only if it does not exist)
    const settingsExists = await Settings.findOne();
    if (!settingsExists) {
      await Settings.create({
        workingHours: {
          start: '09:00',
          end: '19:00',
          slotInterval: 30
        },
        blockedDates: [],
        walkInWaitTime: 15,
        showWaitTimeBanner: true
      });
      console.log('🌱 Seeded default settings.');
    } else {
      console.log('Settings already exist. Skipping settings seed.');
    }

    console.log('Database Seeding Check Completed successfully.');
    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
    if (shouldExit) {
      process.exit(1);
    }
  }
};

// Check if run directly
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('seed.js') || process.argv[1].endsWith('seed'));
if (isDirectRun) {
  const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/luxecut_salon';
  mongoose.connect(connUri).then(() => {
    console.log('Seed: Connected to MongoDB.');
    seedDatabase(true);
  });
}
