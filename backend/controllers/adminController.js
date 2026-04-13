import Designer from '../models/Designer.js';
import Company from '../models/Company.js';
import ClientRequest from '../models/ClientRequest.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
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
    const { requestId, designerIds, companyId, projectTitle, description, budget, autoCreateChat = true } = req.body;

    let request = null;
    let resolvedCompanyId = companyId;
    let resolvedProjectTitle = projectTitle;
    let resolvedDescription = description;
    let resolvedBudget = budget;

    if (requestId) {
      request = await ClientRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Request not found',
        });
      }

      resolvedCompanyId = request.company;
      resolvedProjectTitle = request.projectTitle;
      resolvedDescription = request.description;
      resolvedBudget = request.budget;
    }

    if (!resolvedCompanyId || !resolvedProjectTitle) {
      return res.status(400).json({
        success: false,
        message: 'companyId and projectTitle are required',
      });
    }

    const companyExists = await Company.findById(resolvedCompanyId).select('_id');
    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const uniqueDesignerIds = [...new Set((designerIds || []).map((id) => id.toString()))];
    if (uniqueDesignerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one designer is required',
      });
    }

    // Create project
    const project = await Project.create({
      clientRequest: requestId || null,
      company: resolvedCompanyId,
      projectTitle: resolvedProjectTitle,
      description: resolvedDescription,
      budget: resolvedBudget,
      designers: uniqueDesignerIds.map(id => ({
        designer: id,
        status: 'Assigned',
      })),
      participants: [resolvedCompanyId, ...uniqueDesignerIds],
      chatEnabled: Boolean(autoCreateChat),
      createdBy: req.user.id,
      status: 'Active',
    });

    // Update request status
    if (requestId) {
      await ClientRequest.findByIdAndUpdate(
        requestId,
        {
          status: 'In Progress',
          assignedDesigners: uniqueDesignerIds,
          updatedAt: Date.now(),
        }
      );
    }

    // Update company projects
    await Company.findByIdAndUpdate(resolvedCompanyId, {
      $addToSet: { assignedDesigners: project._id },
    });

    // Update designers
    await Designer.updateMany(
      { _id: { $in: uniqueDesignerIds } },
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

export const updateProjectParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const { designerIds = [], companyId, chatEnabled } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const uniqueDesignerIds = [...new Set((designerIds || []).map((item) => item.toString()))];

    const resolvedCompanyId = companyId || project.company;
    project.company = resolvedCompanyId;
    project.designers = uniqueDesignerIds.map((designerId) => ({
      designer: designerId,
      status: 'Assigned',
      assignedDate: new Date(),
    }));

    project.participants = [resolvedCompanyId, ...uniqueDesignerIds];

    if (typeof chatEnabled === 'boolean') {
      project.chatEnabled = chatEnabled;
    }

    await project.save();

    await Designer.updateMany(
      { _id: { $in: uniqueDesignerIds } },
      { $addToSet: { assignedProjects: project._id } }
    );

    await Company.findByIdAndUpdate(resolvedCompanyId, {
      $addToSet: { assignedDesigners: project._id },
    });

    const populatedProject = await Project.findById(project._id)
      .populate('company', 'companyName email')
      .populate('designers.designer', 'firstName lastName email');

    return res.status(200).json({
      success: true,
      message: 'Project participants updated successfully',
      data: populatedProject,
    });
  } catch (error) {
    return res.status(500).json({
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
      .populate('company', 'companyName name email phone')
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

export const purgeUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found for this email',
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be purged with this action',
      });
    }

    await Message.deleteMany({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    });

    if (user.role === 'company') {
      await ClientRequest.deleteMany({ company: user._id });
      await Project.deleteMany({ company: user._id });
    }

    if (user.role === 'designer') {
      await ClientRequest.updateMany(
        { assignedDesigners: user._id },
        { $pull: { assignedDesigners: user._id } }
      );

      await Project.updateMany(
        { 'designers.designer': user._id },
        { $pull: { designers: { designer: user._id } } }
      );
    }

    await User.deleteOne({ _id: user._id });

    return res.status(200).json({
      success: true,
      message: `User ${normalizedEmail} purged successfully`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserOverview = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let requests = [];
    let projects = [];

    if (user.role === 'company') {
      requests = await ClientRequest.find({ company: userId })
        .populate('assignedDesigners', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(50);

      projects = await Project.find({ company: userId })
        .populate('designers.designer', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(50);
    }

    if (user.role === 'designer') {
      projects = await Project.find({ 'designers.designer': userId })
        .populate('company', 'companyName email')
        .sort({ createdAt: -1 })
        .limit(50);
    }

    const sentMessages = await User.aggregate([
      { $match: { _id: user._id } },
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'senderId',
          as: 'sent',
        },
      },
      {
        $project: {
          sentCount: { $size: '$sent' },
        },
      },
    ]);

    const receivedMessages = await User.aggregate([
      { $match: { _id: user._id } },
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'receiverId',
          as: 'received',
        },
      },
      {
        $project: {
          receivedCount: { $size: '$received' },
        },
      },
    ]);

    const latestMessages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: {
        user,
        requests,
        projects,
        messages: latestMessages,
        metrics: {
          sentCount: sentMessages[0]?.sentCount || 0,
          receivedCount: receivedMessages[0]?.receivedCount || 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
