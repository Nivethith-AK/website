import mongoose from 'mongoose';

const clientRequestSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      maxlength: 2000,
    },
    requiredDesigners: {
      type: Number,
      required: [true, 'Number of designers required is required'],
      min: 1,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      enum: ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months', '1 year', 'Custom'],
    },
    budget: {
      type: Number,
      default: null,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    preferredExperience: {
      type: String,
      enum: ['Student', 'Intern', 'Professional', 'Any'],
      default: 'Any',
    },
    status: {
      type: String,
      enum: ['New', 'Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'],
      default: 'New',
    },
    assignedDesigners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    rejectionReason: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ClientRequest = mongoose.model('ClientRequest', clientRequestSchema);

export default ClientRequest;
