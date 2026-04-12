import Message from '../models/Message.js';
import User from '../models/User.js';

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: 'receiverId and message are required',
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
      senderId: req.user.id,
      receiverId,
      message,
    });

    return res.status(201).json({
      success: true,
      data: newMessage,
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

    const messages = await Message.find({
      $or: [
        { senderId: me, receiverId: userId },
        { senderId: userId, receiverId: me },
      ],
    })
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .sort({ createdAt: 1 });

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
