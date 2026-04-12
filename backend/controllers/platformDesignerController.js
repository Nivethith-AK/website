import User from '../models/User.js';
import DesignerProfile from '../models/DesignerProfile.js';

export const getApprovedDesigners = async (_req, res) => {
  try {
    const designers = await User.find({ role: 'designer', isApproved: true }).select('-password');

    const profiles = await DesignerProfile.find({
      userId: { $in: designers.map((d) => d._id) },
    });

    const byUserId = new Map(profiles.map((p) => [String(p.userId), p]));

    const data = designers.map((designer) => {
      const profile = byUserId.get(String(designer._id));
      return {
        id: designer._id,
        name: designer.name,
        email: designer.email,
        role: designer.role,
        isApproved: designer.isApproved,
        profile: profile
          ? {
              skills: profile.skills,
              experienceLevel: profile.experienceLevel,
              portfolioImages: profile.portfolioImages,
              availability: profile.availability,
            }
          : null,
      };
    });

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
