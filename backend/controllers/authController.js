import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Designer from '../models/Designer.js';
import Company from '../models/Company.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
    },
  });
};

const maybeHandleDevTestLogin = (email, password, res) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const testEmail = process.env.DEV_TEST_EMAIL || 'test@gmail.com';
  const testPassword = process.env.DEV_TEST_PASSWORD || '123456';

  if (!isDev) return false;
  if (email !== testEmail || password !== testPassword) return false;

  sendTokenResponse(
    {
      _id: '000000000000000000000001',
      name: 'Test User',
      email: testEmail,
      role: 'company',
      isApproved: true,
      createdAt: new Date(),
    },
    200,
    res
  );

  return true;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'name, email, password and role are required',
      });
    }

    if (!['admin', 'designer', 'company'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed: admin, designer, company',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database unavailable. Cannot register right now.',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    let user;

    if (role === 'designer') {
      const tokens = name.trim().split(/\s+/);
      const firstName = tokens[0] || name;
      const lastName = tokens.slice(1).join(' ') || firstName;

      user = await Designer.create({
        name,
        email,
        password,
        role: 'designer',
        isApproved: false,
        firstName,
        lastName,
        experienceLevel: req.body.experienceLevel || 'Student',
      });
    } else if (role === 'company') {
      user = await Company.create({
        name,
        email,
        password,
        role: 'company',
        isApproved: true,
        companyName: req.body.companyName || name,
        industry: req.body.industry || 'Fashion',
        contactPerson: req.body.contactPerson || name,
        phone: req.body.phone || 'N/A',
        address: req.body.address || 'N/A',
      });
    } else {
      user = await User.create({
        name,
        email,
        password,
        role: 'admin',
        isApproved: true,
      });
    }

    return sendTokenResponse(user, 201, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const registerDesigner = async (req, res) => {
  try {
    const { email, password, firstName, lastName, experienceLevel } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database unavailable. Cannot register right now.',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Create designer
    const designer = await Designer.create({
      name: `${firstName} ${lastName}`.trim(),
      email,
      password,
      firstName,
      lastName,
      experienceLevel,
      role: 'designer',
    });

    sendTokenResponse(designer, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const registerCompany = async (req, res) => {
  try {
    const { email, password, companyName, industry, contactPerson, phone, address } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database unavailable. Cannot register right now.',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Create company
    const company = await Company.create({
      name: companyName,
      email,
      password,
      companyName,
      industry,
      contactPerson,
      phone,
      address,
      role: 'company',
    });

    sendTokenResponse(company, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    if (maybeHandleDevTestLogin(email, password, res)) {
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database unavailable. Try test@gmail.com in local development.',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = loginUser;

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
