const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateString: {
    type: String, // format: "YYYY-MM-DD"
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only have one attendance record per day
AttendanceSchema.index({ user: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
