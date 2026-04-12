import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Designer from '../models/Designer.js';
import Company from '../models/Company.js';
import DesignerProfile from '../models/DesignerProfile.js';

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

export const register = async (req, res) => {
  try {
    const { name, email, password, role, skills = [], experienceLevel = 'Any', portfolioImages = [], availability = 'Available' } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'name, email, password and role are required',
      });
    }

    if (!['admin', 'designer', 'company'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    let user;
    if (role === 'designer') {
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(' ') || firstName;
      user = await Designer.create({
        name,
        firstName,
        lastName,
        email,
        password,
        role,
        isApproved: false,
        experienceLevel,
      });
    } else if (role === 'company') {
      user = await Company.create({
        name,
        email,
        password,
        role,
        isApproved: true,
        companyName: name,
        industry: 'Fashion',
        contactPerson: name,
        phone: 'N/A',
        address: 'N/A',
      });
    } else {
      user = await User.create({
        name,
        email,
        password,
        role,
        isApproved: true,
      });
    }

    if (role === 'designer') {
      await DesignerProfile.create({
        userId: user._id,
        skills,
        experienceLevel,
        portfolioImages,
        availability,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Registered successfully',
      token: signToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    return res.status(200).json({
      success: true,
      token: signToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
