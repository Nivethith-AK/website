import mongoose from 'mongoose';

const designerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: ['Student', 'Intern', 'Professional', 'Any'],
      default: 'Any',
    },
    portfolioImages: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      enum: ['Available', 'Busy'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

const DesignerProfile = mongoose.model('DesignerProfile', designerProfileSchema);

export default DesignerProfile;
