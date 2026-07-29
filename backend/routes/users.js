const express = require('express');
const router = express.Router();
const { getUserModel } = require('../models/db');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/users
// @desc    Create a new user (employee or admin)
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { name, email, password, role } = req.body;
  const User = getUserModel();

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter name, email and password' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (excluding passwords)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  const User = getUserModel();
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  const User = getUserModel();
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot delete their own account' });
    }

    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
