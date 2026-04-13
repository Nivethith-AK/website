import Designer from '../models/Designer.js';
import Company from '../models/Company.js';
import ClientRequest from '../models/ClientRequest.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { sendApprovalStatusEmail, sendRequestStatusEmail } from '../utils/email.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalDesigners = await Designer.countDocuments({ isApproved: true });
    const pendingDesigners = await Designer.countDocuments({ isApproved: false });
    const pendingCompanies = await Company.countDocuments({ isApproved: false, isVerified: true });
    const totalCompanies = await Company.countDocuments();
    const totalRequests = await ClientRequest.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'Active' });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });

    res.status(200).json({
      success: true,
      data: {
        totalDesigners,
        pendingDesigners,
        pendingCompanies,
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
    const designers = await Designer.find({ isApproved: false, isVerified: true });

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
        rejectionReason: '',
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

    await sendApprovalStatusEmail({
      to: designer.email,
      name: designer.name,
      approved: true,
      role: 'designer',
    });

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

    await sendApprovalStatusEmail({
      to: designer.email,
      name: designer.name,
      approved: false,
      role: 'designer',
      rejectionReason,
    });

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
    ).populate('company', 'companyName email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (request.company?.email) {
      await sendRequestStatusEmail({
        to: request.company.email,
        companyName: request.company.companyName,
        projectTitle: request.projectTitle,
        approved: true,
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
    ).populate('company', 'companyName email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (request.company?.email) {
      await sendRequestStatusEmail({
        to: request.company.email,
        companyName: request.company.companyName,
        projectTitle: request.projectTitle,
        approved: false,
        rejectionReason,
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
    const { status = 'all' } = req.query;
    const filter = {};

    if (status === 'pending') {
      filter.isApproved = false;
      filter.isVerified = true;
    } else if (status === 'approved') {
      filter.isApproved = true;
    } else if (status === 'unverified') {
      filter.isVerified = false;
    }

    const companies = await Company.find(filter).select('-password').sort({ createdAt: -1 });

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

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, approval = 'all' } = req.query;
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 20;
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};
    if (role) filter.role = role;
    if (approval === 'pending') {
      filter.isApproved = false;
      filter.isVerified = true;
      filter.role = 'company';
    } else if (approval === 'approved') {
      filter.isApproved = true;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .skip(skip);

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: users,
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

export const approveUser = async (req, res) => {
  try {
    const { userId, isApproved = true, rejectionReason = '' } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isApproved: Boolean(isApproved),
        rejectionReason: isApproved ? '' : rejectionReason,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await sendApprovalStatusEmail({
      to: user.email,
      name: user.name,
      approved: Boolean(isApproved),
      role: user.role,
      rejectionReason,
    });

    return res.status(200).json({
      success: true,
      message: `User ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    const user = await User.findByIdAndDelete(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
