const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, bio, skillsToTeach, skillsToLearn } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    const user = new User({
      name,
      email,
      phone,
      password,
      bio,
      skillsToTeach: skillsToTeach || [],
      skillsToLearn: skillsToLearn || []
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'skillsync_jwt_secret_key_2024',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        skillKarma: user.skillKarma,
        averageRating: user.averageRating,
        totalRatings: user.totalRatings,
        subscriptionPlan: user.subscriptionPlan,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'skillsync_jwt_secret_key_2024',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        skillKarma: user.skillKarma,
        averageRating: user.averageRating,
        totalRatings: user.totalRatings,
        subscriptionPlan: user.subscriptionPlan,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        skillKarma: user.skillKarma,
        averageRating: user.averageRating,
        totalRatings: user.totalRatings,
        subscriptionPlan: user.subscriptionPlan,
        isPremium: user.isPremium,
        joinedAt: user.joinedAt,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
