const express = require('express');
const User = require('../models/User');
const Skill = require('../models/Skill');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const { premium, category } = req.query;
    let query = {};
    if (premium === 'true') {
      query.isPremium = true;
    } else if (premium === 'false') {
      query.isPremium = false;
    }
    if (category) {
      query.category = category;
    }
    const skills = await Skill.find(query).sort({ popularity: -1 });
    res.json({ skills });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/access/:skillName', authenticateToken, async (req, res) => {
  try {
    const { skillName } = req.params;
    const skill = await Skill.findOne({ name: new RegExp(skillName, 'i') });
    const user = await User.findById(req.userId);
    if (!skill) {
      return res.json({ hasAccess: true, isPremium: false });
    } 
    const hasAccess = !skill.isPremium || user.isPremium;
    res.json({ 
      hasAccess, 
      isPremium: skill.isPremium,
      userSubscription: user.subscriptionPlan,
      skill: skill
    });
  } catch (error) {
    console.error('Check skill access error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/popular', async (req, res) => {
  try {
    const teachableSkills = await User.aggregate([
      { $unwind: '$skillsToTeach' },
      { $group: { _id: '$skillsToTeach', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    const learningSkills = await User.aggregate([
      { $unwind: '$skillsToLearn' },
      { $group: { _id: '$skillsToLearn', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    res.json({
      teachableSkills: teachableSkills.map(s => ({ skill: s._id, count: s.count })),
      learningSkills: learningSkills.map(s => ({ skill: s._id, count: s.count }))
    });
  } catch (error) {
    console.error('Get popular skills error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }
    const suggestions = await User.aggregate([
      { $unwind: '$skillsToTeach' },
      { $match: { skillsToTeach: { $regex: q, $options: 'i' } } },
      { $group: { _id: '$skillsToTeach', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json({
      suggestions: suggestions.map(s => s._id)
    });
  } catch (error) {
    console.error('Get skill suggestions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;
