import mongoose from 'mongoose';
import User from '../models/User.js';

const DEFAULT_ADMIN_EMAIL = 'admin@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'admin';

export const ensureAdminUser = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('Admin seed skipped: database not connected');
    return;
  }

  try {
    const existing = await User.findOne({ email: DEFAULT_ADMIN_EMAIL }).select('+password');

    if (!existing) {
      await User.create({
        name: 'Admin',
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        role: 'admin',
        isApproved: true,
      });
      console.log('Default admin created: admin@gmail.com');
      return;
    }

    if (existing.role !== 'admin') {
      console.warn('Admin seed skipped: admin@gmail.com exists with a non-admin role');
      return;
    }

    const passwordMatches = await existing.matchPassword(DEFAULT_ADMIN_PASSWORD);
    if (!passwordMatches) {
      existing.password = DEFAULT_ADMIN_PASSWORD;
      await existing.save();
      console.log('Default admin password synced for admin@gmail.com');
    }
  } catch (error) {
    console.warn(`Admin seed warning: ${error.message}`);
  }
};
