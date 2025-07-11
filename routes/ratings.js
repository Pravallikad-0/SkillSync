const express = require('express');
const Rating = require('../models/Rating');
const User = require('../models/User');
const SkillRequest = require('../models/SkillRequest');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a rating
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { rateeId, requestId, rating, comment, skill } = req.body;

    // Check if request exists and is completed
    const request = await SkillRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({ error: 'Request must be completed before rating' });
    }

    // Check if user is involved in this request
    if (request.requester.toString() !== req.userId && 
        request.teacher.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Create rating
    const newRating = new Rating({
      rater: req.userId,
      ratee: rateeId,
      request: requestId,
      rating,
      comment,
      skill
    });

    await newRating.save();

    // Update user's average rating
    const userRatings = await Rating.find({ ratee: rateeId });
    const avgRating = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;
    
    await User.findByIdAndUpdate(rateeId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: userRatings.length,
      $inc: { skillKarma: rating } // Bonus karma for receiving ratings
    });

    await newRating.populate('rater', 'name');
    await newRating.populate('ratee', 'name');

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already rated this request' });
    }
    console.error('Create rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ratings for a user
router.get('/user/:id', async (req, res) => {
  try {
    const ratings = await Rating.find({ ratee: req.params.id })
      .populate('rater', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ ratings });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ratings given by a user
router.get('/given', authenticateToken, async (req, res) => {
  try {
    const ratings = await Rating.find({ rater: req.userId })
      .populate('ratee', 'name')
      .sort({ createdAt: -1 });

    res.json({ ratings });
  } catch (error) {
    console.error('Get given ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;