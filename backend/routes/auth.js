const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, JWT_SECRET } = require('../middleware/auth');

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

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

    // Sign the JWT token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' }, // Token expires in 7 days
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: user.toJSON()
        });
      }
    );
  } catch (err) {
    // Handle duplicate key error from MongoDB
    if (err.code === 11000) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Login with JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // If user doesn't exist, return specific error
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if password matches using the method we defined in the User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

    // Sign the JWT token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' }, // Token expires in 7 days
      (err, token) => {
        if (err) throw err;
        res.json({
          message: 'Login successful',
          token,
          user: user.toJSON()
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user (protected route)
router.get('/me', auth, async (req, res) => {
  try {
    // Get user from database (excluding password)
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token validity
router.get('/verify-token', auth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
