import Settings from '../models/Settings.js';

// @desc    Get salon settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // If no settings exist yet, create a default one
    if (!settings) {
      settings = await Settings.create({
        workingHours: {
          start: '09:00',
          end: '19:00',
          slotInterval: 30
        },
        blockedDates: [],
        walkInWaitTime: 15,
        showWaitTimeBanner: false
      });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update salon settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  const { workingHours, blockedDates, walkInWaitTime, showWaitTimeBanner } = req.body;

  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    if (workingHours) {
      if (workingHours.start) settings.workingHours.start = workingHours.start;
      if (workingHours.end) settings.workingHours.end = workingHours.end;
      if (workingHours.slotInterval) settings.workingHours.slotInterval = workingHours.slotInterval;
    }

    if (blockedDates !== undefined) {
      settings.blockedDates = blockedDates;
    }

    if (walkInWaitTime !== undefined) {
      settings.walkInWaitTime = walkInWaitTime;
    }

    if (showWaitTimeBanner !== undefined) {
      settings.showWaitTimeBanner = showWaitTimeBanner;
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
