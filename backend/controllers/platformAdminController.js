import User from '../models/User.js';
import AgencyRequest from '../models/AgencyRequest.js';
import AgencyProject from '../models/AgencyProject.js';

export const approveDesigner = async (req, res) => {
  try {
    const { designerId } = req.body;

    if (!designerId) {
      return res.status(400).json({
        success: false,
        message: 'designerId is required',
      });
    }

    const designer = await User.findOneAndUpdate(
      { _id: designerId, role: 'designer' },
      { isApproved: true },
      { new: true }
    );

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Designer approved',
      data: designer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const assignProject = async (req, res) => {
  try {
    const { requestId, assignedDesigners = [] } = req.body;

    if (!requestId || !Array.isArray(assignedDesigners) || assignedDesigners.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'requestId and assignedDesigners are required',
      });
    }

    const request = await AgencyRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    request.status = 'approved';
    await request.save();

    const project = await AgencyProject.create({
      requestId,
      assignedDesigners,
      status: 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Project assigned successfully',
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
