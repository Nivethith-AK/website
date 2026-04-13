import mongoose from 'mongoose';

const jobVacancySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
      default: 'Contract',
    },
    compensation: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Closed'],
      default: 'Draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const JobVacancy = mongoose.model('JobVacancy', jobVacancySchema);

export default JobVacancy;
