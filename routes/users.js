const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Subscription plans and pricing
const SUBSCRIPTION_PLANS = {
  free: { price: 0, duration: 0, features: ['Basic skill access', 'Community support'] },
  monthly: { price: 9.99, duration: 30, features: ['Premium skills access', 'Premium teachers', 'Priority support', 'Advanced analytics'] },
  yearly: { price: 99.99, duration: 365, features: ['Premium skills access', 'Premium teachers', 'Priority support', 'Advanced analytics', 'Exclusive workshops', '20% discount'] }
};

// Get subscription plans
router.get('/subscription/plans', (req, res) => {
  res.json({ plans: SUBSCRIPTION_PLANS });
});

// Subscribe to a plan
router.post('/subscription/subscribe', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid subscription plan' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate expiry date
    let expiryDate = null;
    if (plan !== 'free') {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + SUBSCRIPTION_PLANS[plan].duration);
    }

    user.subscriptionPlan = plan;
    user.subscriptionExpiry = expiryDate;
    await user.save();

    res.json({
      message: `Successfully subscribed to ${plan} plan`,
      user: {
        id: user._id,
        name: user.name,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpiry: user.subscriptionExpiry,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users with filtering
router.get('/', async (req, res) => {
  try {
    const { skill, minKarma, premium, search, sort } = req.query;
    
    let query = {};
    
    // Filter by skill
    if (skill) {
      query.skillsToTeach = { $in: [new RegExp(skill, 'i')] };
    }
    
    // Filter by minimum karma
    if (minKarma) {
      query.skillKarma = { $gte: parseInt(minKarma) };
    }
    
    // Filter by premium status
    if (premium === 'true') {
      query.subscriptionPlan = { $in: ['monthly', 'yearly'] };
    }
    
    // Search by name or skills
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skillsToTeach: { $in: [new RegExp(search, 'i')] } },
        { skillsToLearn: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let sortOptions = {};
    switch (sort) {
      case 'karma':
        sortOptions = { skillKarma: -1 };
        break;
      case 'rating':
        sortOptions = { averageRating: -1 };
        break;
      case 'recent':
        sortOptions = { lastActive: -1 };
        break;
      default:
        sortOptions = { skillKarma: -1 };
    }

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .limit(20);

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, bio, skillsToTeach, skillsToLearn } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if phone number is being changed and if it's already taken
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: req.userId } });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number already registered' });
      }
    }
    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (skillsToTeach) user.skillsToTeach = skillsToTeach;
    if (skillsToLearn) user.skillsToLearn = skillsToLearn;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
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
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard/top', async (req, res) => {
  try {
    const topKarma = await User.find()
      .select('name skillKarma averageRating totalRatings subscriptionPlan')
      .sort({ skillKarma: -1 })
      .limit(10);

    const topRated = await User.find({ totalRatings: { $gt: 0 } })
      .select('name skillKarma averageRating totalRatings subscriptionPlan')
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(10);

    res.json({
      topKarma,
      topRated
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;