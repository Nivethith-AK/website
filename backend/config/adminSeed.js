import mongoose from 'mongoose';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Company from '../models/Company.js';

const DEFAULT_ADMIN_EMAIL = 'test@gmail.com';
const DEFAULT_ADMIN_PASSWORD = '123456';
const LEGACY_ADMIN_EMAIL = 'admin@gmail.com';
const DEFAULT_COMPANY_EMAIL = 'testing@gmail.com';
const DEFAULT_COMPANY_PASSWORD = '123456';

export const ensureAdminUser = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('Admin seed skipped: database not connected');
    return;
  }

  try {
    if (LEGACY_ADMIN_EMAIL !== DEFAULT_ADMIN_EMAIL) {
      await User.deleteMany({ email: LEGACY_ADMIN_EMAIL });
    }

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

    let companyUser = await User.findOne({ email: DEFAULT_COMPANY_EMAIL }).select('+password');

    if (!companyUser) {
      companyUser = await Company.create({
        name: 'Testing Company',
        email: DEFAULT_COMPANY_EMAIL,
        password: DEFAULT_COMPANY_PASSWORD,
        role: 'company',
        isApproved: true,
        isVerified: true,
        companyName: 'Testing Company',
        industry: 'Fashion',
        contactPerson: 'Testing Admin',
        phone: 'N/A',
        address: 'N/A',
      });

      console.log('Default testing company created: testing@gmail.com');
    } else if (companyUser.role !== 'company') {
      await User.deleteOne({ _id: companyUser._id });

      companyUser = await Company.create({
        name: 'Testing Company',
        email: DEFAULT_COMPANY_EMAIL,
        password: DEFAULT_COMPANY_PASSWORD,
        role: 'company',
        isApproved: true,
        isVerified: true,
        companyName: 'Testing Company',
        industry: 'Fashion',
        contactPerson: 'Testing Admin',
        phone: 'N/A',
        address: 'N/A',
      });

      console.log('Existing testing@gmail.com account replaced with company account');
    } else {
      let shouldSaveCompany = false;

      if (!companyUser.isApproved) {
        companyUser.isApproved = true;
        shouldSaveCompany = true;
      }

      if (!companyUser.isVerified) {
        companyUser.isVerified = true;
        shouldSaveCompany = true;
      }

      const companyPasswordMatches = await companyUser.matchPassword(DEFAULT_COMPANY_PASSWORD);
      if (!companyPasswordMatches) {
        companyUser.password = DEFAULT_COMPANY_PASSWORD;
        shouldSaveCompany = true;
      }

      if (shouldSaveCompany) {
        await companyUser.save();
        console.log('Default testing company credentials synced for testing@gmail.com');
      }
    }
  } catch (error) {
    console.warn(`Admin seed warning: ${error.message}`);
  }
};
