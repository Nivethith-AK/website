import Message from '../models/Message.js';
import User from '../models/User.js';
import { getIO } from '../socket.js';

const MAX_MESSAGES_PER_MINUTE = 8;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const DUPLICATE_COOLDOWN_MS = 45 * 1000;

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!receiverId || !trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: 'receiverId and message are required',
      });
    }

    if (receiverId.toString() === senderId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message to yourself',
      });
    }

    if (trimmedMessage.length > 3000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long',
      });
    }

    const rateWindowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const recentSentCount = await Message.countDocuments({
      senderId,
      createdAt: { $gte: rateWindowStart },
    });

    if (recentSentCount >= MAX_MESSAGES_PER_MINUTE) {
      return res.status(429).json({
        success: false,
        message: 'Too many messages sent. Please wait a moment before sending more.',
      });
    }

    const duplicateWindowStart = new Date(Date.now() - DUPLICATE_COOLDOWN_MS);
    const duplicateMessage = await Message.findOne({
      senderId,
      receiverId,
      message: trimmedMessage,
      createdAt: { $gte: duplicateWindowStart },
    }).select('_id');

    if (duplicateMessage) {
      return res.status(429).json({
        success: false,
        message: 'Duplicate message detected. Please edit your message or wait a few seconds.',
      });
    }

    const receiver = await User.findById(receiverId).select('_id role');
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: trimmedMessage,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role');

    const io = getIO();
    const senderRoom = `user:${senderId}`;
    const receiverRoom = `user:${receiverId}`;

    io.to(senderRoom).emit('message:new', populatedMessage);
    io.to(receiverRoom).emit('message:new', populatedMessage);

    const receiverUnread = await Message.countDocuments({
      receiverId,
      isRead: false,
    });

    io.to(receiverRoom).emit('message:unread', { unread: receiverUnread });

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessagesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.user.id;
    const { limit = 200 } = req.query;
    const parsedLimit = Math.min(Number(limit) || 200, 500);

    await Message.updateMany(
      {
        senderId: userId,
        receiverId: me,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    const myUnread = await Message.countDocuments({
      receiverId: me,
      isRead: false,
    });

    const io = getIO();
    io.to(`user:${me}`).emit('message:unread', { unread: myUnread });

    const messages = await Message.find({
      $or: [
        { senderId: me, receiverId: userId },
        { senderId: userId, receiverId: me },
      ],
    })
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
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

export const getConversations = async (req, res) => {
  try {
    const me = req.user.id;
    const { limit = 200 } = req.query;
    const parsedLimit = Math.min(Number(limit) || 200, 500);

    const unreadMessages = await Message.find({
      receiverId: me,
      isRead: false,
    })
      .select('senderId')
      .lean();

    const unreadCountBySender = new Map();
    for (const item of unreadMessages) {
      const senderId = item.senderId.toString();
      unreadCountBySender.set(senderId, (unreadCountBySender.get(senderId) || 0) + 1);
    }

    const messages = await Message.find({
      $or: [{ senderId: me }, { receiverId: me }],
    })
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parsedLimit);

    const conversations = new Map();

    for (const item of messages) {
      const sender = item.senderId;
      const receiver = item.receiverId;

      if (!sender || !receiver) {
        continue;
      }

      const senderId = sender._id.toString();
      const isFromMe = senderId === me.toString();
      const partner = isFromMe ? receiver : sender;
      const partnerId = partner._id.toString();

      if (!conversations.has(partnerId)) {
        const unreadCount = unreadCountBySender.get(partnerId) || 0;

        conversations.set(partnerId, {
          partner: {
            _id: partner._id,
            name: partner.name,
            email: partner.email,
            role: partner.role,
          },
          lastMessage: item.message,
          lastMessageAt: item.createdAt,
          isFromMe,
          unreadCount,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: Array.from(conversations.values()),
      count: conversations.size,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const me = req.user.id;

    const totalUnread = await Message.countDocuments({
      receiverId: me,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      data: {
        unread: totalUnread,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const adminSendPrivateMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!receiverId || !trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: 'receiverId and message are required',
      });
    }

    const receiver = await User.findById(receiverId).select('_id');
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
    }

    const created = await Message.create({
      senderId,
      receiverId,
      message: trimmedMessage,
    });

    const populatedMessage = await Message.findById(created._id)
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role');

    const io = getIO();
    io.to(`user:${senderId}`).emit('message:new', populatedMessage);
    io.to(`user:${receiverId}`).emit('message:new', populatedMessage);

    const receiverUnread = await Message.countDocuments({
      receiverId,
      isRead: false,
    });

    io.to(`user:${receiverId}`).emit('message:unread', { unread: receiverUnread });

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
