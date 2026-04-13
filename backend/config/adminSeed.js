import mongoose from 'mongoose';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

const DEFAULT_ADMIN_EMAIL = 'test@gmail.com';
const DEFAULT_ADMIN_PASSWORD = '123456';

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
      console.log('Default admin created: test@gmail.com');
    } else if (adminUser.role !== 'admin') {
      await User.deleteOne({ _id: adminUser._id });

      adminUser = await Admin.create({
        name: 'Admin',
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        role: 'admin',
        isApproved: true,
        isVerified: true,
      });

      console.log('Existing test@gmail.com account replaced with admin account');
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
        console.log('Default admin credentials synced for test@gmail.com');
      }
    }
  } catch (error) {
    console.warn(`Admin seed warning: ${error.message}`);
  }
};
