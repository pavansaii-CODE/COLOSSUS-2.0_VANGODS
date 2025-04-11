const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create and save new user
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    // Handle duplicate key error from MongoDB
    if (err.code === 11000) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Login (basic match by email/password, no token)
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    // If user doesn't exist, return specific error
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // If password doesn't match
    if (user.password !== req.body.password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Success case
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
