import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id role isApproved isVerified');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found for this token',
      });
    }

    if (user.role !== 'admin' && !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before accessing this route',
      });
    }

    if (user.role !== 'admin' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval',
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      isApproved: user.isApproved,
      isVerified: user.isVerified,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

export const protect = authMiddleware;

export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

export const authorize = roleMiddleware;
