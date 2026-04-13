import Project from '../models/Project.js';
import Message from '../models/Message.js';
import { getIO } from '../socket.js';

export const getProjectConversations = async (req, res) => {
  try {
    const me = req.user.id;

    const projects = await Project.find({ participants: me })
      .populate('company', 'name email role')
      .populate('designers.designer', 'name email role firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(200);

    const data = projects.map((project) => ({
      _id: project._id,
      projectTitle: project.projectTitle,
      chatEnabled: project.chatEnabled,
      status: project.status,
      company: project.company,
      participants: [
        ...(project.company ? [project.company] : []),
        ...(project.designers || []).map((item) => item.designer).filter(Boolean),
      ],
    }));

    return res.status(200).json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProjectMessages = async (req, res) => {
  try {
    const me = req.user.id;
    const { projectId } = req.params;
    const { limit = 300 } = req.query;
    const parsedLimit = Math.min(Number(limit) || 300, 600);

    const project = await Project.findById(projectId).select('participants chatEnabled');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const allowed = (project.participants || []).some((id) => id.toString() === me.toString());
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this project chat',
      });
    }

    const messages = await Message.find({ projectId })
      .populate('senderId', 'name email role')
      .sort({ createdAt: 1 })
      .limit(parsedLimit);

    return res.status(200).json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendProjectMessage = async (req, res) => {
  try {
    const me = req.user.id;
    const { projectId } = req.params;
    const { message } = req.body;
    const trimmed = typeof message === 'string' ? message.trim() : '';

    if (!trimmed) {
      return res.status(400).json({
        success: false,
        message: 'message is required',
      });
    }

    const project = await Project.findById(projectId).select('participants chatEnabled');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!project.chatEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Project chat is disabled by admin',
      });
    }

    const allowed = (project.participants || []).some((id) => id.toString() === me.toString());
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this project chat',
      });
    }

    const created = await Message.create({
      senderId: me,
      receiverId: me,
      projectId,
      message: trimmed,
    });

    const populated = await Message.findById(created._id).populate('senderId', 'name email role');

    const io = getIO();
    for (const participantId of project.participants || []) {
      io.to(`user:${participantId.toString()}`).emit('project:message:new', {
        projectId,
        message: populated,
      });
    }

    return res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
