import JobVacancy from '../models/JobVacancy.js';

export const getPublishedJobs = async (req, res) => {
  try {
    const jobs = await JobVacancy.find({ status: 'Published' }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: jobs,
      count: jobs.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const jobs = await JobVacancy.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: jobs,
      count: jobs.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createJob = async (req, res) => {
  try {
    const { title, description, location, employmentType, compensation, skills, status = 'Draft' } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'title and description are required',
      });
    }

    const job = await JobVacancy.create({
      title,
      description,
      location,
      employmentType,
      compensation,
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [],
      status,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (typeof payload.skills === 'string') {
      payload.skills = payload.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    const job = await JobVacancy.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobVacancy.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
