import mongoose from 'mongoose';
import User from './User.js';

const designerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
  },
  profileImage: {
    type: String,
    default: null,
  },
  skills: {
    type: [String],
    enum: [
      'Fashion Design',
      'Textile Design',
      'Digital Design',
      'Pattern Making',
      'Garment Construction',
      'CAD',
      'Illustration',
      'Color Theory',
    ],
    default: [],
  },
  experienceLevel: {
    type: String,
    enum: ['Student', 'Intern', 'Professional'],
    required: true,
  },
  portfolio: [
    {
      image: String,
      title: String,
      description: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  bio: {
    type: String,
    maxlength: 500,
  },
  availability: {
    type: String,
    enum: ['Available', 'Busy'],
    default: 'Available',
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  rejectionReason: String,
  socialLinks: {
    instagram: String,
    behance: String,
    portfolio: String,
  },
  assignedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  completedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Designer = User.discriminator('designer', designerSchema);

export default Designer;
