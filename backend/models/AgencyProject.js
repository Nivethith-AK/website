import mongoose from 'mongoose';

const agencyProjectSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgencyRequest',
      required: true,
    },
    assignedDesigners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'active', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const AgencyProject = mongoose.model('AgencyProject', agencyProjectSchema);

export default AgencyProject;
