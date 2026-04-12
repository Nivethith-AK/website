import mongoose from 'mongoose';

const agencyRequestSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectDescription: {
      type: String,
      required: [true, 'Project description is required'],
    },
    designersNeeded: {
      type: Number,
      required: [true, 'Designers needed is required'],
      min: 1,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    budget: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const AgencyRequest = mongoose.model('AgencyRequest', agencyRequestSchema);

export default AgencyRequest;
