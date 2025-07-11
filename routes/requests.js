const express = require('express');
const SkillRequest = require('../models/SkillRequest');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a skill request

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { teacherId, skillRequested, skillOffered, message } = req.body;

    const requester = await User.findById(req.userId);
    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Check if skill is premium and user has access
    const Skill = require('../models/Skill');
    const skill = await Skill.findOne({ name: new RegExp(skillRequested, 'i') });
    
    if (skill && skill.isPremium && !requester.isPremium) {
      return res.status(403).json({ 
        error: 'This is a premium skill. Please upgrade your subscription to access it.',
        requiresPremium: true
      });
    }

    // Check if teacher is premium and user has access
    if (teacher.isPremium && !requester.isPremium) {
      return res.status(403).json({ 
        error: 'This teacher offers premium services. Please upgrade your subscription to learn from premium teachers.',
        requiresPremium: true
      });
    }
    // Check if skill is available
    if (!teacher.skillsToTeach.includes(skillRequested)) {
      return res.status(400).json({ error: 'Teacher does not offer this skill' });
    }

    // Create request
    const request = new SkillRequest({
      requester: req.userId,
      teacher: teacherId,
      skillRequested,
      skillOffered,
      message
    });

    await request.save();

    // Populate request with user details
    await request.populate('requester', 'name email');
    await request.populate('teacher', 'name email');

    res.status(201).json({
      message: 'Request sent successfully',
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's requests (sent and received)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const sentRequests = await SkillRequest.find({ requester: req.userId })
      .populate('teacher', 'name email skillsToTeach averageRating')
      .sort({ createdAt: -1 });

    const receivedRequests = await SkillRequest.find({ teacher: req.userId })
      .populate('requester', 'name email skillsToLearn averageRating')
      .sort({ createdAt: -1 });

    res.json({
      sentRequests,
      receivedRequests
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update request status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    const request = await SkillRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Only teacher can accept/decline, only requester can mark as completed
    if (status === 'accepted' || status === 'declined') {
      if (request.teacher.toString() !== req.userId) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    } else if (status === 'completed') {
      if (request.requester.toString() !== req.userId) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      request.completedAt = new Date();
      
      // Update teacher's karma
      if (request.status === 'accepted') {
        await User.findByIdAndUpdate(request.teacher, {
          $inc: { skillKarma: 5 }
        });
      }
    }

    request.status = status;
    await request.save();

    await request.populate('requester', 'name email');
    await request.populate('teacher', 'name email');

    res.json({
      message: 'Request updated successfully',
      request
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get request by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const request = await SkillRequest.findById(req.params.id)
      .populate('requester', 'name email skillsToLearn averageRating')
      .populate('teacher', 'name email skillsToTeach averageRating');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if user is involved in this request
    if (request.requester._id.toString() !== req.userId && 
        request.teacher._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;