import AgencyRequest from '../models/AgencyRequest.js';

export const createRequest = async (req, res) => {
  try {
    const { projectDescription, designersNeeded, duration, budget } = req.body;

    if (!projectDescription || !designersNeeded || !duration) {
      return res.status(400).json({
        success: false,
        message: 'projectDescription, designersNeeded and duration are required',
      });
    }

    const request = await AgencyRequest.create({
      companyId: req.user.id,
      projectDescription,
      designersNeeded,
      duration,
      budget,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Request created',
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
