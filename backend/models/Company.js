import mongoose from 'mongoose';
import User from './User.js';

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  website: String,
  companyImage: String,
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  submissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientRequest',
    },
  ],
  portfolio: [
    {
      image: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: '',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  assignedDesigners: [
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

const Company = User.discriminator('company', companySchema);

export default Company;
