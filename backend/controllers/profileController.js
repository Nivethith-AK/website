import User from '../models/User.js';

export const updateMyProfile = async (req, res) => {
  try {
    const { about, experience, skills, portfolio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        about: about ?? undefined,
        experience: experience ?? undefined,
        skills: Array.isArray(skills) ? skills : undefined,
        portfolio: Array.isArray(portfolio) ? portfolio : undefined,
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
