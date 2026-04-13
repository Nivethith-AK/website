import ClientRequest from '../models/ClientRequest.js';
import Company from '../models/Company.js';

export const createClientRequest = async (req, res) => {
  try {
    const { projectTitle, description, requiredDesigners, duration, budget, requiredSkills, preferredExperience, isPublic } = req.body;

    const request = await ClientRequest.create({
      company: req.user.id,
      projectTitle,
      description,
      requiredDesigners,
      duration,
      budget,
      requiredSkills,
      preferredExperience,
      isPublic: Boolean(isPublic),
      status: 'New',
    });

    // Add request to company's submissions
    await Company.findByIdAndUpdate(
      req.user.id,
      { $push: { submissions: request._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCompanyRequests = async (req, res) => {
  try {
    const requests = await ClientRequest.find({ company: req.user.id })
      .populate('assignedDesigners', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateClientRequest = async (req, res) => {
  try {
    const { projectTitle, description, requiredDesigners, duration, budget, requiredSkills, preferredExperience } = req.body;

    const request = await ClientRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Check if company owns this request
    if (request.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request',
      });
    }

    // Can only update if status is New
    if (request.status !== 'New') {
      return res.status(400).json({
        success: false,
        message: 'Can only update requests with New status',
      });
    }

    const updatedRequest = await ClientRequest.findByIdAndUpdate(
      req.params.id,
      {
        projectTitle,
        description,
        requiredDesigners,
        duration,
        budget,
        requiredSkills,
        preferredExperience,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Request updated successfully',
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteClientRequest = async (req, res) => {
  try {
    const request = await ClientRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Check if company owns this request
    if (request.company.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request',
      });
    }

    // Can only delete if status is New
    if (request.status !== 'New') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete requests with New status',
      });
    }

    await ClientRequest.findByIdAndDelete(req.params.id);

    // Remove request from company's submissions
    await Company.findByIdAndUpdate(
      req.user.id,
      { $pull: { submissions: req.params.id } }
    );

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.user.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCompanyProfile = async (req, res) => {
  try {
    const { companyName, industry, contactPerson, phone, website, address, description } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.user.id,
      {
        companyName,
        industry,
        contactPerson,
        phone,
        website,
        address,
        description,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company profile updated successfully',
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
