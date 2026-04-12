import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    clientRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientRequest',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    designers: [
      {
        designer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['Assigned', 'Accepted', 'Rejected', 'Completed'],
          default: 'Assigned',
        },
        assignedDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    projectTitle: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    startDate: Date,
    endDate: Date,
    budget: Number,
    adminNotes: String,
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

const Project = mongoose.model('Project', projectSchema);

export default Project;
