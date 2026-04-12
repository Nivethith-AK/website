import mongoose from 'mongoose';
import User from '../models/User.js';
import '../models/Admin.js';

const DEFAULT_ADMIN_EMAIL = 'admin@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'admin';
const DEFAULT_TEST_EMAIL = 'test@gmail.com';
const DEFAULT_TEST_PASSWORD = '123456';

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
        isVerified: true,
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

    const existingTest = await User.findOne({ email: DEFAULT_TEST_EMAIL }).select('+password');

    if (!existingTest) {
      await User.create({
        name: 'Test User',
        email: DEFAULT_TEST_EMAIL,
        password: DEFAULT_TEST_PASSWORD,
        role: 'company',
        isApproved: true,
        isVerified: true,
      });
      console.log('Default test user created: test@gmail.com');
      return;
    }

    const testPasswordMatches = await existingTest.matchPassword(DEFAULT_TEST_PASSWORD);
    if (!testPasswordMatches) {
      existingTest.password = DEFAULT_TEST_PASSWORD;
      await existingTest.save();
      console.log('Default test user password synced for test@gmail.com');
    }
  } catch (error) {
    console.warn(`Admin seed warning: ${error.message}`);
  }
};
