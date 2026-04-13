import Project from '../models/Project.js';
import Message from '../models/Message.js';
import { getIO } from '../socket.js';

const MAX_ATTACHMENTS_PER_MESSAGE = 5;

const allowedAttachmentMimeTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const mapAttachments = (files = []) => {
  return files.map((file) => ({
    fileName: file.filename,
    originalName: file.originalname,
    fileUrl: `/uploads/${file.filename}`,
    mimeType: file.mimetype,
    size: file.size,
  }));
};

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
    const attachments = mapAttachments(req.files || []);

    if (!trimmed && attachments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'message or attachment is required',
      });
    }

    if (attachments.length > MAX_ATTACHMENTS_PER_MESSAGE) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_ATTACHMENTS_PER_MESSAGE} attachments allowed per message`,
      });
    }

    const invalidAttachment = attachments.find((item) => !allowedAttachmentMimeTypes.has(item.mimeType));
    if (invalidAttachment) {
      return res.status(400).json({
        success: false,
        message: `Unsupported file type: ${invalidAttachment.mimeType}`,
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
      attachments,
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
