import mongoose from 'mongoose';

export const requireDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Please verify MONGODB_URI and network access.',
    });
  }

  return next();
};
