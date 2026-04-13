import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    message: {
      type: String,
      trim: true,
      default: '',
      maxlength: 3000,
    },
    attachments: [
      {
        fileName: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        mimeType: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1, createdAt: -1 });
messageSchema.index({ projectId: 1, createdAt: 1 });

messageSchema.pre('validate', function (next) {
  const hasText = typeof this.message === 'string' && this.message.trim().length > 0;
  const hasAttachment = Array.isArray(this.attachments) && this.attachments.length > 0;

  if (!hasText && !hasAttachment) {
    return next(new Error('Message text or attachment is required'));
  }

  return next();
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
