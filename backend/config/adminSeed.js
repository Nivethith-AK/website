import mongoose from 'mongoose';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Company from '../models/Company.js';

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
    let adminUser = await User.findOne({ email: DEFAULT_ADMIN_EMAIL }).select('+password');

    if (!adminUser) {
      adminUser = await Admin.create({
        name: 'Admin',
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        role: 'admin',
        isApproved: true,
        isVerified: true,
      });
      console.log('Default admin created: admin@gmail.com');
    } else if (adminUser.role !== 'admin') {
      console.warn('Admin seed skipped: admin@gmail.com exists with a non-admin role');
      return;
    } else {
      let shouldSaveAdmin = false;

      if (!adminUser.isApproved) {
        adminUser.isApproved = true;
        shouldSaveAdmin = true;
      }

      if (!adminUser.isVerified) {
        adminUser.isVerified = true;
        shouldSaveAdmin = true;
      }

      const passwordMatches = await adminUser.matchPassword(DEFAULT_ADMIN_PASSWORD);
      if (!passwordMatches) {
        adminUser.password = DEFAULT_ADMIN_PASSWORD;
        shouldSaveAdmin = true;
      }

      if (shouldSaveAdmin) {
        await adminUser.save();
        console.log('Default admin credentials synced for admin@gmail.com');
      }
    }

    let testUser = await User.findOne({ email: DEFAULT_TEST_EMAIL }).select('+password');

    if (!testUser) {
      testUser = await Company.create({
        name: 'Test User',
        email: DEFAULT_TEST_EMAIL,
        password: DEFAULT_TEST_PASSWORD,
        role: 'company',
        isApproved: true,
        isVerified: true,
        companyName: 'Test Fashion House',
        industry: 'Fashion',
        contactPerson: 'Test User',
        phone: 'N/A',
        address: 'N/A',
      });
      console.log('Default test user created: test@gmail.com');
    } else {
      let shouldSaveTest = false;

      if (!testUser.isApproved) {
        testUser.isApproved = true;
        shouldSaveTest = true;
      }

      if (!testUser.isVerified) {
        testUser.isVerified = true;
        shouldSaveTest = true;
      }

      const testPasswordMatches = await testUser.matchPassword(DEFAULT_TEST_PASSWORD);
      if (!testPasswordMatches) {
        testUser.password = DEFAULT_TEST_PASSWORD;
        shouldSaveTest = true;
      }

      if (shouldSaveTest) {
        await testUser.save();
        console.log('Default test user credentials synced for test@gmail.com');
      }
    }
  } catch (error) {
    console.warn(`Admin seed warning: ${error.message}`);
  }
};
