import Designer from '../models/Designer.js';
import ClientRequest from '../models/ClientRequest.js';

export const getDesignerProfile = async (req, res) => {
  try {
    const designer = await Designer.findById(req.user.id).populate({
      path: 'assignedProjects',
      populate: {
        path: 'company',
        select: 'companyName email'
      }
    });

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: designer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDesignerProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      skills,
      experienceLevel,
      bio,
      availability,
      socialLinks,
      experiences,
      fashionProjects,
    } = req.body;

    const designer = await Designer.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        skills,
        experienceLevel,
        bio,
        availability,
        socialLinks,
        experiences,
        fashionProjects,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: designer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const designer = await Designer.findByIdAndUpdate(
      req.user.id,
      {
        profileImage: `/uploads/${req.file.filename}`,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: designer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadPortfolioImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { title, description } = req.body;

    const designer = await Designer.findById(req.user.id);

    designer.portfolio.push({
      image: `/uploads/${req.file.filename}`,
      title,
      description,
    });

    await designer.save();

    res.status(200).json({
      success: true,
      message: 'Portfolio image uploaded successfully',
      data: designer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadCvFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CV file uploaded',
      });
    }

    const designer = await Designer.findByIdAndUpdate(
      req.user.id,
      {
        cvFile: `/uploads/${req.file.filename}`,
      },
      { new: true }
    );

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'CV uploaded successfully',
      data: designer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllDesigners = async (req, res) => {
  try {
    const { skills, experienceLevel, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    let filter = { isApproved: true };

    if (skills) {
      filter.skills = { $in: Array.isArray(skills) ? skills : [skills] };
    }

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    const designers = await Designer.find(filter)
      .limit(limit)
      .skip(skip)
      .select('-portfolio');

    const total = await Designer.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: designers,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDesignerById = async (req, res) => {
  try {
    const designer = await Designer.findById(req.params.id).populate('assignedProjects');

    if (!designer || !designer.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: designer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPublicCompanyOpportunities = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 12;
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {
      isPublic: true,
      status: { $in: ['New', 'Approved'] },
    };

    const opportunities = await ClientRequest.find(filter)
      .populate('company', 'companyName industry contactPerson email phone website description')
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .skip(skip);

    const total = await ClientRequest.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: opportunities,
      total,
      pages: Math.ceil(total / parsedLimit),
      currentPage: parsedPage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCompanyRequestsBoard = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 12;
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {
      isPublic: true,
      status: { $in: ['New', 'Approved'] },
    };

    const requests = await ClientRequest.find(filter)
      .populate('company', 'companyName industry contactPerson email phone website description portfolio')
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .skip(skip);

    const total = await ClientRequest.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: requests,
      total,
      pages: Math.ceil(total / parsedLimit),
      currentPage: parsedPage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
