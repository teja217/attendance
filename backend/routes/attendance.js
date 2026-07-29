const express = require('express');
const router = express.Router();
const { getAttendanceModel } = require('../models/db');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/attendance/mark
// @desc    Mark attendance for the day (Employee only)
// @access  Private
router.post('/mark', protect, async (req, res) => {
  const Attendance = getAttendanceModel();
  const { dateString, status } = req.body;
  
  let targetDateString = dateString;
  if (!targetDateString) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    targetDateString = `${yyyy}-${mm}-${dd}`;
  }

  try {
    const existingAttendance = await Attendance.findOne({
      user: req.user._id,
      dateString: targetDateString
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    const attendance = await Attendance.create({
      user: req.user._id,
      dateString: targetDateString,
      status: status || 'present',
      timestamp: new Date()
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/my
// @desc    Get current employee's attendance history
// @access  Private
router.get('/my', protect, async (req, res) => {
  const Attendance = getAttendanceModel();
  try {
    const history = await Attendance.find({ user: req.user._id }).sort({ timestamp: -1 });
    
    const totalDays = history.length;
    const presentDays = history.filter(item => item.status === 'present').length;
    const absentDays = history.filter(item => item.status === 'absent').length;

    res.json({
      history,
      stats: {
        totalDays,
        presentDays,
        absentDays,
        attendanceRate: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0"
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/all
// @desc    Get all attendance logs & stats (Admin only)
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
  const Attendance = getAttendanceModel();
  try {
    const logs = await Attendance.find({})
      .populate('user', 'name email')
      .sort({ timestamp: -1 });

    const totalLogs = logs.length;
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayString = `${yyyy}-${mm}-${dd}`;

    const todayLogs = logs.filter(log => log.dateString === todayString);
    const presentToday = todayLogs.filter(log => log.status === 'present').length;

    res.json({
      logs,
      stats: {
        totalLogs,
        presentToday,
        todayString
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
