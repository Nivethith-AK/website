import Designer from '../models/Designer.js';
import Company from '../models/Company.js';
import ClientRequest from '../models/ClientRequest.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalDesigners = await Designer.countDocuments({ isApproved: true });
    const pendingDesigners = await Designer.countDocuments({ isApproved: false });
    const totalCompanies = await Company.countDocuments();
    const totalRequests = await ClientRequest.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'Active' });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });

    res.status(200).json({
      success: true,
      data: {
        totalDesigners,
        pendingDesigners,
        totalCompanies,
        totalRequests,
        activeProjects,
        completedProjects,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPendingDesigners = async (req, res) => {
  try {
    const designers = await Designer.find({ isApproved: false });

    res.status(200).json({
      success: true,
      data: designers,
      count: designers.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approveDesigner = async (req, res) => {
  try {
    const designer = await Designer.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Designer approved successfully',
      data: designer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectDesigner = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const designer = await Designer.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        rejectionReason,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Designer rejected',
      data: designer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const requests = await ClientRequest.find(filter)
      .populate('company', 'companyName contactPerson email phone')
      .populate('assignedDesigners', 'firstName lastName email')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await ClientRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: requests,
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

export const approveRequest = async (req, res) => {
  try {
    const request = await ClientRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Request approved successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const request = await ClientRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        rejectionReason,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Request rejected',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const assignDesignersToProject = async (req, res) => {
  try {
    const { requestId, designerIds } = req.body;

    const request = await ClientRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Create project
    const project = await Project.create({
      clientRequest: requestId,
      company: request.company,
      projectTitle: request.projectTitle,
      description: request.description,
      budget: request.budget,
      designers: designerIds.map(id => ({
        designer: id,
        status: 'Assigned',
      })),
      status: 'Active',
    });

    // Update request status
    await ClientRequest.findByIdAndUpdate(
      requestId,
      {
        status: 'In Progress',
        assignedDesigners: designerIds,
        updatedAt: Date.now(),
      }
    );

    // Update designers
    await Designer.updateMany(
      { _id: { $in: designerIds } },
      { $push: { assignedProjects: project._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Designers assigned to project successfully',
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        status,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // If project is completed, move designers to completed projects
    if (status === 'Completed') {
      await Designer.updateMany(
        { assignedProjects: project._id },
        {
          $pull: { assignedProjects: project._id },
          $push: { completedProjects: project._id },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Project status updated successfully',
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const projects = await Project.find(filter)
      .populate('company', 'companyName email phone')
      .populate('designers.designer', 'firstName lastName email')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: projects,
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

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select('-password');

    res.status(200).json({
      success: true,
      data: companies,
      count: companies.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
